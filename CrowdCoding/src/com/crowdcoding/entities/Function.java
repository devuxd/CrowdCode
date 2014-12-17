package com.crowdcoding.entities;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.commons.lang3.StringUtils;

import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.commands.ProjectCommand;
import com.crowdcoding.commands.TestCommand;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.FunctionDescriptionDTO;
import com.crowdcoding.dto.MockDTO;
import com.crowdcoding.dto.ReusedFunctionDTO;
import com.crowdcoding.dto.TestCaseDTO;
import com.crowdcoding.dto.TestCasesDTO;
import com.crowdcoding.dto.TestDTO;
import com.crowdcoding.dto.firebase.FunctionInFirebase;
import com.crowdcoding.entities.microtasks.DebugTestFailure;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.entities.microtasks.ReuseSearch;
import com.crowdcoding.entities.microtasks.WriteCall;
import com.crowdcoding.entities.microtasks.WriteFunction;
import com.crowdcoding.entities.microtasks.WriteFunctionDescription;
import com.crowdcoding.entities.microtasks.WriteTest;
import com.crowdcoding.entities.microtasks.WriteTestCases;
import com.crowdcoding.history.MessageReceived;
import com.crowdcoding.history.MicrotaskSpawned;
import com.crowdcoding.history.PropertyChange;
import com.crowdcoding.util.FirebaseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.appengine.api.search.query.QueryParser.function_return;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Index;
import com.googlecode.objectify.cmd.Query;


/* A function represents a function of code. Functions transition through states, spawning microtasks,
 * which, upon completion, transition the state. Some of these microtasks may create other artifacts,
 * which also transition through states; these transitions may in turn be signaled back to a function.
 */
@EntitySubclass(index=true)
public class Function extends Artifact
{
	private String        code;
	@Index private String name;
	private String        returnType;
	private List<String>  paramNames = new ArrayList<String>();
	private List<String>  paramTypes = new ArrayList<String>();
	private List<String>  paramDescriptions = new ArrayList<String>();
	private String        header;
	private String        description;
	private List<Long>    tests = new ArrayList<Long>();
	private List<Boolean> testsImplemented = new ArrayList<Boolean>();
	private int           linesOfCode;

	// flags about the status of the function
	@Index private boolean isWritten;	     // true iff Function has no pseudocode and has been fully implemented (but may still fail tests)
	@Index private boolean hasBeenDescribed; // true iff Function is at least in the state described
	private boolean needsDebugging;	         // true iff Function is failing the (implemented) unit tests
	
	// fully implemented (i.e., not psuedo) calls made by this function
	private List<Long> callees = new ArrayList<Long>();
	// current callers with a fully implemented callsite to this function:
	private List<Long> callers = new ArrayList<Long>();
	// pseudocalls made by this function:
	private List<String> pseudoCalls = new ArrayList<String>();
	// pseudocall callsites calling this function (these two lists must be in sync)
	private List<String> pseudoCallsites = new ArrayList<String>();
	private List<Long>   pseudoCallers = new ArrayList<Long>();

	//////////////////////////////////////////////////////////////////////////////
	//  CONSTRUCTORS
	//////////////////////////////////////////////////////////////////////////////

	// Constructor for deserialization
	protected Function(){}

	// Constructor for a function that has a full description and code
	public Function(String name, String returnType, List<String> paramNames, List<String> paramTypes, List<String> paramDescriptions, String header,
			String description, String code, Project project)
	{
		super(project);
		writeDescriptionCompleted(name, returnType, paramNames, paramTypes, paramDescriptions, header, description, code, project);
	}

	// Constructor for a function that only has a short call description and still needs a full description
	public Function(String callDescription, Function caller, Project project)
	{
		super(project);
		isWritten = false;

		// Spawn off a microtask to write the function description
		makeMicrotaskOut(new WriteFunctionDescription(this, callDescription, caller, project), project);
	}

	//////////////////////////////////////////////////////////////////////////////
	//  ACCESSORS
	//////////////////////////////////////////////////////////////////////////////

	// Is the fucntion written and all the pseudocode replaced?
	// NOTE: Being written does not imply that all tests pass.
	public boolean isWritten()
	{
		return isWritten;
	}

	// Has the function been described (had a description written)?
	public boolean hasBeenDescribed()
	{
		return hasBeenDescribed;
	}

	public String getName()
	{
		return name;
	}

	public int getNumParams()
	{
		return paramNames.size();
	}

	public List<String> getParamNames()
	{
		return paramNames;
	}

