package com.crowdcoding.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.commons.lang3.StringUtils;

import com.crowdcoding.Project;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.FunctionDescriptionDTO;
import com.crowdcoding.dto.MockDTO;
import com.crowdcoding.dto.ReusedFunctionDTO;
import com.crowdcoding.dto.history.MessageReceived;
import com.crowdcoding.dto.history.PropertyChange;
import com.crowdcoding.microtasks.DebugTestFailure;
import com.crowdcoding.microtasks.ReuseSearch;
import com.crowdcoding.microtasks.WriteCall;
import com.crowdcoding.microtasks.WriteFunction;
import com.crowdcoding.microtasks.WriteFunctionDescription;
import com.crowdcoding.microtasks.WriteTest;
import com.crowdcoding.microtasks.WriteTestCases;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Index;
import com.googlecode.objectify.annotation.Load;
import com.googlecode.objectify.cmd.Query;


/* A function represents a function of code. Functions transition through states, spawning microtasks, 
 * which, upon completion, transition the state. Some of these microtasks may create other artifacts,
 * which also transition through states; these transitions may in turn be signaled back to a function.
 * 
 */
@EntitySubclass(index=true)
public class Function extends Artifact
{
	private String code;
	@Index private String name;
	private String returnType;
	private List<String> paramNames = new ArrayList<String>();
	private List<String> paramTypes = new ArrayList<String>();
	private String header;
	private String description;
	private List<Ref<Test>> tests = new ArrayList<Ref<Test>>();
	// fully implemented (i.e., not psuedo) calls made by this function
	private List<String> callees = new ArrayList<String>();	
	// current callers with a fully implemented callsite to this function:
	private List<Ref<Function>> callers = new ArrayList<Ref<Function>>();
	// pseudocalls made by this function:
	private List<String> pseudoCalls = new ArrayList<String>();   
	// pseudocall callsites calling this function (these two lists must be in sync)
	private List<String> pseudoCallsites = new ArrayList<String>();  
	private List<Ref<Function>> pseudoCallers = new ArrayList<Ref<Function>>();
	
	@Index private boolean isWritten;	// true iff Function has no pseudocode and has been fully implemented (but may still fail tests)
	@Index private boolean hasBeenDescribed; // true iff Function is at least in the state described
	private boolean needsDebugging;		// true iff the function is failing its unit tests.
	
	//////////////////////////////////////////////////////////////////////////////
	//  CONSTRUCTORS
	//////////////////////////////////////////////////////////////////////////////
	
	// Constructor for deserialization
	protected Function()
	{
	}
		
	// Constructor for a function that has a full description and code
	public Function(String name, String returnType, List<String> paramNames, List<String> paramTypes, String header, 
			String description, String code, Project project)
	{
		super(project);		
		writeDescriptionCompleted(name, returnType, paramNames, paramTypes, header, description, code, project);
	}
	
	// Constructor for a function that only has a short call description and still needs a full description
	public Function(String callDescription, Function caller, Project project)
	{
		super(project);
		isWritten = false;
		
		// Spawn off a microtask to write the function description
		makeMicrotaskOut(new WriteFunctionDescription(this, callDescription, caller, project));
	}
	
	//////////////////////////////////////////////////////////////////////////////
	//  ACCESSORS
	//////////////////////////////////////////////////////////////////////////////

	// Is the fucntion written and all pseudocode no replaced with code? 
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
	
	public String getEscapedDescription()
	{
		return StringEscapeUtils.escapeEcmaScript(description);
	}
	
