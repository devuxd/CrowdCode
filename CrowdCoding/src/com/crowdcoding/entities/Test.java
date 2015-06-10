package com.crowdcoding.entities;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.commands.MicrotaskCommand;
import com.crowdcoding.dto.TestDTO;
import com.crowdcoding.dto.firebase.TestInFirebase;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.entities.microtasks.WriteTest;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.history.PropertyChange;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.LoadResult;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Subclass;
import com.googlecode.objectify.annotation.Index;

@Subclass(index=true)
public class Test extends Artifact
{
	// initial one line description give of the test. Null if hasDescription is false.
	private String description;
	@Index private boolean isImplemented;
	@Index private boolean isDeleted;			// true iff the test has been deleted.
	private long functionID;
	private int functionVersion;
	private String functionName;

	private String code;
	@Index private boolean hasSimpleTest;

	private List<String> simpleTestInputs = new ArrayList<String>();
	private String simpleTestOutput;


	// Constructor for deserialization
	protected Test()
	{
	}

	public Test(String description, long functionID, String functionName, String projectId, int functionVersion)
	{
		super(projectId);


		this.isImplemented = false;
		this.isDeleted = false;
		this.functionID = functionID;
		this.functionName = functionName;
		this.description = description;
		this.hasSimpleTest = true;
		this.code = ""; //generateDefaultUnitTest(function);
		this.functionVersion= functionVersion;

		ofy().save().entity(this).now();
		HistoryLog.Init(projectId).addEvent(new PropertyChange("implemented", "false", this));

		FunctionCommand.addTest(functionID, this.id, this.description);
		queueMicrotask(new WriteTest(this, projectId,functionVersion), projectId);

	}

	public Test(long functionID, String functionName, String description, List<String> inputs, String output, String code, String projectId, int functionVersion, boolean readOnly)
	{
		super(projectId);


		this.isImplemented = true;
		this.isDeleted = false;
		this.functionID = functionID;
		this.functionName = functionName;
		this.description = description;
		this.hasSimpleTest = true;
		this.code = code;
		this.simpleTestInputs = inputs;
		this.simpleTestOutput = output;
		this.functionVersion = functionVersion;
		this.isReadOnly=readOnly;

		ofy().save().entity(this).now();
		FunctionCommand.addTest(functionID, this.id, this.description);

		// The test is already fully implemented. It just needs to be run.
		//project.requestTestRun();
		FunctionCommand.testBecameImplemented(functionID, this.getID());

		HistoryLog.Init(projectId).addEvent(new PropertyChange("implemented", "true", this));
	}

	public String getTestCode()
	{
		if(code == null)
		{
			return "";
		}
		return code;
	}

	public String getDescription()
	{
		return description;
	}

	public boolean hasDescription()
	{
		return description.length() > 0;
	}

	public void setDescription(String description)
	{
		this.description = description;

		ofy().save().entity(this).now();
		storeToFirebase(projectId);
	}

	public String getName()
	{
		return description;
	}

	public String getFunctionName()
	{
		return functionName;
	}

	public long getFunctionID()
	{
		return functionID;
	}

	public boolean isImplemented()
	{
		return isImplemented;
	}


	public void setSimpleTestOutput(String simpleTestOutput, Project project)
	{
		this.simpleTestOutput = simpleTestOutput;
		ofy().save().entity(this).now();

		//project.requestTestRun();
	}

	// Checks the status of the test, marking it as implemented if appropriate
	private void checkIfBecameImplemented(String projectId)
	{
		if (!isImplemented && ! isDeleted && !workToBeDone())
		{
			// A test becomes implemented when it has no more work to do
			HistoryLog.Init(projectId).addEvent(new PropertyChange("implemented", "true", this));
			this.isImplemented = true;
			ofy().save().entity(this).now();
//			storeToFirebase(projectId);
			FunctionCommand.testBecameImplemented(functionID, this.id);
		}
	}

	private void setNotImplemented()
	{
		HistoryLog.Init(projectId).addEvent(new PropertyChange("implemented", "false", this));
		this.isImplemented = false;
		ofy().save().entity(this).now();
		storeToFirebase(projectId);
		FunctionCommand.testReturnUnimplemented(functionID, this.getID());
	}