	public String getHeader()
	{
		return header;
	}

	public String getEscapedHeader()
	{
		return StringEscapeUtils.escapeEcmaScript(header);
	}

	public String getDescription()
	{
		return description;
	}

	public String getCompleteDescription()
	{
		String fullDescription="/**\n" + description + "\n\n";

    	for(int i=0; i<paramNames.size(); i++)
			{
			if(paramDescriptions.size()>i)
				fullDescription += "  @param " + paramTypes.get(i) + ' ' + paramNames.get(i) + " - " + paramDescriptions.get(i) + "\n";

			}

		fullDescription += "\n  @return " + returnType + " \n**/\n";

		return fullDescription;
	}

	public String getEscapedDescription()
	{
		return StringEscapeUtils.escapeEcmaScript(description);
	}

	// Gets the description and the header
	public String getFullDescription()
	{
		return getCompleteDescription()+ "\n"  + header;
	}

	// Gets the description and the header
	public String getEscapedFullDescription()
	{
		return StringEscapeUtils.escapeEcmaScript(getFullDescription());
	}

	// gets the body of the function (including braces)
	public String getCode()
	{
		return code;
	}

	// gets the body of the function (including braces)
	public String getEscapedCode()
	{
		return StringEscapeUtils.escapeEcmaScript(code);
	}

	// Gets the description, header, and bady of the function
	public String getFullCode()
	{

		return getCompleteDescription()+ "\n"  + header + "\n" + code;
	}

	public String getEscapedFullCode()
	{
		return StringEscapeUtils.escapeEcmaScript(getFullCode());
	}

	// ------- TEST CASES

	public List<Ref<Test>> getTestCases(Project project)
	{
		// Build refs for each test case
		ArrayList<Ref<Test>> testRefs = new ArrayList<Ref<Test>>();
		for (long testID : tests)
			testRefs.add( (Ref<Test>) Ref.create(Artifact.getKey(testID, project)) );

		return testRefs;
	}

	// Deletes the specified test from the list of tests
	public void deleteTest(long testToDeleteID)
	{
		int position = tests.indexOf(testToDeleteID);
		if (position != -1)
		{
			tests.remove(position);
			testsImplemented.remove(position);
			ofy().save().entity(this).now();
		}
	}

	// Adds the specified test for this function
	public void addTest(long testID)
	{
		tests.add(testID);
		testsImplemented.add(false);

		ofy().save().entity(this).now();
	}

	// Gets a list of FunctionDescriptionDTOs for every function, formatted as a JSON string
	public static String getFunctionDescriptions(Project project)
	{
		List<FunctionDescriptionDTO> dtos = new ArrayList<FunctionDescriptionDTO>();
		Query<Function> q = ofy().load().type(Function.class)
				.ancestor(project.getKey()).filter("hasBeenDescribed", true);
		for (Function function : q)
			dtos.add(function.getDescriptionDTO());

		ObjectMapper mapper = new ObjectMapper();
		try
		{
		    return mapper.writeValueAsString(dtos);
		} catch (IOException e) {
			e.printStackTrace();
		}

	    return "";
	}

	public FunctionDescriptionDTO getDescriptionDTO()
	{
		return new FunctionDescriptionDTO(name, returnType, paramNames, paramTypes, paramDescriptions, header, description);
	}

	// Returns true iff the specified pseudocall is currently in the code
	public boolean containsPseudoCall(String pseudoCall)
	{
		return pseudoCalls.contains(pseudoCall);
	}


	//////////////////////////////////////////////////////////////////////////////
	//  PRIVATE CORE FUNCTIONALITY
	//////////////////////////////////////////////////////////////////////////////

	private void setWritten(boolean isWritten, Project project)
	{
		if (this.isWritten != isWritten)
		{
			this.isWritten = isWritten;
			ofy().save().entity(this).now();

			project.historyLog().beginEvent(new PropertyChange("implemented",Boolean.toString(isWritten), this));
			project.historyLog().endEvent();
		}
	}

	// Sets the function as being described
	private void setDescribed(Project project)
	{
		if (!this.hasBeenDescribed)
		{
			this.hasBeenDescribed = true;
			ofy().save().entity(this).now();
			notifyBecameDescribed(project);

			project.historyLog().beginEvent(new PropertyChange("hasBeenDescribed", "true", this));
			project.historyLog().endEvent();
		}
	}

