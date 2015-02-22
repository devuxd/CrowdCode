package com.crowdcoding.entities;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.commons.lang3.StringUtils;

import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.commands.ProjectCommand;
import com.crowdcoding.commands.TestCommand;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.PseudoFunctionDTO;
import com.crowdcoding.dto.ReusedFunctionDTO;
import com.crowdcoding.dto.TestCaseDTO;
import com.crowdcoding.dto.TestCasesDTO;
import com.crowdcoding.dto.TestDTO;
import com.crowdcoding.dto.TestDescriptionDTO;
import com.crowdcoding.dto.firebase.FunctionInFirebase;
import com.crowdcoding.entities.microtasks.DebugTestFailure;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.entities.microtasks.ReuseSearch;
import com.crowdcoding.entities.microtasks.WriteCall;
import com.crowdcoding.entities.microtasks.WriteFunction;
import com.crowdcoding.entities.microtasks.WriteFunctionDescription;
import com.crowdcoding.entities.microtasks.WriteTest;
import com.crowdcoding.entities.microtasks.WriteTestCases;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.history.MessageReceived;
import com.crowdcoding.history.PropertyChange;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.LoadResult;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Subclass;
import com.googlecode.objectify.annotation.Index;
import com.googlecode.objectify.cmd.Query;
import com.sun.org.apache.bcel.internal.generic.NEWARRAY;


/* A function represents a function of code. Functions transition through states, spawning microtasks,
 * which, upon completion, transition the state. Some of these microtasks may create other artifacts,
 * which also transition through states; these transitions may in turn be signaled back to a function.
 */
