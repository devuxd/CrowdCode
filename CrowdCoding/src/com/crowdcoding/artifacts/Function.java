package com.crowdcoding.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.commons.lang3.StringUtils;

import com.crowdcoding.Project;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.FunctionDescriptionDTO;
import com.crowdcoding.dto.ParameterDTO;
import com.crowdcoding.dto.ReusedFunctionDTO;
import com.crowdcoding.dto.TestCasesDTO;
import com.crowdcoding.dto.history.MessageReceived;
import com.crowdcoding.dto.history.StateChange;
import com.crowdcoding.microtasks.DebugTestFailure;
import com.crowdcoding.microtasks.MachineUnitTest;
import com.crowdcoding.microtasks.Microtask;
import com.crowdcoding.microtasks.ReuseSearch;
import com.crowdcoding.microtasks.WriteCall;
import com.crowdcoding.microtasks.WriteFunction;
import com.crowdcoding.microtasks.WriteFunctionDescription;
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
	private String description;
	private String returnType;
	@Load private List<Parameter> parameters = new ArrayList<Parameter>();  	
	@Load private List<Ref<Test>> tests = new ArrayList<Ref<Test>>();
	private List<String> pseudoCalls = new ArrayList<String>();
	
	// When a function becomes tested, functions that are calling it want to be notified.
	private List<Ref<Function>> notifyOnDescribed = new ArrayList<Ref<Function>>(); 
	
	@Index private boolean isWritten;	// true iff Function has no pseudocode and has been fully implemented (but may still fail tests)
	@Index private boolean hasBeenDescribed; // true iff Function is at least in the state described
	private boolean needsDebugging;		// true iff the function is failing its unit tests.
	
	// Queued microtasks waiting to be done (not yet in the ready state)
	private Queue<Ref<Microtask>> queuedMicrotasks = new LinkedList<Ref<Microtask>>();	
	
	private Ref<Microtask> microtaskOut;
	
	//////////////////////////////////////////////////////////////////////////////
	//  CONSTRUCTORS
	//////////////////////////////////////////////////////////////////////////////
	
	// Constructor for deserialization
	protected Function()
	{
	}
	
	// Constructor for a function that already has a full function description
	public Function(String name, String description, String returnType, List<ParameterDTO> params, Project project)
	{
		super(project);		
		writeDescriptionCompleted(name, description, returnType, params, project);
	}
	
	// Constructor for a function that only has a short call description and still needs a full description
	public Function(String callDescription, Function caller, Project project)
	{
		super(project);
		isWritten = false;
		
		// Spawn off a microtask to write the function description
		makeMicrotaskOut(new WriteFunctionDescription(this, callDescription, caller, project));
	}
	
	// Constructor for the special main function, which acts as the root of the call graph
	public Function(Project project)
	{
		super(project);
		
		this.name = "main";
		this.description = "Main function for a commandline application. Given a userInput string describing\n" +
				"an action to take, executes the action and returns the result as a String.";
		this.parameters.add(new Parameter("userInput", "String", "Describes the action to take"));
		this.returnType = "String";
		this.code = "";
		this.hasBeenDescribed = true;
		
		ofy().save().entity(this).now();
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
	
	public List<Parameter> getParameters(){
		return parameters;
	}
	
	public String getName()
	{
		return name;
	}
		
	public String getCode()
	{
		return code;
	}
	
	public String getEscapedCode()
	{
		return StringEscapeUtils.escapeEcmaScript(code);
	}
	
	public List<Ref<Test>> getTestCases()
	{
		return tests;
	}
	// this the header used for code. it is valid js
	public String getFunctionHeader()
	{
		StringBuilder parameterAsAString = new StringBuilder();
		for(Parameter functionParameter: parameters)
		{
			parameterAsAString.append(functionParameter.getName());
			parameterAsAString.append(",");
		}
		// If there is at least one parameter, get rid of the trailing comma
		if (parameters.size() > 0)
			parameterAsAString.replace(parameterAsAString.toString().length()-1,parameterAsAString.toString().length(), "");
		return "function " + this.name + "(" + parameterAsAString.toString() + ")" ;
	}

	public String getReturnType()
	{
		return returnType;
	}

	public String getDescription() 
	{
		return description;
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
	
	// this has the type and the description
	public String getFunctionDisplayHeader() 
	{
		StringBuilder parameterAsAString = new StringBuilder();
		for(Parameter functionParameter: parameters)
		{
			parameterAsAString.append(functionParameter.toString());
			parameterAsAString.append(",<br>");
		}
		// If there is at least one parameter, get rid of the trailing comma and <BR>
		if (parameters.size() > 0)
			parameterAsAString.replace(parameterAsAString.toString().length()-5,parameterAsAString.toString().length(), "");
		return "function " + this.name + "(</br>" + parameterAsAString.toString() + "</br>)" ;
	}
	
	public FunctionDescriptionDTO getDescriptionDTO()
	{
		List<ParameterDTO> paramDTOs = new ArrayList<ParameterDTO>();
		for (Parameter param : parameters)
			paramDTOs.add(param.getDTO());
		
		return new FunctionDescriptionDTO(name, returnType, paramDTOs, description);
	}
	
	// Queues the specified microtask and looks for work
	public void queueMicrotask(Microtask microtask, Project project)
	{
		queuedMicrotasks.add(Ref.create(microtask.getKey()));
		ofy().save().entity(this).now();
		lookForWork(project);		
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
			if (isWritten)
				project.functionWritten();
			else
				project.functionNotWritten();
		}		
	}
	
	// Sets the function as being described
	private void setDescribed(Project project)
	{
		if (!this.hasBeenDescribed)
		{
			this.hasBeenDescribed = true;
			ofy().save().entity(this).now();	
			notifyOnDescribed(project);
		}
	}
	
	// Makes the specified microtask out for work
	private void makeMicrotaskOut(Microtask microtask)
	{
		microtask.makeReady();
		microtaskOut = Ref.create(microtask.getKey());
		ofy().save().entity(this).now();
	}
	
	private void microtaskOutCompleted()
	{
		microtaskOut = null;
		ofy().save().entity(this).now();
	}
	
	// If there is no microtask currently out for this artifact, looks at the queued microtasks.
	// If there is a microtasks available, marks it as ready to be done.
	private void lookForWork(Project project)
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
			if (!t.get().isImplemented())
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
		// Measure the LOC increase. 
		int	oldLOC = StringUtils.countMatches(this.code, "\n") + 1;
		int newLOC = StringUtils.countMatches(dto.code, "\n") + 1;		
		project.locIncreasedBy(newLOC - oldLOC);		
		
		// Update the code
		this.code = dto.code;				

		// Look for pseudocode and psuedocalls
		List<String> currentPseudoCalls = findPseudocalls(code);
	
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
					pseudoCalls.add(callDescription); 
					// Spawn microtask immediately, as it does not require access to the function itself
					new ReuseSearch(this, callDescription, project);
				}
			}
		}
					
		ofy().save().entity(this).now();
	}	
	
	//////////////////////////////////////////////////////////////////////////////
	//  NOTIFICATION HANDLERS
	//////////////////////////////////////////////////////////////////////////////
			
	public void writeTestCasesCompleted(TestCasesDTO dto, Project project)
	{
		for (String testDescription : dto.tests)
		{
			Test test = new Test(testDescription, this, project);
			tests.add((Ref<Test>) Ref.create(test.getKey()));
		}
		
		ofy().save().entity(this).now();			
	}
		
	public void sketchCompleted(FunctionDTO dto, Project project)
	{
		microtaskOutCompleted();
		onWorkerEdited(dto, project);
	}
	
	public void calleeBecameDescribed(Function callee, Project project)
	{
		project.historyLog().beginEvent(new MessageReceived("AddCall", this));
		queueMicrotask(new WriteCall(this, callee, project), project);
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
		callee.addToNotifyOnDescribed(this, project);
	}
	
	public void writeDescriptionCompleted(String name, String description, String returnType, 
	List<ParameterDTO> params, Project project)
	{
		microtaskOutCompleted();
		this.name = name;
		this.description = description;
		this.returnType = returnType;
		for (ParameterDTO param : params)
			this.parameters.add(new Parameter(param.name, param.type, param.description));

		// The initial code for a function is a line of pseudocode that instructs
		// the worker to only remove it when the function is done. This keeps regenerating
		// new sketch tasks until the worker has marked it as done by removing the pseudocode
		// line.
		this.code = "/#Mark this function as implemented by removing this line.";	
		project.locIncreasedBy(1);
		
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
			tests.get(Integer.parseInt(dto.testCaseNumber)).get().disputeUnitTestCorrectionCreated(dto, project);	
			onWorkerEdited(dto, project);
		} else { //at present, reaching here means all tests passed.
			if(!this.code.trim().equals(dto.code.trim()))
			{ //integrate the new changes
				onWorkerEdited(dto, project);
			} 
		}

		// Save the entity again to the datastore		
		ofy().save().entity(this).now(); 
	}
	
	// This method notifies the function that it has just passed all of its tests.
	public void passedTests(Project project)
	{
		if (this.needsDebugging)
		{
			project.historyLog().beginEvent(new MessageReceived("PassedTests", this));
			this.needsDebugging = false;
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
	
	//////////////////////////////////////////////////////////////////////////////
	//   NOTIFICATION SENDERS
	//////////////////////////////////////////////////////////////////////////////

	public void addToNotifyOnDescribed(Function newSubscriber, Project project) 
	{
		//Create the reference object to the new subscriber
		Ref<Function> newSubscriberRef = (Ref<Function>) Ref.create(newSubscriber.getKey());
		
		//add it to the list
		notifyOnDescribed.add(newSubscriberRef);
		
		//if it's already been described, send the notification to the new subscriber (only) immediately.
		if(hasBeenDescribed()) 		
			sendDescribedNotification(newSubscriberRef, project);		
		
		ofy().save().entity(this).now();
	}
	
	// Notify all subscribers that this function has become described.
	private void notifyOnDescribed(Project project)
	{
		for (Ref<Function> subscriber : notifyOnDescribed)		
			sendDescribedNotification(subscriber, project);		
	}
	
	private void sendDescribedNotification(Ref<Function> subscriber, Project project)
	{
		load(subscriber).calleeBecameDescribed(this, project);
	}
		
	//////////////////////////////////////////////////////////////////////////////
	//  UTILITY METHODS
	//////////////////////////////////////////////////////////////////////////////

	// Looks through a string of a function's implementation and returns a list
	// of lines (may be empty) which are the pseudocode for the function call
	public List<String> findPseudocalls(String code)
	{	
		return findSpecialLines(code, "/!");
	}
	
	public List<String> findPseudocode(String code)
	{
		return findSpecialLines(code, "/#");
	}
	
	// Finds segments of lines in a string of code starting with linestarter
	public List<String> findSpecialLines(String code, String starter)
	{		
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
				segment = searchCode.substring(index + 2);
			else 
				segment = searchCode.substring(index + 2, nextLineStart);

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
	
	public void createDisputedTestCase(FunctionDTO dto, Project project)
	{
		tests.get(Integer.parseInt(dto.testCaseNumber)).get().disputeUnitTestCorrectionCreated(dto, project);	
	}
	
	// Given a ref to a function that has not been loaded from the datastore,
	// load it and get the object
	public static Function load(Ref<Function> ref)
	{
		return ofy().load().ref(ref).get();
	}		
		
	private void logState() 
	{
		System.out.println("State of function: " + this.toString() +".");		
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