	// If there is no microtask currently out for this artifact, looks at the queued microtasks.
	// If there is a microtasks available, marks it as ready to be done.
	protected void lookForWork(Project project)
	{
		// If there is currently not already a microtask being done on this function,
		// determine if there is work to be done
		if (!microtaskOut)
		{
			// Microtask must have been described, as there is no microtask out to describe it.
			if (isWritten && needsDebugging){
				DebugTestFailure debug = new DebugTestFailure(this,project);
				makeMicrotaskOut( debug, project);
				System.out.println("--> FUNCTION ("+this.id+") "+this.name+": debugTestFailure spawned with key "+Project.MicrotaskKeyToString(debug.getKey()));	
			}
			else if (!queuedMicrotasks.isEmpty())
				makeMicrotaskOut(ofy().load().ref(queuedMicrotasks.remove()).get(), project);
		}
	}

	// Determines if all unit tests are implemented (e.g., not merely described or currently disputed)
	private boolean allUnitTestsImplemented()
	{

		System.out.println("--> FUNCTION ("+this.id+") "+this.name+" :checking if all test implemented - ");
		
		if(tests.size()==0) 
			return false;
		else{
			for (Boolean implemented:testsImplemented)
			{
				if( !implemented )
					return false;
			}
		}

		// Assume all unit tests are implemented, and run tests whenever anyone requests them to be run.
		// TODO: do we need to do this more intelligently?

		//if there are no unit tests, the tests aren't all ready yet, so return false...
		//otherwise, you've gotten here and all the unit tests are implemented

		return true;
	}

	private void runTestsIfReady(Project project)
	{
		Boolean allImplemented = allUnitTestsImplemented();
		System.out.println("------> "+allImplemented);
		if(isWritten && allImplemented){
			// enqueue test job in firebase
			System.out.println("--> FUNCTION ("+this.id+") "+this.name+" : write entry in test job queue");
			FirebaseService.writeTestJobQueue(this.getID(),project);

			//project.requestTestRun();
		}
	}

	private void onWorkerEdited(FunctionDTO dto, Project project)
	{
		// Check if the description or header changed (ignoring whitespace changes).
		// If so, generate DescriptionChange microtasks for callers and tests.
		String strippedOldFullDescrip = (this.getCompleteDescription() + this.header).replace(" ", "").replace("\n", "");
		String strippedNewFullDescrip = (dto.getCompleteDescription() + dto.header).replace(" ", "").replace("\n", "");

		if (!strippedOldFullDescrip.equals(strippedNewFullDescrip))
			notifyDescriptionChanged(dto, project);

		// Update the function data
		this.code = dto.code;
		this.name = dto.name;
		this.description = dto.description;
		this.header = dto.header;
		this.paramNames = dto.paramNames;
		this.paramTypes=dto.paramTypes;
		this.paramDescriptions=dto.paramDescriptions;
		this.returnType=dto.returnType;
		linesOfCode = StringUtils.countMatches(dto.code, "\n") + 2;

		// Looper over all of the callers, rebuilding our list of callers
		rebuildCalleeList(dto.calleeIds, project);

		// Look for pseudocode and psuedocalls
		List<String> currentPseudoCalls = findPseudocalls(code);
		List<String> newPseudoCalls = new ArrayList<String>();

		if(currentPseudoCalls.isEmpty())
		{
			List<String> pseudoCode = findPseudocode(code);
			if(pseudoCode.isEmpty())
			{
				setWritten(true, project);
				runTestsIfReady(project);
			}
			else
			{
				setWritten(false, project);
				queueMicrotask(new WriteFunction(this, project), project);
			}
		}
		else
		{
			for (String callDescription : currentPseudoCalls)
			{
				if (!pseudoCalls.contains(callDescription))
				{
					setWritten(false, project);

					//for any currentPseudoCall not in pseudoCalls, add it
					newPseudoCalls.add(callDescription);
					// Spawn microtask immediately, as it does not require access to the function itself
					Microtask microtask = new ReuseSearch(this, callDescription, project);
					ProjectCommand.queueMicrotask(microtask.getKey(), null);
				}
			}
		}

		// Update the list of pseudocalls to match the current (distinct) pseudocalls now in the code
		this.pseudoCalls = newPseudoCalls;

		ofy().save().entity(this).now();
		lookForWork(project);
	}