@Subclass(index=true)
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
	private List<String>  testsDescription = new ArrayList<String>();
	private int           linesOfCode;
	private boolean 	  readOnly= false;
	private boolean 	  waitForTestResult=true;
	private Queue<Ref<Microtask>> queuedWriteTestCase = new LinkedList<Ref<Microtask>>();

	// flags about the status of the function
	@Index private boolean isWritten;	     // true iff Function has no pseudocode and has been fully implemented (but may still fail tests)
	@Index private boolean hasBeenDescribed; // true iff Function is at least in the state described
	private boolean isNeeded;
	private boolean needsDebugging=true;	         // true iff Function is failing the (implemented) unit tests

	// fully implemented (i.e., not psuedo) calls made by this function
	private List<Long> callees = new ArrayList<Long>();
	// current callers with a fully implemented callsite to this function:
	private List<Long> callers = new ArrayList<Long>();
	// pseudocalls made by this function:
	private List<String> pseudoFunctionsDescription = new ArrayList<String>();
	private List<String> pseudoFunctionsName = new ArrayList<String>();

	// pseudocall callsites calling this function (these two lists must be in sync)
	private List<String> pseudoCallsites = new ArrayList<String>();
	private List<Long>   pseudoCallers = new ArrayList<Long>();

	private boolean testCaseOut=false;

	//////////////////////////////////////////////////////////////////////////////
	//  CONSTRUCTORS
	//////////////////////////////////////////////////////////////////////////////

	// Constructor for deserialization
	protected Function(){}

	// Constructor for a function that has a full description and code
	public Function(String name, String returnType, List<String> paramNames, List<String> paramTypes, List<String> paramDescriptions, String header,
			String description, String code, boolean readOnly, String projectId)
	{
		super(projectId);
		//this.needsDebugging=true;
		this.readOnly=readOnly;
		isWritten = false;
		this.isNeeded=true;
		writeDescriptionCompleted(name, returnType, paramNames, paramTypes, paramDescriptions, header, description, code, projectId);
	}

	// Constructor for a function that only has a short call description and still needs a full description
	public Function(String callDescription, Function caller, String projectId)
	{
		super(projectId);
		//this.needsDebugging=true;

		isWritten = false;
		hasBeenDescribed=false;
		this.description=callDescription;
		this.isNeeded=false;
		ofy().save().entity(this).now();

		// Spawn off a microtask to write the function description
		makeMicrotaskOut(new WriteFunctionDescription(this, callDescription, caller, projectId));
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

		return fullDescription + getParametersAndReturn();
	}
	public String getParametersAndReturn()
	{
		String fullDescription="";
		for(int i=0; i<paramNames.size(); i++)
		{
			if(paramDescriptions.size()>i)
				fullDescription += "  @param " + paramTypes.get(i) + ' ' + paramNames.get(i) + " - " + paramDescriptions.get(i) + "\n";

		}

	return fullDescription += "\n  @return " + returnType + " \n**/\n";
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
	public boolean isTestCaseOut()
	{
		return testCaseOut;
	}

	public boolean setTestCaseOut()
	{
		return testCaseOut;
	}


	// ------- TEST CASES

	private void testCaseOutCompleted()
	{
		testCaseOut=false;
	}

	public List<Ref<Test>> getTestCases(String projectId)
	{
		// Build refs for each test case
		ArrayList<Ref<Test>> testRefs = new ArrayList<Ref<Test>>();
		for (long testID : tests)
			testRefs.add( (Ref<Test>) Ref.create( Artifact.getKey(testID) ) );

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
			testsDescription.remove(position);
			ofy().save().entity(this).now();
		}
	}

	// Adds the specified test for this function
	public void addTest(long testID, String testDescription)
	{
		this.needsDebugging=true;
		tests.add(testID);
		testsImplemented.add(false);
		testsDescription.add(testDescription);
		ofy().save().entity(this).now();
	}

	// Gets a list of FunctionDescriptionDTOs for every function, formatted as a JSON string
	/*public static String getFunctionDescriptions(Project project)
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
	}*/
 /*
	public FunctionDescriptionDTO getDescriptionDTO()
	{
		return new FunctionDescriptionDTO(name, returnType, paramNames, paramTypes, paramDescriptions, header, description);
	}
*/
	// Returns true iff the specified pseudocall is currently in the code
	/*public boolean containsPseudoCall(String pseudoCall)
	{
		return pseudoCalls.contains(pseudoCall);
	}
*/

	//////////////////////////////////////////////////////////////////////////////
	//  PRIVATE CORE FUNCTIONALITY
	//////////////////////////////////////////////////////////////////////////////

	private void setWritten(boolean isWritten, String projectId)
	{
		if (this.isWritten != isWritten)
		{
			this.isWritten = isWritten;
			ofy().save().entity(this).now();

			HistoryLog.Init(projectId).addEvent(new PropertyChange("implemented",Boolean.toString(isWritten), this));
		}
	}

	// Sets the function as being described
	private void setDescribed(String projectId)
	{
		if (!this.hasBeenDescribed)
		{
			this.hasBeenDescribed = true;
			ofy().save().entity(this).now();
			notifyBecameDescribed(projectId);

			HistoryLog.Init(projectId).addEvent(new PropertyChange("hasBeenDescribed", "true", this));
		}
	}

	// If there is no microtask currently out for this artifact, looks at the queued microtasks.
	// If there is a microtasks available, marks it as ready to be done.
	protected void lookForWork()
	{
		//if the function is needed
		if(this.isNeeded){
			// If there is currently not already a microtask being done on this function,
			// determine if there is work to be done
			if ( !microtaskOut && !queuedMicrotasks.isEmpty())
				makeMicrotaskOut( ofy().load().ref(queuedMicrotasks.remove()).now() );

			if (!testCaseOut && !queuedWriteTestCase.isEmpty())
				makeTestCaseOut( ofy().load().ref(queuedWriteTestCase.remove()).now() );

			if ( !microtaskOut && !testCaseOut)
			{
				// Microtask must have been described, as there is no microtask out to describe it.
				if (isWritten && this.needsDebugging && !this.waitForTestResult){
					DebugTestFailure debug = new DebugTestFailure(this,projectId);
					makeMicrotaskOut( debug );
					System.out.println("-----> FUNCTION ("+this.id+") "+this.name+": debugTestFailure spawned with key "+ Microtask.keyToString(debug.getKey()));
				}
			}
		}
	}



	// Makes the specified microtask out for work
	protected void makeTestCaseOut(Microtask microtask)
	{
		ProjectCommand.queueMicrotask(microtask.getKey(), null);
		testCaseOut = true;
		ofy().save().entity(this).now();
	}
	// Queues the specified microtask and looks for work
	public void queueMicrotask(Microtask microtask, String projectId)
	{
		queuedMicrotasks.add(Ref.create(microtask.getKey()));
		ofy().save().entity(this).now();
		lookForWork();
	}

	// Determines if all unit tests are implemented (e.g., not merely described or currently disputed)
	private boolean allUnitTestsImplemented()
	{

//		System.out.println("--> FUNCTION ("+this.id+") "+this.name+" :checking if all test implemented - ");

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

	private void runTestsIfReady()
	{
		Boolean allImplemented = allUnitTestsImplemented();
		if(isWritten && allImplemented && this.needsDebugging){
			// enqueue test job in firebase
			this.waitForTestResult=true;
			System.out.println("-->>>> FUNCTION ("+this.getID()+") "+this.name+" : write entry in test job queue");
			FunctionCommand.writeTestJobQueue(this.getID());
		}
	}

	private void onWorkerEdited(FunctionDTO dto, String projectId)
	{
		this.needsDebugging=true;
		// Check if the description or header changed (ignoring whitespace changes).
		// If so, generate DescriptionChange microtasks for callers and tests.
		String strippedOldFullDescrip = (this.getParametersAndReturn()+this.name).replace(" ", "").replace("\n", "");
		String strippedNewFullDescrip = (dto.getParametersAndReturn()+dto.name).replace(" ", "").replace("\n", "");

		if (!strippedOldFullDescrip.equals(strippedNewFullDescrip))
			notifyDescriptionChanged(dto);

		
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
		rebuildCalleeList(dto.calleeIds);

		// Look for pseudocode and psuedocalls
		List<PseudoFunctionDTO> submittedPseudoFunctions = dto.pseudoFunctions;
		List<String> newPseudoFunctionsName = new ArrayList<String>();
		List<String> newPseudoFunctionsDescription = new ArrayList<String>();
		if(submittedPseudoFunctions.isEmpty())
		{
			List<String> pseudoCode = findPseudocode(code);
			if(pseudoCode.isEmpty())
			{
				setWritten(true,projectId);
				runTestsIfReady();
			}
			else
			{
				setWritten(false,projectId);
				queueMicrotask(new WriteFunction(this,projectId), projectId);
			}
		}
		else
		{
			for (PseudoFunctionDTO submittedPseudoFunction : submittedPseudoFunctions)
			{
				if (!pseudoFunctionsName.contains(submittedPseudoFunction.name))
				{
					setWritten(false, projectId);

					// Spawn microtask immediately, as it does not require access to the function itself
					Microtask microtask = new ReuseSearch(this, submittedPseudoFunction.description, projectId);
					ProjectCommand.queueMicrotask(microtask.getKey(), null);
				}
				newPseudoFunctionsDescription.add(submittedPseudoFunction.description);
				newPseudoFunctionsName.add(submittedPseudoFunction.name);
			}
			this.pseudoFunctionsName=newPseudoFunctionsName;
			this.pseudoFunctionsDescription= newPseudoFunctionsDescription;

		}

		// Update the list of pseudocalls to match the current (distinct) pseudocalls now in the code

		ofy().save().entity(this).now();
		lookForWork();
	}

	// Diffs the new and old callee list, sending notifications to callees about who their
	// callers are as appropriate. Updates the callee list when done
	private void rebuildCalleeList(List<Long> calleeIds)
	{
		// First, find new callees added, if any
		List<Long> newCallees = new ArrayList<Long>(calleeIds);
		newCallees.removeAll(this.callees);

		// If there are any, send notifications to these functions that they have a new caller
		for (Long newCalleeId : newCallees)
		{
			FunctionCommand.addCaller(newCalleeId, this.id);
		}

		// Next, find any callees removed, if any
		List<Long> removedCallees = new ArrayList<Long>(this.callees);
		removedCallees.remove(calleeIds);

		// Send notifications to these functions that they no longer have this caller
		for (Long removedCalleeIds : removedCallees)
		{
			FunctionCommand.removeCaller(removedCalleeIds, this.id);
		}

		this.callees = newCallees;
		ofy().save().entity(this).now();
	}

	//////////////////////////////////////////////////////////////////////////////
	//  MICROTASK COMPLETION HANDLERS
	//////////////////////////////////////////////////////////////////////////////

	public void sketchCompleted(FunctionDTO dto, String projectId)
	{
		microtaskOutCompleted();
		onWorkerEdited(dto, projectId);
		//if don't exists test and the submit is from a dispute
		//respawn the write test case microtask

		if(dto.disputeText!=null)
			queueWriteTestCase(new WriteTestCases(this, projectId));
	}

	public void reuseSearchCompleted(ReusedFunctionDTO dto, String callDescription, String projectId)
	{
		Function callee;

		if (dto.noFunction)
		{
			// Create a new function for this call, spawning microtasks to create it.
			callee = new Function(callDescription, this, projectId);
			callee.storeToFirebase(projectId);
			dto.functionId = callee.getID();
		}
		// Have the callee let us know when it's tested (which may already be true;
		// signal sent immediately in that case)
		FunctionCommand.addDependency(dto.functionId, this.getID(), callDescription);
	}

	public void writeDescriptionCompleted(String name, String returnType, List<String> paramNames, List<String> paramTypes,
			List<String> paramDescriptions, String header, String description, String code, String projectId)
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
		System.out.println("Entity function saved with id "+this.id);

		setDescribed(projectId);

		//Spawn off microtask to write test cases. As it does not impact the artifact itself,
		// the microtask can be directly started rather than queued.
		WriteTestCases writeTestCases = new WriteTestCases(this, projectId);
		queueWriteTestCase(writeTestCases);



		// Spawn off microtask to sketch the method
		queueMicrotask(new WriteFunction(this, projectId), projectId);
	}

	public void writeTestCasesCompleted(TestCasesDTO dto, String projectId)
	{
		testCaseOutCompleted();

		if(dto.inDispute){
			disputeFunctionSignature(dto.disputeFunctionText, projectId);
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
					int position = tests.indexOf((long)testCase.id);
					if (!testsDescription.get(position).equals(testCase.text))
					{
						testsDescription.set(position, testCase.text);
						TestCommand.testEdited(testCase.id, testCase.text, testCase.functionVersion);
					}
				}
			}
			ofy().save().entity(this).now();
			lookForWork();
		}


	}

	public void writeCallCompleted(FunctionDTO dto, String projectId)
	{
		microtaskOutCompleted();
		onWorkerEdited(dto, projectId);
	}

	public void debugTestFailureCompleted(FunctionDTO dto, String projectId)
	{
		microtaskOutCompleted();
		//this.needsDebugging = false;

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
			//this.needsDebugging = false;
			if(!this.code.trim().equals(dto.code.trim()))
			{ //integrate the new changes
				onWorkerEdited(dto, projectId);
			}
		}

		// Save the entity again to the datastore
		ofy().save().entity(this).now();


		// Update or create tests for any stub
		for (TestDTO testDTO : dto.stubs)
		{
			TestCommand.create(testDTO.functionID,testDTO.functionName,testDTO.description,testDTO.simpleTestInputs,testDTO.simpleTestOutput,testDTO.code,this.version, false);
		}

	}

	//////////////////////////////////////////////////////////////////////////////
	//  COMMAND HANDLERS
	//////////////////////////////////////////////////////////////////////////////

	// This method notifies the function that it has just passed all of its tests.
	public void passedTests(String projectId)
	{
		waitForTestResult=false;
		//microtaskOutCompleted();
		HistoryLog.Init(projectId).addEvent(new MessageReceived("PassedTests", this));
		System.out.println("FUNCTION ID: "+ this.getID()+" ALL TEST PASSED");
		this.needsDebugging = false;
		ofy().save().entity(this).now();

		lookForWork();
	}

	// This method notifies the function that it has failed at least one of its tests
	public void failedTests(String projectId)
	{

		//microtaskOutCompleted();
		waitForTestResult=false;

		System.out.println("FUNCTION ID: "+ this.getID()+" TEST FAILED");

		HistoryLog.Init(projectId).addEvent(new MessageReceived("FailedTests", this));
		this.needsDebugging = true;
		ofy().save().entity(this).now();

		lookForWork();
	}



	// Provides notification that a test has transitioned to being implemented
	public void testBecameImplemented(Test test)
	{
		int position = tests.indexOf(test.getID());
		testsImplemented.set(position, true);

		runTestsIfReady();
	}

	// Notifies the function that it has a new caller function
	public void addCaller(Function function)
	{
		callers.add(function.getID());
		this.isNeeded=true;
		ofy().save().entity(this).now();
	}

	// Notifies the function that it is no longer called by function
	public void removeCaller(Function function)
	{
		callers.remove((Ref<Function>) Ref.create(function.getKey()));
		//if is not a function of the API and is not animore called by anyone means that is not anymore needed
		if( ! this.readOnly && this.callers.isEmpty())
			this.isNeeded=false;
		ofy().save().entity(this).now();
	}

	public void addDependency(long newSubscriber, String pseudoCall)
	{
		//add it to the lists
		pseudoCallers.add(newSubscriber);
		pseudoCallsites.add(pseudoCall);

		//if it's already been described, send the notification to the new subscriber (only) immediately.
		if(hasBeenDescribed())
			sendDescribedNotification(newSubscriber, pseudoCall);

		ofy().save().entity(this).now();
	}

	public void calleeBecameDescribed(String calleeName, String calleeFullDescription, String pseudoCall, String projectId)
	{
		HistoryLog.Init(projectId).addEvent(new MessageReceived("AddCall", this));
		queueMicrotask(new WriteCall(this, calleeName, calleeFullDescription, pseudoCall, projectId), projectId);
	}

	public void calleeChangedInterface(String oldFullDescription, String newFullDescription, String projectId)
	{
		queueMicrotask(new WriteFunction(this, oldFullDescription, newFullDescription, projectId), projectId);
	}

	public void disputeTestCases(String issueDescription, String testDescription, String projectId)
	{
		queueWriteTestCase(new WriteTestCases(this, issueDescription, testDescription, projectId));
	}

	public void disputeFunctionSignature(String issueDescription, String projectId)
	{
		queueMicrotask(new WriteFunction(this, issueDescription, projectId), projectId);
	}

	// Queues the specified microtask and looks for work
	private void queueWriteTestCase(Microtask microtask)
	{
		queuedWriteTestCase.add(Ref.create(microtask.getKey()));
		ofy().save().entity(this).now();
		lookForWork();
	}

	//////////////////////////////////////////////////////////////////////////////
	//   NOTIFICATION SENDERS
	//////////////////////////////////////////////////////////////////////////////

	// Notify all subscribers that this function has become described.
	private void notifyBecameDescribed(String projectId)
	{
		// Loop over the psuedocallsites and pseudocallers in parallel
		for (int i = 0; i < pseudoCallsites.size(); i++)
			sendDescribedNotification(pseudoCallers.get(i), pseudoCallsites.get(i));
	}

	private void sendDescribedNotification(long subscriberID, String pseudoCall)
	{
		FunctionCommand.calleeBecameDescribed(subscriberID, this.getName(), this.getFullDescription(), pseudoCall);
	}

	// Send out notifications, as appropriate, that the description or header of this
	// function has changed
	private void notifyDescriptionChanged(FunctionDTO dto)
	{
		for (long callerID : callers)
			FunctionCommand.calleeChangedInterface(callerID, this.getFullDescription(), dto.getCompleteDescription() + dto.header);

		for (long testID : tests)
			TestCommand.functionChangedInterface(
					testID, 
					this.getFullDescription(), 
					(dto.getCompleteDescription() + dto.header), 
					dto.name, 
					version);
	}

	//////////////////////////////////////////////////////////////////////////////
	//  UTILITY METHODS
	//////////////////////////////////////////////////////////////////////////////
	public void createTest(List<TestDescriptionDTO> tests)
	{
		if(tests!=null)
			for(TestDescriptionDTO test : tests)
			{
				TestCommand.create(this.id, this.name, test.description, test.simpleTestInputs, test.simpleTestOutput, test.code, 1, test.readOnly);
			}
	}

	public void storeToFirebase(String projectId)
	{
		if (hasBeenDescribed)
		{
			incrementVersion();
			FirebaseService.writeFunction(new FunctionInFirebase(name, this.id, version, returnType, paramNames,
					paramTypes, paramDescriptions, header, description, code, linesOfCode, this.pseudoFunctionsDescription , hasBeenDescribed, isWritten, needsDebugging, readOnly,
					queuedMicrotasks.size()),
					this.id, version, projectId);
		}
		else
		{
			FirebaseService.writeFunction(new FunctionInFirebase("", this.id, version, "", paramNames,
					paramTypes, paramDescriptions, "", description, "", linesOfCode, this.pseudoFunctionsDescription , hasBeenDescribed, isWritten, needsDebugging, readOnly,
					queuedMicrotasks.size()),
					this.id, version, projectId);

		}
	}

	// Looks up a Function object by name. Returns the function or null if no such function exists
	/* public static Function lookupFunction(String name, Project project)
	{
		//TO FIX NOT WORKING
		Ref<Function> ref = ofy().load().type(Function.class).ancestor(project.getKey()).filter("name", name).first();
		System.out.println("--> FUNCTION "+name+": lookup "+ref);

		if (ref == null)
			return null;
		else
			return ref.get();
	}*/

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

			// if not contains already add to collection
			if (!results.contains(segment))
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
		return ofy().load().ref(ref).now();
	}

	// Given an id for a functon, finds the corresponding function. Returns null if no such function exists.
	public static LoadResult<Function> find(long id)
	{
		return (LoadResult<Function>) ofy().load().key(Artifact.getKey(id));
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