	public void writeTestCompleted(TestDTO dto, String projectId)
	{
		microtaskOutCompleted();

		if( !isDeleted ) {
			if (dto.inDispute) {
				if( dto.disputeFunctionText!="" ) {
					FunctionCommand.disputeFunctionSignature(functionID, dto.disputeFunctionText, this.getID());
				}
				else if( dto.disputeTestText!="" ) {
					FunctionCommand.disputeTestCases(functionID, dto.disputeTestText, this.description, this.getID());
				}
				setNotImplemented();
			}
			else {

				this.functionVersion = dto.functionVersion;
				this.code = dto.code;
				this.hasSimpleTest = dto.hasSimpleTest;
				this.simpleTestInputs = dto.simpleTestInputs;
				this.simpleTestOutput = dto.simpleTestOutput;
				ofy().save().entity(this).now();
				checkIfBecameImplemented(projectId);
				storeToFirebase(projectId);
			}
			lookForWork();
		}
	}

	public void storeToFirebase(String projectId)
	{
		int firebaseVersion = version + 1;

		FirebaseService.writeTest(new TestInFirebase(this.id, firebaseVersion , code, hasSimpleTest, simpleTestInputs,
			simpleTestOutput, description, functionName, functionID, isImplemented, isReadOnly, isDeleted), this.id, firebaseVersion, projectId);

		incrementVersion();
	}

	// Queues the specified microtask and looks for work
	public void queueMicrotask(Microtask microtask, String projectId)
	{
		super.queueMicrotask(microtask, projectId);

		// merge the tasks in queue
		if( microtask instanceof WriteTest ){
			WriteTest newTask = (WriteTest) microtask;

			// if in queue there is another WriteTest
			// with the same prompt type,
			// remove it from the queue
			LinkedList<Ref<Microtask>> queueCopy = new LinkedList<Ref<Microtask>>(this.queuedMicrotasks);
			for(Ref<Microtask> q:queueCopy){
				WriteTest task = ((WriteTest) q.get());
				if( task.getPromptType().equals(newTask.getPromptType()) ){
					this.queuedMicrotasks.remove(q);
					MicrotaskCommand.cancelMicrotask(task.getKey());
				}
			}


		}


	}

	/******************************************************************************************
	 * Commands
	 *****************************************************************************************/

	public void dispute(String issueDescription, String projectId, int functionVersion)
	{
		setNotImplemented();
		queueMicrotask(new WriteTest(this, issueDescription, projectId, functionVersion), projectId);
	}

	// Marks this test as deleted, removing it from the list of tests on its owning function.
	public void delete()
	{
		this.isDeleted = true;
		ofy().save().entity(this).now();
		storeToFirebase(projectId);

	}

	// Notify this test that the function under test has changed its interface.
	public void functionChangedInterface(String oldFullDescription, String newFullDescription, String projectId, int functionVersion)
	{
		if(!this.isReadOnly){
			setNotImplemented();
			queueMicrotask(new WriteTest(this, oldFullDescription, newFullDescription, projectId, functionVersion), projectId);

		}
	}


	public void functionChangedName(String name, String projectId,
			int functionVersion) {
		if(!this.isReadOnly){
			this.functionName = name;
			storeToFirebase(projectId);
			ofy().save().entity(this).now();
		}
	}

	/******************************************************************************************
	 * Objectify Datastore methods
	 *****************************************************************************************/

	// Given a ref to a function that has not been loaded from the datastore,
	// load it and get the object
	public static Test load(Ref<Test> ref)
	{
		return ofy().load().ref(ref).now();
	}

	// Given an id for a test, finds the corresponding test. Returns null if no such test exists.
	public static Test find(long id)
	{
		return (Test) ofy().load().key(Artifact.getKey(id)).now();
	}

	// Generates a simple test key for the specified function and list of inputs
	private static String generateSimpleTestKey(String functionName, List<String> inputs)
	{
		return functionName + "**:" + inputs.toString();
	}


	/******************************************************************************************
	 * Logging methods
	 *****************************************************************************************/

	public String toString()
	{
		return "Test " + functionName + " for '" + description + "' " +
				(isImplemented? " implemented" : " not implemented")
				+ (isDeleted? " DELETED " : "");
	}

}