	// Diffs the new and old callee list, sending notifications to callees about who their
	// callers are as appropriate. Updates the callee list when done
	private void rebuildCalleeList(List<Long> calleeIds, Project project)
	{
		// First, find new callees added, if any
		List<Long> newCallees = new ArrayList<Long>(calleeIds);
		newCallees.removeAll(this.callees);

		// If there are any, send notifications to these functions that they have a new caller
		for (Long newCalleeId : newCallees)
		{
			//Function callee = lookupFunction(newCalleeId, project);

	//		if (callee != null)
			FunctionCommand.addCaller(newCalleeId, this.id);
		}

		// Next, find any callees removed, if any
		List<Long> removedCallees = new ArrayList<Long>(this.callees);
		removedCallees.remove(calleeIds);

		// Send notifications to these functions that they no longer have this caller
		for (Long removedCalleeIds : removedCallees)
		{
			//Function callee = lookupFunction(removedCalleeName, project);
			//if (callee != null)
				FunctionCommand.removeCaller(removedCalleeIds, this.id);
		}

		this.callees = newCallees;
		ofy().save().entity(this).now();
	}

	//////////////////////////////////////////////////////////////////////////////
	//  MICROTASK COMPLETION HANDLERS
	//////////////////////////////////////////////////////////////////////////////

	public void sketchCompleted(FunctionDTO dto, Project project)
	{
		microtaskOutCompleted();
		onWorkerEdited(dto, project);
		//if don't exists test and the submit is from a dispute
		//respawn the write test case microtask
		System.out.println("--> FUNCTION ("+this.id+") "+this.name+" : dispute text "+dto.disputeText);
		if(dto.disputeText!=null && tests.size()==0)
			queueMicrotask(new WriteTestCases(this, project),project);
	}

	public void reuseSearchCompleted(ReusedFunctionDTO dto, String callDescription, Project project)
	{
		Function callee;

		if (dto.noFunction)
		{
			// Create a new function for this call, spawning microtasks to create it.
			callee = new Function(callDescription, this, project);
			dto.functionId = callee.getID();
		}
		else
		{
			// lookup the function by name
			Key<Function> key = Key.create(Function.class,dto.functionName);
			//Key<Artifact> key = Key.create(Artifact.class, dto.functionId);
			callee = (Function) ofy().load().key( key ).get();//ancestor(project.getKey()).filter("name", dto.functionName).first().get();
		}

		// Have the callee let us know when it's tested (which may already be true;
		// signal sent immediately in that case)
		FunctionCommand.addDependency(dto.functionId, this.getID(), callDescription);
	}

	public void writeDescriptionCompleted(String name, String returnType, List<String> paramNames, List<String> paramTypes,
			List<String> paramDescriptions, String header, String description, String code, Project project)
	{
		microtaskOutCompleted();
		this.name = name;
		this.returnType = returnType;
		this.paramNames = paramNames;
		this.paramTypes = paramTypes;
		this.paramDescriptions = paramDescriptions;
		this.header = header;
		this.description = description;
		this.code = code;
		this.linesOfCode = StringUtils.countMatches(this.code, "\n") + 2;

		ofy().save().entity(this).now();

		setDescribed(project);

		//Spawn off microtask to write test cases. As it does not impact the artifact itself,
		// the microtask can be directly started rather than queued.
		WriteTestCases writeTestCases = new WriteTestCases(this, project);
		ProjectCommand.queueMicrotask(writeTestCases.getKey(), null);

//		project.historyLog().beginEvent(new MicrotaskSpawned(writeTestCases));
//		project.historyLog().endEvent();
//		project.publishHistoryLog();


		// Spawn off microtask to sketch the method
		queueMicrotask(new WriteFunction(this, project), project);
	}

	public void writeTestCasesCompleted(TestCasesDTO dto, Project project)
	{
		microtaskOutCompleted();

		if(dto.isFunctionDispute){
			ofy().save().entity(this).now();
			FunctionCommand.disputeFunctionSignature(this.id, dto.disputeText);


			lookForWork(project);
		}
		else{

			for (TestCaseDTO testCase : dto.testCases)
			{
				// Note: the id in the testCase is *only* valid for testcases where added is false.

				// If it's an add, create a test
				if (testCase.added)
				{
					TestCommand.create(testCase.text, this.id, this.name, testCase.functionVersion);
				}
				// else if is a delete, remove the test
				else if (testCase.deleted)
				{
					TestCommand.delete(testCase.id);
					deleteTest(testCase.id);
				}
				else
				{
					// Check if it was edited
					Ref<Test> testRef = Test.find(testCase.id, project);
					Test test = testRef.get();
					if (!test.getDescription().equals(testCase.text))
					{
						String oldDescription = test.getDescription();
						test.setDescription(testCase.text);
						test.queueMicrotask(new WriteTest(project, test, oldDescription, testCase.functionVersion), project);
					}
				}
			}
			ofy().save().entity(this).now();
			lookForWork(project);
		}


	}

