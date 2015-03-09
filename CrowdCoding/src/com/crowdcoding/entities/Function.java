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
import com.crowdcoding.dto.DebugDTO;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.FunctionDescriptionDTO;
import com.crowdcoding.dto.FunctionParameterDTO;
import com.crowdcoding.dto.PseudoFunctionDTO;
import com.crowdcoding.dto.ReusedFunctionDTO;
import com.crowdcoding.dto.TestCaseDTO;
import com.crowdcoding.dto.TestCasesDTO;
import com.crowdcoding.dto.TestDTO;
import com.crowdcoding.dto.TestDescriptionDTO;
import com.crowdcoding.dto.TestDisputedDTO;
import com.crowdcoding.dto.firebase.FunctionInFirebase;
import com.crowdcoding.entities.microtasks.DebugTestFailure;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.entities.microtasks.ReuseSearch;
import com.crowdcoding.entities.microtasks.WriteCall;
import com.crowdcoding.entities.microtasks.WriteFunction;
import com.crowdcoding.entities.microtasks.WriteFunctionDescription;
import com.crowdcoding.entities.microtasks.WriteTestCases;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.history.MessageReceived;
import com.crowdcoding.history.PropertyChange;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.LoadResult;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Subclass;
import com.googlecode.objectify.annotation.Index;



/* A function represents a function of code. Functions transition through states, spawning microtasks,
 * which, upon completion, transition the state. Some of these microtasks may create other artifacts,
 * which also transition through states; these transitions may in turn be signaled back to a function.
 */
@Subclass(index=true)
public class Function extends Artifact
{
	private String        code = "";
	@Index private String name = "";
	private String        returnType = "";
	private List<String>  paramNames = new ArrayList<String>();
	private List<String>  paramTypes = new ArrayList<String>();
	private List<String>  paramDescriptions = new ArrayList<String>();
	private String        header = "";
	private String        description = "";
	private List<Long>    testsId = new ArrayList<Long>();
	private List<Boolean> testsImplemented = new ArrayList<Boolean>();
	private List<String>  testsDescription = new ArrayList<String>();
	private int           linesOfCode = 0;
	private boolean 	  waitForTestResult=false;
	private Queue<Ref<Microtask>> queuedTestAndDebugMicrotask = new LinkedList<Ref<Microtask>>();

	// flags about the status of the function
	@Index private boolean isWritten;	     // true iff Function has no pseudocode and has been fully implemented (but may still fail tests)
	@Index private boolean hasBeenDescribed; // true iff Function is at least in the state described
	

	// fully implemented (i.e., not psuedo) calls made by this function
	private List<Long> calleesId = new ArrayList<Long>();
	// current callers with a fully implemented callsite to this function:
	private List<Long> callersId = new ArrayList<Long>();
	// pseudocalls made by this function:
	private List<String> pseudoFunctionsDescription = new ArrayList<String>();
	private List<String> pseudoFunctionsName = new ArrayList<String>();

	// function that select this function in the reuse search microtask
	private List<String> pseudoCallersDescription = new ArrayList<String>();
	private List<String> pseudoCallersName = new ArrayList<String>();
	private List<Long>   pseudoCallersId = new ArrayList<Long>();

	private boolean needsDebugging = false; // true iff Function is failing the (implemented) unit tests
	private boolean isTestCasesOut = false;
	private boolean isDebugOut     = false;
	private boolean isDebugInQueue = false;

	//////////////////////////////////////////////////////////////////////////////
	//  CONSTRUCTORS
	//////////////////////////////////////////////////////////////////////////////

	// Constructor for deserialization
	protected Function(){}

	// Constructor for a function that has a full description and code
	public Function(String name, String returnType, List<FunctionParameterDTO> parameters, String header,
			String description, String code, boolean readOnly, String projectId)
	{
		super(projectId);
		this.isReadOnly=readOnly;
		this.isAPIArtifact=true;
		isWritten = false;
		writeDescriptionCompleted(new FunctionDescriptionDTO( name, returnType, parameters, header, description, code), projectId);
	}