	// Gets the description and the header
	public String getFullDescription()
	{
		return description + header;
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
	
	// Gets a mock implementation that checks to see if there are any mocks
	// for the specified function.
	public String getMockCode()
	{
		StringBuilder mockCode = new StringBuilder();
		mockCode.append("{ var returnValue; ");
		mockCode.append("var params = arguments; ");
		mockCode.append("var mockFor = hasMockFor('" + name + "', arguments, mocks); ");
		mockCode.append("if (mockFor.hasMock) ");
		mockCode.append("     returnValue = mockFor.mockOutput; ");
		mockCode.append("else ");
		mockCode.append("     returnValue = " + name + "aaaActualIMP.apply(null, params); "); // JSON.parse(JSON.stringify(
	//	mockCode.append("alert( JSON.stringify(JSON.parse(JSON.stringify(params)))); ");
		mockCode.append("return returnValue; }");
		return mockCode.toString();
	}
	
	// Gets the special header used for the actual implementation when running with mocks
	public String getMockHeader()
	{
		StringBuilder b = new StringBuilder();
		b.append(" function " + name + "aaaActualIMP");
		
		// Gets the params string out of the header by looking for the first instance of a paren (which
		// must be the start of the functions params)
		b.append(header.substring(header.indexOf("(")));
		
		return b.toString();
	}
	
	// gets the body of the function (including braces)
	public String getEscapedCode()
	{
		return StringEscapeUtils.escapeEcmaScript(code);
	}
	
	// Gets the description, header, and bady of the function
	public String getFullCode()
	{
		return description + header + "\n" + code;
	}
	
	public String getEscapedFullCode()
	{
		return StringEscapeUtils.escapeEcmaScript(getFullCode());
	}	
	
	public List<Ref<Test>> getTestCases()
	{
		return tests;
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
		return new FunctionDescriptionDTO(name, returnType, paramNames, paramTypes, header, description); 
	}
	
	// Returns true iff the specified pseudocall is currently in the code
	public boolean containsPseudoCall(String pseudoCall)
	{
		return pseudoCalls.contains(pseudoCall);
	}
	
	// Adds the specified test for this function
	public void addTest(Test test)
	{
		tests.add((Ref<Test>) Ref.create(test.getKey()));
		ofy().save().entity(this).now();	
	}
	
	//////////////////////////////////////////////////////////////////////////////
	//  PRIVATE CORE FUNCTIONALITY
	//////////////////////////////////////////////////////////////////////////////
	
	private void setWritten(boolean isWritten, Project project)
	{
		if (this.isWritten != isWritten)
		{
			project.historyLog().beginEvent(new PropertyChange("implemented", 
					Boolean.toString(isWritten), this));		
			
			this.isWritten = isWritten;
			ofy().save().entity(this).now();	
			if (isWritten)
				project.functionWritten();
			else
				project.functionNotWritten();
			
			project.historyLog().endEvent();
		}		
	}
	
	// Sets the function as being described
	private void setDescribed(Project project)
	{
		if (!this.hasBeenDescribed)
		{
			project.historyLog().beginEvent(new PropertyChange("hasBeenDescribed", "true", this));	
			
			this.hasBeenDescribed = true;
			ofy().save().entity(this).now();	
			notifyOnDescribed(project);
			
			project.historyLog().endEvent();
		}
	}
	
	// If there is no microtask currently out for this artifact, looks at the queued microtasks.
	// If there is a microtasks available, marks it as ready to be done.
	protected void lookForWork(Project project)
	{
		// If there is currently not already a microtask being done on this function, 
		// determine if there is work to be done
		if (microtaskOut == null)
		{
			// Microtask must have been described, as there is no microtask out to describe it.
			if (isWritten && needsDebugging)			
				makeMicrotaskOut(new DebugTestFailure(this, project));
			else if (!queuedMicrotasks.isEmpty())
				makeMicrotaskOut(ofy().load().ref(queuedMicrotasks.remove()).get());
		}
	}	
		
	// Determines if all unit tests are implemented (e.g., not merely described or currently disputed)
	private boolean allUnitTestsImplemented()
	{
		for (Ref<Test> t : tests) 
		{
			if (!Test.load(t).isImplemented())
				return false;			
		}
		
		//if there are no unit tests, the tests aren't all ready yet, so return false...
		//otherwise, you've gotten here and all the unit tests are implemented
		return !tests.isEmpty();
	}
	
	private void runTestsIfReady(Project project)
	{
		if(isWritten && allUnitTestsImplemented())
			project.requestTestRun();
	}
		
	private void onWorkerEdited(FunctionDTO dto, Project project)
	{
		// Check if the description or header changed (ignoring whitespace changes).
		// If so, generate DescriptionChange microtasks for callers and tests.				
		String strippedOldFullDescrip = (this.description + this.header).replace(" ", "").replace("\n", "");
		String strippedNewFullDescrip = (dto.description + dto.header).replace(" ", "").replace("\n", "");				
		if (!strippedOldFullDescrip.equals(strippedNewFullDescrip))		
			descriptionChanged(dto, project);		
		
		// Measure the LOC increase. (add one for last line without newline and one for the header) 
		int	oldLOC = StringUtils.countMatches(this.code, "\n") + 2;
		int newLOC = StringUtils.countMatches(dto.code, "\n") + 2;		
		project.locIncreasedBy(newLOC - oldLOC);		
		
		// Update the function data
		this.code = dto.code;		
		this.name = dto.name;
		this.description = dto.description;
		this.header = dto.header;
		this.paramNames = dto.paramNames;
		
		// Looper over all of the callers, rebuilding our list of callers
		rebuildCalleeList(dto.calleeNames, project);

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
					new ReuseSearch(this, callDescription, project);
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
	private void rebuildCalleeList(List<String> calleeNames, Project project)
	{
		// First, find new callees added, if any
		List<String> newCallees = new ArrayList<String>(calleeNames);
		newCallees.removeAll(this.callees);
		
		// If there are any, send notifications to these functions that they have a new caller
		for (String newCalleeName : newCallees)
		{
			Function callee = lookupFunction(newCalleeName, project);
			if (callee != null)
				callee.newCaller(this);
		}
		
		// Next, find any callees removed, if any
		List<String> removedCallees = new ArrayList<String>(this.callees);
		removedCallees.remove(calleeNames);
		
		// Send notifications to these functions that they no longer have this caller
		for (String removedCalleeName : removedCallees)
		{
			Function callee = lookupFunction(removedCalleeName, project);
			if (callee != null)
				callee.noLongerCalledBy(this);
		}
		
		this.callees = newCallees;
		ofy().save().entity(this).now();
	}
	
	//////////////////////////////////////////////////////////////////////////////
	//  NOTIFICATION HANDLERS
	//////////////////////////////////////////////////////////////////////////////
			
	public void writeTestCasesCompleted(List<String> testCases, Project project)
	{
		for (String testDescription : testCases)
		{
			Test test = new Test(testDescription, this, project);
		}
	}
	
	public void sketchCompleted(FunctionDTO dto, Project project)
	{
		microtaskOutCompleted();
		onWorkerEdited(dto, project);
	}
	
	public void calleeBecameDescribed(Function callee, String pseudoCall, Project project)
	{
		project.historyLog().beginEvent(new MessageReceived("AddCall", this));
		queueMicrotask(new WriteCall(this, callee, pseudoCall, project), project);
		project.historyLog().endEvent();
	}
		
	public void reuseSearchCompleted(ReusedFunctionDTO dto, String callDescription, Project project)
	{
		Function callee;
		
		if (dto.noFunction)
		{
			// Create a new function for this call, spawning microtasks to create it.
			callee = new Function(callDescription, this, project);
		}
		else
		{	
			// lookup the function by name
			callee = ofy().load().type(Function.class).ancestor(project.getKey()).filter("name", dto.functionName).first().get();
		}
		
		// Have the callee let us know when it's tested (which may already be true; 
		// signal sent immediately in that case)
		callee.addToNotifyOnDescribed(this, callDescription, project);
	}
		
	public void writeDescriptionCompleted(String name, String returnType, List<String> paramNames, List<String> paramTypes, 
			String header, String description, String code, Project project)
	{
		microtaskOutCompleted();
		this.name = name;
		this.returnType = returnType;
		this.paramNames = paramNames;
		this.paramTypes = paramTypes;
		this.header = header;
		this.description = description;
		this.code = code;
		project.locIncreasedBy(StringUtils.countMatches(this.code, "\n") + 2);
		
		ofy().save().entity(this).now();
		
		setDescribed(project);		
		
		//Spawn off microtask to write test cases. As it does not impact the artifact itself,
		// the microtask can be directly started rather than queued.
		WriteTestCases writeTestCases = new WriteTestCases(this, project);
		
		// Spawn off microtask to sketch the method
		queueMicrotask(new WriteFunction(this, project), project);
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
		if(dto.testCaseNumber != null)
		{
			// creates a disputed test case
			Test.load(tests.get(Integer.parseInt(dto.testCaseNumber)))
					.disputeUnitTestCorrectionCreated(dto, project);	
			
			// Since there was an issue, ignore any code changes they may have submitted.			
		} else { //at present, reaching here means all tests passed.
			if(!this.code.trim().equals(dto.code.trim()))
			{ //integrate the new changes
				onWorkerEdited(dto, project);
			} 
		}

		// Save the entity again to the datastore		
		ofy().save().entity(this).now(); 
		
		// Update or create tests for any mocks
/*		for (MockDTO mockDTO : dto.mocks)
		{
			// Is there already a simple test / mock for this function with these inputs?
			Test test = Test.findSimpleTestFor(mockDTO.functionName, mockDTO.inputs, project);			
			
			// If so, update it.
			// Otherwise, create a new test
			if (test != null)
				test.setSimpleTestOutput(mockDTO.expectedOutput, project);
			else
				test = new Test(Function.lookupFunction(mockDTO.functionName, project), 
						mockDTO.inputs, mockDTO.expectedOutput, mockDTO.code, project);
		}  */		
		
		lookForWork(project);
	}
	
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
	
	// Provides notification that a test has transitioned to being implemented
	public void testBecameImplemented(Test test, Project project)
	{
		runTestsIfReady(project);
	}
	
	// Notifies the function that it has a new caller function
	public void newCaller(Function function)
	{
		callers.add((Ref<Function>) Ref.create(function.getKey()));
		ofy().save().entity(this).now();
	}
	
	// Notifies the function that it is no longer called by function
	public void noLongerCalledBy(Function function)
	{
		callers.remove((Ref<Function>) Ref.create(function.getKey()));
		ofy().save().entity(this).now();
	}
	
	//////////////////////////////////////////////////////////////////////////////
	//   NOTIFICATION SENDERS
	//////////////////////////////////////////////////////////////////////////////

	public void addToNotifyOnDescribed(Function newSubscriber, String pseudoCall, Project project) 
	{
		//Create the reference object to the new subscriber
		Ref<Function> newSubscriberRef = (Ref<Function>) Ref.create(newSubscriber.getKey());
		
		//add it to the lists
		pseudoCallers.add(newSubscriberRef);
		pseudoCallsites.add(pseudoCall);
		
		//if it's already been described, send the notification to the new subscriber (only) immediately.
		if(hasBeenDescribed()) 		
			sendDescribedNotification(newSubscriberRef, pseudoCall, project);		
		
		ofy().save().entity(this).now();
	}
	
	// Notify all subscribers that this function has become described.
	private void notifyOnDescribed(Project project)
	{
		// Loop over the psuedocallsites and pseudocallers in parallel
		for (int i = 0; i < pseudoCallsites.size(); i++)
			sendDescribedNotification(pseudoCallers.get(i), pseudoCallsites.get(i), project);
	}
	
	private void sendDescribedNotification(Ref<Function> subscriber, String pseudoCall, Project project)
	{
		load(subscriber).calleeBecameDescribed(this, pseudoCall, project);
	}
	
	// Send out notifications, as appropriate, that the description or header of this 
	// function has changed
	private void descriptionChanged(FunctionDTO dto, Project project)
	{
		// queue DescriptionChanged microtasks on each of the callers 
		for (Ref<Function> callerRef : callers)
		{
			Function caller = load(callerRef);
			caller.queueMicrotask(new WriteFunction(caller, this.getFullDescription(), 
					dto.description + dto.header, project), project);
		}
		
		// queue FUNCTION_CHANGED edit test microtasks on each of this function's tests
		for (Ref<Test> testRef : tests)
		{
			Test test = Test.load(testRef);
			test.queueMicrotask(new WriteTest(test, this.getFullDescription(),  
					dto.description + dto.header, project), project);
		}
	}
		
	//////////////////////////////////////////////////////////////////////////////
	//  UTILITY METHODS
	//////////////////////////////////////////////////////////////////////////////

	// Looks up a Function object by name. Returns the function or null if no such function exists
	public static Function lookupFunction(String name, Project project)
	{
		Ref<Function> ref = ofy().load().type(Function.class).ancestor(project.getKey()).filter("name", name).first();
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
		return name + " described: " + hasBeenDescribed + " written: " + isWritten + " needsDebugging: "
				+ needsDebugging + " queuedMicrotasks: " + queuedMicrotasks.size();
	}
	
	public static String StatusReport(Project project)
	{
		StringBuilder output = new StringBuilder();		
		output.append("**** ALL FUNCTIONS ****\n");
		
		Query<Function> q = ofy().load().type(Function.class).ancestor(project.getKey());		
		for (Function function : q)
			output.append(function.toString() + "\n");
		
		return output.toString();
	}
}