	public void writeCallCompleted(FunctionDTO dto, Project project)
	{
		microtaskOutCompleted();
		onWorkerEdited(dto, project);
	}

	public void debugTestFailureCompleted(FunctionDTO dto, Project project)
	{
		microtaskOutCompleted();
		this.needsDebugging = false;

		// Check to see if there any disputed tests
		//Current: If it doesn't have a test case number indicating a dispute, all passed.
		//That should change in the future, to indicate which ones passed
		if(dto.testId != null)
		{
			// creates a disputed test case
			int position = tests.indexOf((long)dto.testId);
			TestCommand.dispute(tests.get(position), dto.description, version);

			// Since there was an issue, ignore any code changes they may have submitted.
		} else { //at present, reaching here means all tests passed.
			this.needsDebugging = false;
			if(!this.code.trim().equals(dto.code.trim()))
			{ //integrate the new changes
				onWorkerEdited(dto, project);
			}
		}

		// Save the entity again to the datastore
		ofy().save().entity(this).now();


		// Update or create tests for any stub
		for (TestDTO testDTO : dto.stubs)
		{
			TestCommand.create(testDTO.functionID,testDTO.functionName,testDTO.description,testDTO.simpleTestInputs,testDTO.simpleTestOutput,testDTO.code,this.version);
		}

		lookForWork(project);
	}

	//////////////////////////////////////////////////////////////////////////////
	//  COMMAND HANDLERS
	//////////////////////////////////////////////////////////////////////////////

	// This method notifies the function that it has just passed all of its tests.
	public void passedTests(Project project)
	{
		if (this.needsDebugging)
		{
			project.historyLog().beginEvent(new MessageReceived("PassedTests", this));
			this.needsDebugging = false;
			ofy().save().entity(this).now();

			lookForWork(project);
			project.historyLog().endEvent();
		}
	}

	// This method notifies the function that it has failed at least one of its tests
	public void failedTests(Project project)
	{
		if (isWritten && !needsDebugging)
		{
			project.historyLog().beginEvent(new MessageReceived("FailedTests", this));
			this.needsDebugging = true;
			ofy().save().entity(this).now();

			lookForWork(project);
			project.historyLog().endEvent();
		}
	}

	public void failedTest(Test test,Project project)
	{
		if (isWritten && !needsDebugging)
		{
			project.historyLog().beginEvent(new MessageReceived("FailedTests", this));
			this.needsDebugging = true;
			//this.failedTest     = test;
			ofy().save().entity(this).now();

			lookForWork(project);
			project.historyLog().endEvent();
		}
	}

	// Provides notification that a test has transitioned to being implemented
	public void testBecameImplemented(Test test, Project project)
	{
		int position = tests.indexOf(test.getID());
		testsImplemented.set(position, true);

		runTestsIfReady(project);
	}

	// Notifies the function that it has a new caller function
	public void addCaller(Function function)
	{
		callers.add(function.getID());
		ofy().save().entity(this).now();
	}

	// Notifies the function that it is no longer called by function
	public void removeCaller(Function function)
	{
		callers.remove((Ref<Function>) Ref.create(function.getKey()));
		ofy().save().entity(this).now();
	}

	public void addDependency(long newSubscriber, String pseudoCall, Project project)
	{
		//add it to the lists
		pseudoCallers.add(newSubscriber);
		pseudoCallsites.add(pseudoCall);

		//if it's already been described, send the notification to the new subscriber (only) immediately.
		if(hasBeenDescribed())
			sendDescribedNotification(newSubscriber, pseudoCall, project);

		ofy().save().entity(this).now();
	}

	public void calleeBecameDescribed(String calleeFullDescription, String pseudoCall, Project project)
	{
		project.historyLog().beginEvent(new MessageReceived("AddCall", this));
		queueMicrotask(new WriteCall(this, calleeFullDescription, pseudoCall, project), project);
		project.historyLog().endEvent();
	}

	public void calleeChangedInterface(String oldFullDescription, String newFullDescription, Project project)
	{
		queueMicrotask(new WriteFunction(this, oldFullDescription, newFullDescription, project), project);
	}

	public void disputeTestCases(String issueDescription, String testDescription, Project project)
	{
		queueMicrotask(new WriteTestCases(this, issueDescription, testDescription, project), project);
	}
	public void disputeFunctionSignature(String issueDescription, Project project)
	{
		queueMicrotask(new WriteFunction(this, issueDescription, project), project);
	}


