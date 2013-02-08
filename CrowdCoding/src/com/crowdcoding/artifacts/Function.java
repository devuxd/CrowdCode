package com.crowdcoding.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

import org.apache.commons.lang3.StringEscapeUtils;

import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.FunctionDescriptionDTO;
import com.crowdcoding.dto.ParameterDTO;
import com.crowdcoding.dto.ReusedFunctionDTO;
import com.crowdcoding.dto.TestCasesDTO;
import com.crowdcoding.microtasks.DebugTestFailure;
import com.crowdcoding.microtasks.ReuseSearch;
import com.crowdcoding.microtasks.SketchFunction;
import com.crowdcoding.microtasks.WriteCall;
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
 *  States of a Function:
 *    Created: function exists (true iff an object for the function exists)
 *    Described: function description exists
 *    Written: described + function written (no pseudocode remaining), unit tests written
 *    Implemented: all callees tested
 *    Tested: written + all unit tests pass
 *
 *  after function is created, generates WriteDescription microtask
 *  after this completes, transitions to Described, spawns microtasks to write test cases and sketch function
 *  after unit tests are all written and no pseudocode remains, transitions to written
 *  after all callees tested, transitions to implemented, and tests are run (which occurs in debug microtasks)
 *  after all tests pass, transitions to tested
 * 
 */
@EntitySubclass(index=true)
public class Function extends Artifact
{
	public enum State { CREATED, DESCRIBED, OPEN_FOR_CODING, ACTIVE_CODING, WAITING_FOR_CALLEES, 
		IMPLEMENTED, READY_TO_TEST, TESTED, READY_TO_ADD_CALL, NEEDS_DEBUGGING }; 
	
	private String code;
	@Index private String name;
	private String description;
	private String returnType;
	@Load private List<Parameter> parameters = new ArrayList<Parameter>();  	
	@Load private List<Ref<Test>> tests = new ArrayList<Ref<Test>>();
	private List<String> pseudoCalls = new ArrayList<String>();
	private State state;
	
	// When a function becomes tested, functions that are calling it want to be notified.
	private List<Ref<Function>> notifyOnTested = new ArrayList<Ref<Function>>(); 
	
	// Calls that have not yet been intregrated into the code
	private Queue<Ref<Function>> callsToIntegrate = new LinkedList<Ref<Function>>();
	private boolean isCodeReadyToBeIncluded;	
	
	
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
	public Function(String callDescription, Project project)
	{
		super(project);
		isCodeReadyToBeIncluded = false;
		updateState(State.CREATED);
		logState();
		ofy().save().entity(this).now();
		
		// Spawn off a microtask to write the function description
		WriteFunctionDescription writeFunctionDescription = 
				new WriteFunctionDescription(this, callDescription, project);
	}
	
	//////////////////////////////////////////////////////////////////////////////
	//  ACCESSORS
	//////////////////////////////////////////////////////////////////////////////
	
	private State getState() {
		return state;
	}

	private void updateState(State state) 
	{
		switch(state)
		{
		case ACTIVE_CODING:
		case CREATED:
		case DESCRIBED:
		case OPEN_FOR_CODING:
		case READY_TO_ADD_CALL:
		case WAITING_FOR_CALLEES:
			this.isCodeReadyToBeIncluded = false;
			break;
		case READY_TO_TEST:
		case IMPLEMENTED:
		case NEEDS_DEBUGGING:
		case TESTED:
			this.isCodeReadyToBeIncluded = true;
			break;
		default:
			break;
		}
		this.state = state;
		ofy().save().entity(this).now();
	}
	