	// Constructor for a function that only has a short call description and still needs a full description
	public Function(String name, String callDescription, long callerId, String projectId)
	{
		super(projectId);

		isWritten = false;
		hasBeenDescribed=false;
		this.name = name;
		this.description=callDescription;
		this.isActivated=false;
		ofy().save().entity(this).now();
		storeToFirebase(projectId);
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

	// ------- TEST CASES

	
	public List<Ref<Test>> getTestCases(String projectId)
	{
		// Build refs for each test case
		ArrayList<Ref<Test>> testRefs = new ArrayList<Ref<Test>>();
		for (long testID : testsId)
			testRefs.add( (Ref<Test>) Ref.create( Artifact.getKey(testID) ) );

		return testRefs;
	}

	// Deletes the specified test from the list of tests
	public void deleteTest(long testToDeleteID)
	{
		int position = testsId.indexOf(testToDeleteID);
		if (position != -1)
		{
			testsId.remove(position);
			testsImplemented.remove(position);
			testsDescription.remove(position);
		}
		runTestsIfReady();
	}

	// Adds the specified test for this function
	public void addTest(long testID, String testDescription)
	{
		testsId.add(testID);
		testsImplemented.add(false);
		testsDescription.add(testDescription);

		runTestsIfReady();
		//if the function is not needed send the notification
		if( ! isActivated())
			TestCommand.functionBecomeDeactivated(testID);
	}
	//////////////////////////////////////////////////////////////////////////////
	//  PRIVATE CORE FUNCTIONALITY
	//////////////////////////////////////////////////////////////////////////////

	private void setWritten(boolean isWritten)
	{
		if (this.isWritten != isWritten)
		{
			this.isWritten = isWritten;
			ofy().save().entity(this).now();
			storeToFirebase(projectId);
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
		storeToFirebase(projectId);
	}

	// If there is no microtask currently out for this artifact, looks at the queued microtasks.
	// If there is a microtasks available, marks it as ready to be done.
	public void lookForWork()
	{
		//System.out.println("needed"+this.isActivated+"microtaskOut"+microtaskOut+"testCaseOut"+testCaseOut);
		//if the function is needed
		if(this.isActivated){
			// if there is no work in progress and there is work waiting
			// make the first microtask in queue out
			if ( microtaskOut == null && !queuedMicrotasks.isEmpty()){
				Microtask mtask = ofy().load().ref(queuedMicrotasks.remove()).now();
				
				// if is a debug test failure
				if( mtask instanceof DebugTestFailure ) {
					// if no write test cases out
					// make the microtask out
					if( !isTestCasesOut ){
						isDebugOut = true;
						makeMicrotaskOut( mtask );
					} 
					
					// otherwise enqueue again
					// the debug test failure
					else {
						queueMicrotask( mtask, projectId );
					}
				} 
				// otherwise put out the microtask
				else 
					makeMicrotaskOut( mtask );
			}

			// if there aren't write test cases or debugging microtask out and the
			// queue is not empty, make the first out
			if ( !isDebugOut && !isTestCasesOut && !queuedTestAndDebugMicrotask.isEmpty())
				makeTestCasesOut( ofy().load().ref( queuedTestAndDebugMicrotask.remove()).now() );
		}
	}



	// Makes the specified microtask out for work
	protected void makeTestCasesOut(Microtask microtask)
	{
		isTestCasesOut = true;
		ofy().save().entity(this).now();
		ProjectCommand.queueMicrotask(microtask.getKey(), null);

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


		if(testsId.size()==0)
			return false;
		else{
			for (Boolean implemented:testsImplemented)
			{
				if( !implemented )
					return false;
			}
		}
		return true;
	}

	// Determines if at least one unit tests is implemented
	private boolean unitTestsImplemented()
	{
		if(testsId.size()==0) 
			return false;
		else{
			for (Boolean implemented : testsImplemented)
				if( implemented )
					return true;
			
			// if we're here, no tests were implemented
			return false;
		}
	}


	private void runTestsIfReady(){
		Boolean oneImplemented = unitTestsImplemented();
		// function written +
		// not waiting for test result +
		// at least one of the tests is implemented +
		// the function needs debugging
		if( isWritten && !this.waitForTestResult && oneImplemented && this.needsDebugging ){
			// enqueue test job in firebase
			
			String implementedIds = "";
			int index;
			int size = this.testsId.size();
			for( index = 0; index < size ; index++){
				if( this.testsImplemented.get(index) ){

					implementedIds += this.testsId.get(index) + ",";
				}
			}
			if( implementedIds.length() > 0 )
				implementedIds = implementedIds.substring(0, implementedIds.length()-1 );
			
			this.waitForTestResult=true;
			FunctionCommand.writeTestJobQueue(this.getID(), this.version, implementedIds);
		}
		ofy().save().entity(this).now();

	}

	private void onWorkerEdited(FunctionDTO dto, String projectId)
	{
		// Check if the description or header changed (ignoring whitespace changes).
		// If so, generate DescriptionChange microtasks for callers and tests.
		String strippedOldFullDescrip = (this.getParametersAndReturn()).replace(" ", "").replace("\n", "");
		String strippedNewFullDescrip = (dto.getParametersAndReturn()).replace(" ", "").replace("\n", "");
		Boolean descChanged = !strippedOldFullDescrip.equals(strippedNewFullDescrip);
		Boolean nameChanged = !this.name.equals(dto.name);
		if ( descChanged || nameChanged )
			notifyDescriptionChanged(dto,descChanged,nameChanged);

		// Update the function data
		this.code = dto.code;
		this.name = dto.name;
		this.description = dto.description;
		this.header = dto.header;

		List<FunctionParameterDTO> parameters = dto.parameters;
		this.paramNames.clear();
		this.paramTypes.clear();
		this.paramDescriptions.clear();
		for(FunctionParameterDTO parameter : parameters)
		{
			this.paramNames.add(parameter.name);
			this.paramTypes.add(parameter.type);
			this.paramDescriptions.add(parameter.description);
		}
		this.returnType=dto.returnType;
		linesOfCode = StringUtils.countMatches(dto.code, "\n") + 2;

		// Looper over all of the callers, rebuilding our list of callers
		rebuildCalleeList(dto.calleeIds);

		// Look for pseudocode and psuedocalls
		List<PseudoFunctionDTO> submittedPseudoFunctions = dto.pseudoFunctions;
		List<String> newPseudoFunctionsName        = new ArrayList<String>();
		List<String> newPseudoFunctionsDescription = new ArrayList<String>();
		
		// if pseudo functions were submitted 
		if( ! submittedPseudoFunctions.isEmpty() ){
			
			setWritten(false);
			// for each of them, 
			for (PseudoFunctionDTO submittedPseudoFunction : submittedPseudoFunctions){
				// if not already in the previously submitted pseudo functions,
				// spawn a reuse search microtask
				if (!pseudoFunctionsName.contains(submittedPseudoFunction.name)){
					// Spawn microtask immediately, as it does not require access to the function itself
					Microtask microtask = new ReuseSearch(this, submittedPseudoFunction.name, submittedPseudoFunction.description, projectId);
					ProjectCommand.queueMicrotask(microtask.getKey(), null);
				}
				newPseudoFunctionsDescription.add(submittedPseudoFunction.description);
				newPseudoFunctionsName.add(submittedPseudoFunction.name);
			}
			
		} 
		// if there is pseudocode
		else if( !findPseudocode(code).isEmpty() ){
			setWritten(false);
			// and if the artifact microtask queue is empty, spawn a 
			// new write function microtask
			if(queuedMicrotasks.isEmpty())
				queueMicrotask(new WriteFunction(this,projectId), projectId);

		} 
		// otherwise the function is complete
		else {
			setWritten(true);
		}
		
		// Update the list of psudoFunctions to match the current (distinct) pseudofunctons now in the code
		this.pseudoFunctionsName        = newPseudoFunctionsName;
		this.pseudoFunctionsDescription = newPseudoFunctionsDescription;

		storeToFirebase(projectId);
		
		runTestsIfReady();

		lookForWork();

	}


	// Diffs the new and old callee list, sending notifications to callees about who their
	// callers are as appropriate. Updates the callee list when done
	private void rebuildCalleeList(List<Long> submittedCalleeIds)
	{
		// First, find new callees added, if any
		List<Long> newCallees = new ArrayList<Long>(submittedCalleeIds);
		newCallees.removeAll(this.calleesId);

		// If there are any, send notifications to these functions that they have a new caller
		for (Long newCalleeId : newCallees)
		{
			FunctionCommand.addCaller(newCalleeId, this.id);
		}

		// Next, find any callees removed, if any
		List<Long> removedCallees = new ArrayList<Long>(this.calleesId);
		removedCallees.removeAll(submittedCalleeIds);

		// Send notifications to these functions that they no longer have this caller
		for (Long removedCalleeIds : removedCallees)
		{
			FunctionCommand.removeCaller(removedCalleeIds, this.id);
		}

		this.calleesId = submittedCalleeIds;
		ofy().save().entity(this).now();
	}

	//////////////////////////////////////////////////////////////////////////////
	//  MICROTASK COMPLETION HANDLERS
	//////////////////////////////////////////////////////////////////////////////

	public void sketchCompleted(FunctionDTO dto, long disputantId, String projectId)
	{
		microtaskOutCompleted();
		if( dto.inDispute ){
			deactivateFunction(dto.disputeFunctionText);
			queueMicrotask(new WriteFunction(this, projectId), projectId);

		}
		else{
			if(disputantId!=0){
				// if the dispute was issued by this artifact means that was a write test case
				if(disputantId==this.getID())
					queueWriteTestCase(new WriteTestCases(this, projectId));
				else{
					//otherwise is a test
					notifyTestDisputeCompleted(disputantId);
				}
			}
			onWorkerEdited(dto, projectId);

		}
	}

	public void reuseSearchCompleted(ReusedFunctionDTO dto, String pseudoFunctionName, String pseudoFunctionDescription, String projectId)
	{
		Function callee;

		if (dto.noFunction)
		{
			// Create a new function for this call, spawning microtasks to create it.
			callee = new Function(pseudoFunctionName, pseudoFunctionDescription, this.getID(), projectId);
			dto.functionId = callee.getID();
		}
		// Have the callee let us know when it's tested (which may already be true;
		// signal sent immediately in that case)
		FunctionCommand.addPseudocaller(dto.functionId, this.getID(),pseudoFunctionName, pseudoFunctionDescription);
	}

	public void writeDescriptionCompleted(FunctionDescriptionDTO dto, String projectId)
	{
		microtaskOutCompleted();
		if(dto.inDispute){
			deactivateFunction(dto.disputeFunctionText);
			//remove the caller that generate the microtask from the pseudocaller of this function
			removePseudocaller(dto.callerId);
		}
		else {
			this.name = dto.name;
			this.returnType = dto.returnType;

			List<FunctionParameterDTO> parameters = dto.parameters;

			this.paramNames.clear();
			this.paramTypes.clear();
			this.paramDescriptions.clear();
			for(FunctionParameterDTO parameter : parameters)
			{
				this.paramNames.add(parameter.name);
				this.paramTypes.add(parameter.type);
				this.paramDescriptions.add(parameter.description);
			}

			this.header = dto.header;
			this.description = dto.description;
			this.code = dto.code;
			this.linesOfCode = StringUtils.countMatches(this.code, "\n") + 2;

			ofy().save().entity(this).now();

			setDescribed(projectId);

			//Spawn off microtask to write test cases. As it does not impact the artifact itself,
			// the microtask can be directly started rather than queued.
			queueWriteTestCase(new WriteTestCases(this, projectId));

			// Spawn off microtask to sketch the method
			queueMicrotask(new WriteFunction(this, projectId), projectId);
		}
	}

	public void writeTestCasesCompleted(TestCasesDTO dto, long disputeId, String projectId)
	{
		isTestCasesOut = false;

		if(dto.inDispute){
			disputeFunctionSignature(dto.disputeFunctionText, this.getID(), projectId);
		}
		else{
			for (TestCaseDTO testCase : dto.testCases)
			{
				// Note: the id in the testCase is *only* valid for testcases where added is false.

				// If it's an add, create a test
				if (testCase.added)
				{
					System.out.println("creating test with version: "+dto.functionVersion);
					TestCommand.create(testCase.text, this.id, this.name, dto.functionVersion);
				}
				// else if is a delete, remove the test
				else if (testCase.deleted)
				{
					TestCommand.delete(testCase.id);
					deleteTest(testCase.id);
				}
				else
				{
					int position = testsId.indexOf((long)testCase.id);
					if(position !=-1 ){


						if (!testsDescription.get(position).equals(testCase.text))
						{
							testsDescription.set(position, testCase.text);
							TestCommand.testEdited(testCase.id, testCase.text, dto.functionVersion);
						}
						//if the test that made the dispute was not edited generates again the write test microtask
						else if(testCase.id == disputeId)
						{
							TestCommand.disputeCompleted(testCase.id, dto.functionVersion);

						}
					}
					else
						System.out.println("ERROR : testsID: "+testCase.id +" not available for the function: "+ this.name);
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

	public void debugTestFailureCompleted( DebugDTO dto, String projectId)
	{
		isDebugOut = false;

		if( !dto.hasPseudo ){
			// PUT TESTS IN DISPUTE
			if( dto.disputedTests.size() > 0 )
			{
				for( TestDisputedDTO disputedTest: dto.disputedTests){

					TestCommand.dispute( disputedTest.id, disputedTest.disputeText, version);
					testReturnUnimplemented( disputedTest.id );
				}
			} 

			// CREATE THE STUBS 
			// Update or create tests for any stub
			for (TestDTO testDTO : dto.stubs)
			{
				TestCommand.create(testDTO.functionID,testDTO.functionName,testDTO.description,testDTO.simpleTestInputs,testDTO.simpleTestOutput,testDTO.code,this.version, false);
			}
			
			
		} 

		microtaskOutCompleted();
		onWorkerEdited( dto.functionDTO, projectId);
	}

	//////////////////////////////////////////////////////////////////////////////
	//  COMMAND HANDLERS
	//////////////////////////////////////////////////////////////////////////////

	// This method notifies the function that it has just passed all of its tests.
	public void passedTests(String projectId)
	{
		waitForTestResult = false;
		HistoryLog.Init(projectId).addEvent(new MessageReceived("PassedTests", this));
		
		this.needsDebugging = false;
		
		ofy().save().entity(this).now();

		storeToFirebase(projectId);
		lookForWork();
		System.out.println("FUNCTION ID: "+ this.getID()+" ALL TEST PASSED");

	}

	// This method notifies the function that it has failed at least one of its tests
	public void failedTests(String projectId)
	{

		waitForTestResult = false;
		HistoryLog.Init(projectId).addEvent(new MessageReceived("FailedTests", this));

		
		if ( isWritten && !this.waitForTestResult && microtaskOut == null && this.queuedMicrotasks.isEmpty() ){
			DebugTestFailure debug = new DebugTestFailure(this,projectId);
			this.queueMicrotask( debug, projectId);
		}

		ofy().save().entity(this).now();

		lookForWork();
		System.out.println("FUNCTION ID: "+ this.getID()+" TEST FAILED");

	}



	// Provides notification that a test has transitioned to being implemented
	public void testBecameImplemented(long testId)
	{
		this.needsDebugging = true;
		
		int position = testsId.indexOf(testId);
		if(position!=-1)
			testsImplemented.set(position, true);

		runTestsIfReady();
	}

	// Provides notification that a test has transitioned to not being implemented
	public void testReturnUnimplemented(long testId)
	{
		int position = testsId.indexOf(testId);
		if(position!=-1)
			testsImplemented.set(position, false);
		ofy().save().entity(this).now();

	}

	// Notifies the function that it has a new caller function
	public void addCaller(long functionId)
	{

		//remove the function from the pseudocaller list
		callersId.add(functionId);

		removePseudocaller(functionId);

		if( !isActivated() )
			reactivateFunction();

		ofy().save().entity(this).now();
	}

	// Notifies the function that it is no longer called by function
	public void removeCaller(long functionId)
	{
		callersId.remove(functionId);

		checkIfNeeded();

		ofy().save().entity(this).now();
	}

	private void checkIfNeeded()
	{
		//if is not animore called by anyone means that is not anymore needed
		if( this.callersId.isEmpty() && this.pseudoCallersId.isEmpty() )
			deactivateFunction(null);


	}
	public void removePseudocaller(long functionId)
	{
		int index = pseudoCallersId.indexOf(functionId);
		if(index!=-1){
			pseudoCallersId.remove(index);
			pseudoCallersName.remove(index);
			pseudoCallersDescription.remove(index);
			checkIfNeeded();
		}
		ofy().save().entity(this).now();



	}
	public void addPseudocaller(long pseudoCallerId, String pseudoCallerName, String pseudoCallerDescription)
	{
		//if the functon has not yet been described and is not needed creates a new write description microtask
		//this is needed because the write function description microtask was disputed and so the function
		//has never been described
		if( (! hasBeenDescribed()) && (! isActivated()) && pseudoCallersId.isEmpty() )
			makeMicrotaskOut(new WriteFunctionDescription(this, pseudoCallerName,pseudoCallerDescription, pseudoCallerId, projectId));

		//add it to the lists
		pseudoCallersId.add(pseudoCallerId);
		pseudoCallersDescription.add(pseudoCallerDescription);
		pseudoCallersName.add(pseudoCallerName);

		//if it's already been described, send the notification to the new subscriber (only) immediately.
		if(hasBeenDescribed())
			sendDescribedNotification(pseudoCallerId, pseudoCallerName);
		ofy().save().entity(this).now();
	}

	public void calleeBecameDescribed(long calleeId, String pseudoFunctionName, String projectId)
	{
		HistoryLog.Init(projectId).addEvent(new MessageReceived("AddCall", this));
		setWritten(false);

		queueMicrotask(new WriteCall(this, calleeId, pseudoFunctionName, projectId), projectId);
	}


	public void calleeBecomeDeactivated(long calleeId, String disputeText, String projectId)
	{
		calleesId.remove(calleeId);
		setWritten(false);
		ofy().save().entity(this).now();

		queueMicrotask(new WriteFunction(this, calleeId, disputeText, projectId), projectId);
	}

	public void calleeChangedInterface(String oldFullDescription, String newFullDescription, String projectId)
	{
		setWritten(false);
		queueMicrotask(new WriteFunction(this, oldFullDescription, newFullDescription, projectId), projectId);
	}

	public void disputeTestCases(String issueDescription, String testDescription, long artifactId, String projectId)
	{
		queueWriteTestCase(new WriteTestCases(this, issueDescription, testDescription, artifactId,projectId));
	}

	public void disputeFunctionSignature(String issueDescription, long disputeId,String projectId)
	{
		setWritten(false);

		queueMicrotask(new WriteFunction(this, issueDescription, disputeId, projectId), projectId);
	}

	// Queues the specified microtask and looks for work
	private void queueWriteTestCase(Microtask microtask)
	{
		queuedTestAndDebugMicrotask.add(Ref.create(microtask.getKey()));
		ofy().save().entity(this).now();
		lookForWork();
	}

	//////////////////////////////////////////////////////////////////////////////
	//   NOTIFICATION SENDERS
	//////////////////////////////////////////////////////////////////////////////

	//notify the test that the dispute is solved
	private void notifyTestDisputeCompleted(long testId)
	{
		if(testsId.contains(testId))
			TestCommand.disputeCompleted(testId, this.version);
	}

	//Notify all the callers and all the test of this function that is not anymore active
	private void deactivateFunction(String disputeFunctionText)
	{

		setActivated(false);
		if(!isAPIArtifact){
			for (long testId : testsId){
				TestCommand.functionBecomeDeactivated(testId);
			}
			if(disputeFunctionText!=null){
				for (long callerID : callersId)
					FunctionCommand.calleeBecomeDeactivated(callerID, this.getID(), disputeFunctionText);

				for (long pseudoCallerID : pseudoCallersId)
					FunctionCommand.calleeBecomeDeactivated(pseudoCallerID, this.getID(), disputeFunctionText);
			}
		}
	}

	//Notify all tests that the function is active again
	private void reactivateFunction()
	{
		setActivated(true);
		//for each test send a notification that the function has been reactivated
		for (long testId : testsId)
			TestCommand.functionReturnActive(testId);

		runTestsIfReady();
		lookForWork();
	}

	// Notify all subscribers that this function has become described.
	private void notifyBecameDescribed(String projectId)
	{
		// Loop over the psuedocallsites and pseudocallers in parallel
		for (int i = 0; i < pseudoCallersName.size(); i++)
			sendDescribedNotification(pseudoCallersId.get(i) ,pseudoCallersName.get(i));
	}

	private void sendDescribedNotification(long subscriberID, String pseudoFunctionName)
	{
		FunctionCommand.calleeBecameDescribed(subscriberID, this.getID(), pseudoFunctionName);
	}

	// Send out notifications, as appropriate, that the description or header of this
	// function has changed
	private void notifyDescriptionChanged(FunctionDTO dto,Boolean descChanged,Boolean nameChanged)
	{

		for (long callerID : callersId)
			FunctionCommand.calleeChangedInterface(callerID, this.getFullDescription(), dto.getCompleteDescription() + dto.header);

		for (long testID : testsId){
			if( nameChanged )
				TestCommand.functionChangedName(testID,dto.name,version);

			if( descChanged )
				TestCommand.functionChangedInterface(
						testID,
						this.getFullDescription(),
						(dto.getCompleteDescription() + dto.header),
						version);
		}


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
		int firebaseVersion = version + 1;

		FirebaseService.writeFunction(new FunctionInFirebase(name, this.id, firebaseVersion, returnType, paramNames,
				paramTypes, paramDescriptions, header, description, code, linesOfCode, this.pseudoFunctionsName,this.pseudoFunctionsDescription , hasBeenDescribed, isWritten, needsDebugging, isReadOnly,
				queuedMicrotasks.size()),
				this.id, firebaseVersion, projectId);
		incrementVersion();

	}

	// Looks through a string of a function's implementation and returns a list
	// of lines (may be empty) which are the pseudocode for the function call
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