	//////////////////////////////////////////////////////////////////////////////
	//   NOTIFICATION SENDERS
	//////////////////////////////////////////////////////////////////////////////

	// Notify all subscribers that this function has become described.
	private void notifyBecameDescribed(Project project)
	{
		// Loop over the psuedocallsites and pseudocallers in parallel
		for (int i = 0; i < pseudoCallsites.size(); i++)
			sendDescribedNotification(pseudoCallers.get(i), pseudoCallsites.get(i), project);
	}

	private void sendDescribedNotification(long subscriberID, String pseudoCall, Project project)
	{
		FunctionCommand.calleeBecameDescribed(subscriberID, this.getFullDescription(), pseudoCall);
	}

	// Send out notifications, as appropriate, that the description or header of this
	// function has changed
	private void notifyDescriptionChanged(FunctionDTO dto, Project project)
	{
		for (long callerID : callers)
			FunctionCommand.calleeChangedInterface(callerID, this.getFullDescription(), dto.getCompleteDescription() + dto.header);

		for (long testID : tests)
			TestCommand.functionChangedInterface(testID, this.getFullDescription(), dto.getCompleteDescription() + dto.header, version);
	}

	//////////////////////////////////////////////////////////////////////////////
	//  UTILITY METHODS
	//////////////////////////////////////////////////////////////////////////////

	public void storeToFirebase(Project project)
	{
		if (hasBeenDescribed)
		{
			incrementVersion();
			FirebaseService.writeFunction(new FunctionInFirebase(name, this.id, version, returnType, paramNames,
					paramTypes, paramDescriptions, header, description, code, linesOfCode, hasBeenDescribed, isWritten, needsDebugging,
					queuedMicrotasks.size()),
					this.id, version, project);
		}
	}

	// Looks up a Function object by name. Returns the function or null if no such function exists
	public static Function lookupFunction(String name, Project project)
	{
		//TO FIX NOT WORKING
		Ref<Function> ref = ofy().load().type(Function.class).ancestor(project.getKey()).filter("name", name).first();
		System.out.println("--> FUNCTION "+name+": lookup "+ref);

		if (ref == null)
			return null;
		else
			return ref.get();
	}

	// Looks through a string of a function's implementation and returns a list
	// of lines (may be empty) which are the pseudocode for the function call
	private List<String> findPseudocalls(String code)
	{
		return findSpecialLines(code, "//!");
	}

	private List<String> findPseudocode(String code)
	{
		return findSpecialLines(code, "//#");
	}

	// Finds segments of lines in a string of code starting with linestarter
	private List<String> findSpecialLines(String code, String starter)
	{
		int starterLength = starter.length();

		String searchCode = code;

		List<String> results = new ArrayList<String>();
		int index = 0;

		while (true)
		{
			String segment;
			index = searchCode.indexOf(starter, index);
			if (index == -1)
				break;

			 // We found a match. Take the whole line (or to the end if this is the last line)
			int nextLineStart = searchCode.indexOf("\n", index + 1);
			if (nextLineStart == -1)
				segment = searchCode.substring(index + starterLength);
			else
				segment = searchCode.substring(index + starterLength, nextLineStart);

			// add to collection
			results.add(segment);

			// If we hit the end of the string (no more new lines), we're done. Otherwise update to the next line.
			if (nextLineStart == -1)
				break;
			else
				index = nextLineStart;
		}

		return results;
	}

	// Given a ref to a function that has not been loaded from the datastore,
	// load it and get the object
	public static Function load(Ref<Function> ref)
	{
		return ofy().load().ref(ref).get();
	}

	// Given an id for a functon, finds the corresponding function. Returns null if no such function exists.
	public static Ref<Function> find(long id, Project project)
	{
		return (Ref<Function>) ofy().load().key(Artifact.getKey(id, project));
	}

	public boolean equals(Object function)
	{
		if(function instanceof Function)
		{
			return this.id == ((Function) function).id;
		}
		else
		{
			return false;
		}
	}

	public String toString()
	{
		return "\n FUNCTION " + name + 
			"\n described: " + hasBeenDescribed + 
			"\n written: " + isWritten + 
			"\n needsDebugging: " + needsDebugging + 
			"\n queuedMicrotasks: " + queuedMicrotasks.size();
	}

	public String fullToString()
	{
		return toString() + "\n" + getFullCode();
	}
}