	public boolean getIsCodeReadyToBeIncluded()
	{
		return isCodeReadyToBeIncluded;
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
	public static String getFunctionDescriptions()
	{
		List<FunctionDescriptionDTO> dtos = new ArrayList<FunctionDescriptionDTO>();
		Query<Function> q = ofy().load().type(Function.class);   
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
	
	public boolean anyTestCasesDisputed()
	{
		for(int i = 0; i < tests.size(); i++)
		{
			if(tests.get(i).getValue() != null)
			{
				if(tests.get(i).getValue().isDisputed())
				{
					return true;
				}
			}
		}
		return false;
	}
	
	private boolean allUnitTestsImplemented(boolean registerCallback)
	{
		for (Ref<Test> t : tests) 
		{
			if (!t.get().isImplemented())
			{
				t.get().registerCallback(); //"let me know when you're ready"
				return false;
			}
		}
		//if there are no unit tests, the tests aren't all ready yet, so return false...
		//otherwise, you've gotten here and all the unit tests are implemented
		return !tests.isEmpty();
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
		onWorkerEdited(dto, project);
	}
	
	public void runTestsIfReady(Project project)
	{
		if(getState() == State.IMPLEMENTED)
		{
			//if all tests are implemented, state = State.READY_TO_TEST;
			//and if not, register a callback to call this again
			if (allUnitTestsImplemented(true))
			{
				updateState(State.READY_TO_TEST);
				logState();
				//run tests
				DebugTestFailure debugMicrotask = new DebugTestFailure(this, project);
				//DebugTestFailure unitTest = new DebugTestFailure(this.function,project);
			}			
		}
		ofy().save().entity(this).now();			
	}
	
	
	public void onWorkerEdited(FunctionDTO dto, Project project)
	{
		this.code = dto.code;				

		List<String> currentPseudoCalls = findPseudocalls(code);
	
		if(currentPseudoCalls.isEmpty())
		{
			List<String> pseudoCode = findPseudocode(code);
			if(pseudoCode.isEmpty())
			{
				updateState(State.IMPLEMENTED);
				logState();
				runTestsIfReady(project);
			} else {
				updateState(State.OPEN_FOR_CODING);
				logState();
				//create new Sketch microtask
				SketchFunction sketchFunction = new SketchFunction(this, project);
			}
		}	
		else
		{
			for (String callDescription : currentPseudoCalls)
			{
				if (!pseudoCalls.contains(callDescription))		
				{
					//for any currentPseudoCall not in pseudoCalls, add it
					pseudoCalls.add(callDescription); 
		
					// TODO: we need to pass the string of the call and get that back...
					/*ReuseSearch reuseSearch =*/ new ReuseSearch(this, callDescription, project);
					
					if(callsToIntegrate.isEmpty())
					{
						updateState(State.WAITING_FOR_CALLEES);
						logState();
					} else 
					{
						addCall(load(callsToIntegrate.remove()), project);
					}
				}
			}
		}
			
		ofy().save().entity(this).now();
	}
	
	private void addCall(Function callee, Project project) 
	{
		updateState(State.READY_TO_ADD_CALL);
		logState();
		
		// Create a microtask to add the call
		WriteCall writeCall = new WriteCall(this, callee, project);	
	}
	
	public void calleeBecameTested(Function callee, Project project)
	{
		if (getState() == State.WAITING_FOR_CALLEES)
		{ 			
			addCall(callee, project);
		}
		else
		{	
			callsToIntegrate.add((Ref<Function>) Ref.create(callee.getKey()));			
		}		
	}
		
	public void reuseSearchCompleted(ReusedFunctionDTO dto, String callDescription, Project project)
	{
		Function callee;
		
		if (dto.noFunction)
		{
			// Create a new function for this call, spawning microtasks to create it.
			callee = new Function(callDescription, project);
		}
		else
		{	
			// lookup the function by name
			callee = ofy().load().type(Function.class).filter("name", dto.functionName).first().get();
		}
		
		// Have the callee let us know when it's tested (which may already be true; 
		// signal sent immediately in that case)
		callee.addToNotifyOnTested(this, project);
	}
	
	public void activeCodingStarted() 
	{
		this.updateState(State.ACTIVE_CODING);
		logState();
	}
	
	
	public void writeDescriptionCompleted(String name, String description, String returnType, 
	List<ParameterDTO> params, Project project)
	{
		this.updateState(State.DESCRIBED);
		logState();
		
		this.name = name;
		this.description = description;
		this.returnType = returnType;
		for (ParameterDTO param : params)
			this.parameters.add(new Parameter(param.name, param.type, param.description));

		// The initial code for a function is a line of pseudocode that instructs
		// the worker to only remove it when the function is done. This keeps regenerating
		// new sketch tasks until the worker has marked it as done by removing the pseudocode
		// line.
		this.code = "#Mark this function as implemented by removing this line.";		
		
		//Spawn off microtask to write test cases
		WriteTestCases writeTestCases = new WriteTestCases(this, project);
		this.updateState(State.OPEN_FOR_CODING);
		logState();

		ofy().save().entity(this).now();
		
		// Spawn off microtask to sketch the method
		SketchFunction sketchFunction = new SketchFunction(this, project);
	}
	
	public void writeCallCompleted(FunctionDTO dto, Project project)
	{
		onWorkerEdited(dto, project);
	}
	
	public void debugTestFailureCompleted(FunctionDTO dto, Project project)
	{				
		// Check to see if there any disputed tests
		//Current: If it doesn't have a test case number indicating a dispute, all passed.
		//That should change in the future, to indicate which ones passed		
		if(dto.testCaseNumber != null)
		{
			// creates a disputed test case
			tests.get(Integer.parseInt(dto.testCaseNumber)).get().disputeUnitTestCorrectionCreated(dto, project);	
			onWorkerEdited(dto, project);
		} else { //at present, reaching here means all tests passed.
			if(!this.code.trim().equals(dto.code.trim())) //this may be the source of a bug, always returning unequal.
			{ //integrate the new changes
				onWorkerEdited(dto, project);
			} else/*if all tests passed*/ { //tests ran through all smoothly
				updateState(State.TESTED);
				logState();
				notifyOnTested(project);
			}
		}
/*		// all unit tests are closed, we only generate one at a time
		for(Ref<Test> testCases: tests)
		{
			testCases.get().closeUnitTest();
		}
	*/	
		// Save the entity again to the datastore		
		ofy().save().entity(this).now(); 
	}
	
	//////////////////////////////////////////////////////////////////////////////
	//   NOTIFICATION SENDERS
	//////////////////////////////////////////////////////////////////////////////

	public void addToNotifyOnTested(Function newSubscriber, Project project) 
	{
		//Create the reference object to the new subscriber
		Ref<Function> newSubscriberRef = (Ref<Function>) Ref.create(newSubscriber.getKey());
		
		//add it to the list
		notifyOnTested.add(newSubscriberRef);
		
		//if it's already tested, send the notification to the new subscriber (only) immediately.
		if(getState() == State.TESTED) 
		{
			sendTestedNotification(newSubscriberRef, project);
		}
		
		ofy().save().entity(this).now();
	}
	
	// Notify all subscribers that this function has become tested.
	private void notifyOnTested(Project project)
	{
		for (Ref<Function> subscriber : notifyOnTested)
		{
			sendTestedNotification(subscriber, project);
		}		
	}
	
	private void sendTestedNotification(Ref<Function> subscriber, Project project)
	{
		load(subscriber).calleeBecameTested(this, project);
	}
		
	//////////////////////////////////////////////////////////////////////////////
	//  UTILITY METHODS
	//////////////////////////////////////////////////////////////////////////////

	// Looks through a string of a function's implementation and returns a list
	// of lines (may be empty) which are the pseudocode for the function call
	public List<String> findPseudocalls(String code)
	{	
		return findSpecialLines(code, "!");
	}
	
	public List<String> findPseudocode(String code)
	{
		return findSpecialLines(code, "#");
	}
	
	// Finds lines in a string of code whose first non-whitespace character is linestarter
	public List<String> findSpecialLines(String code, String linestarter)
	{		
		// Create a new String with a \n at the beginning, so that ! on the first line will
		// still be matched.
		String searchCode = "\n" + code;
		
		List<String> results = new ArrayList<String>();
		
		// Look for lines that begin with a ! and spawn reuse searches for each
		int index = 0;
		
		while (true)
		{
			String callDescription;
			index = searchCode.indexOf("\n"+linestarter, index);
			if (index == -1)
				break;
			
			 // We found a match. Take the whole line (or to the end if this is the last line)
			int nextLineStart = searchCode.indexOf("\n", index + 1);
			if (nextLineStart == -1)
				callDescription = searchCode.substring(index + 2);
			else 
				callDescription = searchCode.substring(index + 2, nextLineStart);

			// add to collection
			results.add(callDescription);
			
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
		System.out.println("State of function "+name+" is now "+getState().name()+".");		
	}
	
	public boolean equals(Object function)
	{
		if(function instanceof Function)
		{
			return this.name.equals(((Function) function).getName()) && this.description.equals(((Function) function).getDescription());
		}
		else
		{
			return false;
		}
	}
}
