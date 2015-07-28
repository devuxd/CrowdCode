package com.crowdcoding.entities.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.commons.lang3.StringUtils;

import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.commands.ProjectCommand;
import com.crowdcoding.commands.StubCommand;
import com.crowdcoding.commands.TestCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ajax.TestResultDTO;
import com.crowdcoding.dto.ajax.microtask.submission.DescribeFunctionBehaviorDTO;
import com.crowdcoding.dto.ajax.microtask.submission.FunctionDTO;
import com.crowdcoding.dto.ajax.microtask.submission.ImplementBehaviorDTO;
import com.crowdcoding.dto.ajax.microtask.submission.FunctionParameterDTO;
import com.crowdcoding.dto.ajax.microtask.submission.StubDTO;
import com.crowdcoding.dto.ajax.microtask.submission.TestDTO;
import com.crowdcoding.dto.ajax.microtask.submission.TestDisputedDTO;
import com.crowdcoding.dto.firebase.artifacts.FunctionInFirebase;
import com.crowdcoding.entities.microtasks.DescribeFunctionBehavior;
import com.crowdcoding.entities.microtasks.DescribeFunctionBehavior.PromptType;
import com.crowdcoding.entities.microtasks.ImplementBehavior;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.history.ArtifactCreated;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.util.FirebaseService;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
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
	//Function data
	private String        code = "";
	@Index private String name = "";
	private String        returnType = "";
	private List<String>  paramNames = new ArrayList<String>();
	private List<String>  paramTypes = new ArrayList<String>();
	private List<String>  paramDescriptions = new ArrayList<String>();
	private String        header = "";
	private String        description = "";
	private int           linesOfCode = 0;
	private boolean 	  isCompleted; // flag to signal when all the behavior of the function have been written


	private int testSuiteVersion;     // version of all the test suite, is increased every time that a test or a stub is changed


	private List<Long> testsId = new ArrayList<Long>(); // test associated to the function
	private List<Long> stubsId = new ArrayList<Long>(); // stub associated to the function
	private List<Long> ADTsId  = new ArrayList<Long>(); // ADTs used by the function


	// Calls made by this function
	private List<Long> calleesId = new ArrayList<Long>();

	// current callers to this function:
	private List<Long> callersId = new ArrayList<Long>();

	//Microtask Data
	protected Queue<Ref<Microtask>> queuedDescribeFunctionBehavior = new LinkedList<Ref<Microtask>>();
	private Ref<Microtask> describeFunctionBehaviorOut = null;

	protected Queue<Ref<Microtask>> queuedImplementBehavior = new LinkedList<Ref<Microtask>>();
	private boolean isImplementationInProgress = false;



	/******************************************************************************************
	 * Constructor
	 *****************************************************************************************/

	// Constructor for deserialization
	protected Function(){}

	// Constructor for a function that has a full description and code
	public Function(String name, String returnType, List<FunctionParameterDTO> parameters, String header,
			String description, String code, boolean isAPIArtifact, boolean isReadOnly, String projectId)
	{
		super(isAPIArtifact, isReadOnly, projectId);
		this.name = name;
		this.returnType = returnType;

		for(FunctionParameterDTO parameter : parameters)
		{
			this.paramNames.add(parameter.name);
			this.paramTypes.add(parameter.type);
			this.paramDescriptions.add(parameter.description);
		}

		this.header = header;
		this.description = description;
		this.code = code;
		this.linesOfCode = StringUtils.countMatches(this.code, "\n") + 2;

		this.isCompleted=false;

		ofy().save().entities(this).now();

		FunctionCommand.lookForWork(this.id);

		HistoryLog.Init(projectId).addEvent(new ArtifactCreated( this ));
		storeToFirebase();

	}


	/******************************************************************************************
	 * Accessors
	 *****************************************************************************************/

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

		// gets the body of the function (including braces)
	public String getCode()
	{
		return code;
	}

	/******************************************************************************************
	 * Private Core Functionalities
	 *****************************************************************************************/

	// If there is no microtask currently out for this artifact, looks at the queued microtasks.
	// If there is a microtasks available, marks it as ready to be done.
	public void lookForWork()
	{
		System.out.println("looking for work, function completed:"+this.isCompleted);
		//before checks if the function is still active
		if( ! isDeleted()){
			//  when there are no Describe Function Behavior in progress
			if( describeFunctionBehaviorOut == null ){
				//first checks if there are enqueued describe function behavior microtasks
				if(queuedDescribeFunctionBehavior.isEmpty()){
					// if the function is not complete, spawn a new describe function behavior microtask
					if(! this.isCompleted){
						Microtask mtask = new DescribeFunctionBehavior(getRef(), getId(), name, projectId);
						ProjectCommand.queueMicrotask(mtask.getKey(), null);
						describeFunctionBehaviorOut =  Ref.create(mtask.getKey());
					}
					// check if the function need to be implemented
					checkImplementationNeeded();

				}
				else{
					// only if an implementation is not in progress spawn a describe beahvior previously enqueued
					if(! isImplementationInProgress){
						Ref<Microtask> mtask = queuedDescribeFunctionBehavior.remove();
						ProjectCommand.queueMicrotask(mtask.getKey(), null);
						describeFunctionBehaviorOut = mtask;
					}
				}

			} else {
				DescribeFunctionBehavior task = (DescribeFunctionBehavior) ofy().load().ref(describeFunctionBehaviorOut).now();
				System.out.println("LOADED TASK FROM REF "+task + ", ref was "+describeFunctionBehaviorOut);
				if( task.getPromptType() == PromptType.WRITE && queuedDescribeFunctionBehavior.isEmpty()){
					checkImplementationNeeded();
				}
			}

		}
		ofy().save().entity(this).now();

	}

	private void onWorkEdit(FunctionDTO dto, String projectId)
	{

		// Looper over all of the callers, rebuilding our list of callers
		rebuildCalleeList(dto.callees);

		// create the stubs for the given callees
		createCalleeStubs(dto.callees);

		// Check if the description is changed (considering only parameters name and type, return type and function name).
		// If so, notify all the callers of this function.
		if ( isDescriptionChanged(dto) ){
			notifyDescriptionChanged();
		}

		// update all the data
		this.name = dto.name;
		this.description = dto.description;
		this.header = dto.header;

        List<FunctionParameterDTO> parameters = dto.parameters;

        //clear the previous lists
        this.paramNames.clear();
        this.paramTypes.clear();
        this.paramDescriptions.clear();

        //creates the updated ones
        for(FunctionParameterDTO parameter : parameters)
        {
            this.paramNames.add(parameter.name);
            this.paramTypes.add(parameter.type);
            this.paramDescriptions.add(parameter.description);
        }

        // update the returnType
		this.returnType=dto.returnType;

		// Update the function data
		this.code = dto.code;

		linesOfCode = StringUtils.countMatches(dto.code, "\n") + 2;

		ofy().save().entities(this).now();
		storeToFirebase();

		FunctionCommand.lookForWork(this.id);
	}


	/******************************************************************************************
	 * Microtasks Generations Hendlers
	****************************************************************************************/

	// Queues the specified microtask and looks for work
	public void queueDescribeFunctionBehavior(Microtask microtask)
	{
		queuedDescribeFunctionBehavior.add(Ref.create(microtask.getKey()));
		lookForWork();
	}

	// Queues the specified microtask and looks for work
	public void queueImplementFunctionBehavior(Microtask microtask)
	{
		System.out.println("queing ");
		queuedImplementBehavior.add(Ref.create(microtask.getKey()));
		lookForWork();
	}
	private void newImplementBehavior(long failedTestId)
	{
		ProjectCommand.queueMicrotask(new ImplementBehavior(this, failedTestId, projectId).getKey(), null);
	}

	private void checkImplementationNeeded(){
		// if at least 1 test is present and there is no other implementation in progress
		// if there is at least 1 implementation enqued spawn that otherwise run the tests
		if( testsId.size() > 0 && !isImplementationInProgress ){
			isImplementationInProgress =  true;

			if( queuedImplementBehavior.isEmpty() ){
				FunctionCommand.runTests(this.getId());
			}
			else{
				ProjectCommand.queueMicrotask(queuedImplementBehavior.remove().getKey(), null);
			}
		}
		ofy().save().entities(this).now();
	}

	private void disputeFunctionSignature(String issueDescription, long disputeId,String projectId)
	{
		queueImplementFunctionBehavior(new ImplementBehavior(this, issueDescription, projectId));
	}

	/******************************************************************************************
	 * Microtasks Completions Hendlers
	****************************************************************************************/

	public void describeFunctionBehaviorCompleted(DescribeFunctionBehaviorDTO dto)
	{
		System.out.println("DTO RECEIVED : "+dto.json());
		describeFunctionBehaviorOut = null;

		if(dto.disputeFunctionText != null && dto.disputeFunctionText !=""){
			queueImplementFunctionBehavior( new ImplementBehavior(this, dto.disputeFunctionText, projectId) );
		}

		//goes throug all the test to add delete or update them
		for( TestDTO testDTO : dto.tests ){
			if(testDTO.deleted)
				TestCommand.delete(testDTO.id);
			else if (testDTO.added )
				TestCommand.create(testDTO.description, testDTO.code, this.getId(), false, false);
			else if (testDTO.edited )
				TestCommand.update(testDTO.id, testDTO.description, testDTO.code);
		}

		if( dto.isDescribeComplete )
			this.isCompleted = true;

		ofy().save().entity(this).now();

		FunctionCommand.lookForWork(this.id);

	}

	public void implementBehaviorCompleted(ImplementBehaviorDTO dto, long disputantId, String projectId)
	{
		isImplementationInProgress = false;

		//create a descrbie function behavior for each disputed test
		for( TestDisputedDTO disputedTest : dto.disputedTests){
			queueDescribeFunctionBehavior(  new DescribeFunctionBehavior(
												this.getRef(),
												getId(),
												name,
												disputedTest.id,
												disputedTest.disputeText,
												projectId));
		}

		// creates all the function requested if any
		createRequestedFunctions(dto.requestedFunctions);

		// update the submitted function
		onWorkEdit(dto.function, projectId);



	}

	private void checkIfNeeded()
	{
		//if is not called by anyone means that is not anymore needed
		if( this.callersId.isEmpty())
			deactivateFunction(null);
	}

	/******************************************************************************************
	 * Command Receivers
	****************************************************************************************/

	public void runTests(){

		FirebaseService.writeTestJobQueue(getId(), version, testSuiteVersion, projectId);
	}

	public void submittedTestResult(String jsonDto){
		System.out.println("test submitted "+ jsonDto);
		try {
			TestResultDTO testResult = (TestResultDTO)DTO.read(jsonDto, TestResultDTO.class);

			if(! testResult.areTestsPassed )
				newImplementBehavior(testResult.failedTestId);
			else{
				queuedImplementBehavior.clear();
				isImplementationInProgress = false;

			}
		} catch( JsonParseException e) {
			e.printStackTrace();
		} catch( JsonMappingException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}

		ofy().save().entity(this).now();

	}

	// Notifies the function that it has a new caller function
	public void addCaller(long functionId)
	{

		//remove the function from the pseudocaller list
		callersId.add(functionId);

		if( isDeleted() )
			reactivateFunction();

		ofy().save().entity(this).now();
	}

	// Notifies the function that it is no longer called by the caller
	public void removeCaller(long functionId)
	{
		callersId.remove(functionId);

		checkIfNeeded();

		ofy().save().entity(this).now();
	}

	// Notifies the function that it has a new callee function
	public void addCallee(long functionId)
	{

		//remove the function from the pseudocaller list
		calleesId.add(functionId);

		ofy().save().entity(this).now();
	}

	public void calleeChangedInterface(long calleeId, int oldCalleeVersion){
		checkImplementationNeeded();
	}

	public void calleeBecomeDeactivated(long calleeId, String disputeText)
	{
		calleesId.remove(calleeId);
		ofy().save().entity(this).now();
		queueImplementFunctionBehavior(new ImplementBehavior(this, disputeText, calleeId, projectId));
	}

	public void addTest(long testId){
		testsId.add(testId);
		incrementTestSuiteVersion();
		ofy().save().entities(this).now();
	}
	public void addStub(long stubId){
		stubsId.add(stubId);
		incrementTestSuiteVersion();
		ofy().save().entities(this).now();
	}

	/******************************************************************************************
	 * Command Senders
	****************************************************************************************/

	//notify the test that the dispute is solved
	private void notifyTestDisputeCompleted(long testId)
	{
		//TODO
	}

	//Notify all the callers and all the test of this function that is not anymore active
	private void deactivateFunction(String disputeFunctionText)
	{

		deleteArtifact();
		storeToFirebase();
		for (long callerID : callersId)
			FunctionCommand.calleeBecomeDeactivated(callerID, this.getId(), disputeFunctionText);
	}



	// Send out notifications, as appropriate, that the description or header of this
	// function has changed
	private void notifyDescriptionChanged()
	{
		for (long callerID : callersId)
			FunctionCommand.calleeChangedInterface(callerID, this.getId(), this.version);
	}

	/******************************************************************************************
	 * Utility Methods
	****************************************************************************************/

	//change status of the function from deleted to undeleted
	private void reactivateFunction()
	{
		unDeleteArtifact();
		storeToFirebase();
		lookForWork();
	}

	// Diffs the new and old callee list, sending notifications to callees about who their
	// callers are as appropriate. Updates the callee list when done
	private void rebuildCalleeList(List<FunctionDTO> submittedCallees)
	{
		//retrieves the Ids of the submitted functions
		List<Long> submittedCalleeIds = new ArrayList<Long>();
		for(FunctionDTO callee : submittedCallees)
			submittedCalleeIds.add(callee.id);


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
	}

	// checks if the new submitted description differs from the old one
	public boolean isDescriptionChanged(FunctionDTO dto)
	{
		// checks if the name has changed
		if( ! dto.name.equals(this.name))
			return true;

		// checks if the return type has changed
		if( ! dto.returnType.equals(this.returnType))
			return true;

		//checks if the number of parameters has changed
		if( dto.parameters.size() != this.paramTypes.size())
			return true;

		// check for each parameter that the name and the type is still the same
		for( FunctionParameterDTO parameter : dto.parameters){
			if( ! paramTypes.contains( parameter.type ) || ! paramNames.contains( parameter.name ) )
				return true;
		}

		return false;

	}

	// for each requested function, create it
	public void createRequestedFunctions(List<FunctionDTO> functions)
	{
		for(FunctionDTO function : functions){
			FunctionCommand.createRequestedFunction(getId(), function);
		}
	}


	public void createCalleeStubs(List<FunctionDTO> callees)
	{
		for(FunctionDTO callee: callees){
			for(StubDTO stub : callee.stubs){
				if( stub.id == 0)
					StubCommand.create(stub.inputsKey, stub.output, callee.id, false, false);
				else
					StubCommand.update(stub.id, stub.output);
			}
		}
	}

	public void incrementTestSuiteVersion(){
		testSuiteVersion++ ;
		ofy().save().entities(this).now();
		FirebaseService.incrementTestSuiteVersion(this.getId(), this.testSuiteVersion, projectId);
	}

	public void storeToFirebase()
	{
		int firebaseVersion = version + 1;

		FirebaseService.writeFunction(new FunctionInFirebase(
					name,
					this.id,
					firebaseVersion,
					returnType,
					paramNames,
					paramTypes,
					paramDescriptions,
					header,
					description,
					code,
					linesOfCode,
					ADTsId,
					calleesId,
					testSuiteVersion,
					isReadOnly,
					isAPIArtifact,
					isDeleted
				),
				this.id, firebaseVersion, projectId);
		incrementVersion();

	}

    // Given an id for a functon, finds the corresponding function. Returns null if no such function exists.
    public static Function find(long id)
    {
        return (Function) ofy().load().key(Artifact.getKey(id)).now();
    }

	// Given a ref to a function that has not been loaded from the datastore,
	// load it and get the object
	public static Function load(Ref<Function> ref)
	{
		return ofy().load().ref(ref).now();
	}




}
