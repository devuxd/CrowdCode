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
import com.googlecode.objectify.annotation.Load;
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
	// string that uniquely describes what the simple test tests. Null for tests that don't have a simple test.
	@Index private int simpleTestKeyHash;  // a hash of the key

	private List<String> simpleTestInputs = new ArrayList<String>();
	private String simpleTestOutput;

	// Attempts to find a simple test for the specified function and inputs.
	// Returns the test, if such a test exists, or null otherwise.
	public static Test findSimpleTestFor(String functionName, List<String> inputs, Project project)
	{
		List<Test> tests = ofy().load().type(Test.class).ancestor(project.getKey())
				.filter("simpleTestKeyHash", generateSimpleTestKeyHash(functionName, inputs))
				.filter("isDeleted", false).list();

		String simpleTestKey = generateSimpleTestKey(functionName, inputs);

		// iterate over the matches to find the exact one, in case the hash matches multiple test cases
		for (Test test : tests)
		{
			// TODO: this will not work whenever the function changes name. We should prob use the
			// function ID here instead.
			if (simpleTestKey.equals(generateSimpleTestKey(test.functionName, test.simpleTestInputs)))
			{
				return test;
			}
		}

		return null;
	}

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
		this.simpleTestKeyHash = generateSimpleTestKeyHash(functionName, inputs);
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
		if (!isImplemented && !workToBeDone())
		{
			// A test becomes implemented when it has no more work to do
			HistoryLog.Init(projectId).addEvent(new PropertyChange("implemented", "true", this));
			this.isImplemented = true;
			ofy().save().entity(this).now();

			System.out.println("--> TEST "+this.id+": implemented for function "+functionID+ " - tID:" +this.id);
			FunctionCommand.testBecameImplemented(functionID, this.id);

		}
	}

	public void writeTestCompleted(TestDTO dto, String projectId)
	{
		if (dto.inDispute)
		{
			if( dto.disputeFunctionText!="" ) {
				HistoryLog.Init(projectId).addEvent(new PropertyChange("implemented", "false", this));

				// Ignore any of the content for the test, if available. Set the test to unimplemented.
				this.isImplemented = false;

				ofy().save().entity(this).now();
				microtaskOutCompleted();

				FunctionCommand.disputeFunctionSignature(functionID, dto.disputeFunctionText, this.getID());
				lookForWork();
			}
			else if( dto.disputeTestText!="" ) {
				HistoryLog.Init(projectId).addEvent(new PropertyChange("implemented", "false", this));

				// Ignore any of the content for the test, if available. Set the test to unimplemented.
				this.isImplemented = false;
				ofy().save().entity(this).now();
				microtaskOutCompleted();

				FunctionCommand.disputeTestCases(functionID, dto.disputeTestText, this.description, this.getID());

				lookForWork();
			}
			FunctionCommand.testReturnUnimplemented(functionID, this.getID());

		}
		else
		{
			this.code = dto.code;
			this.hasSimpleTest = dto.hasSimpleTest;
			this.simpleTestInputs = dto.simpleTestInputs;
			this.simpleTestOutput = dto.simpleTestOutput;
			if (dto.hasSimpleTest)
				this.simpleTestKeyHash = generateSimpleTestKeyHash(functionName, dto.simpleTestInputs);

			ofy().save().entity(this).now();

			microtaskOutCompleted();
			lookForWork();
			checkIfBecameImplemented(projectId);
		}
	}

	public void storeToFirebase(String projectId)
	{
		incrementVersion();
		if (this.isDeleted)
			FirebaseService.deleteTest(this.id, projectId);
		else
			FirebaseService.writeTest(new TestInFirebase(this.id, version, code, hasSimpleTest, simpleTestInputs,
				simpleTestOutput, description, functionName, functionID, isImplemented, isReadOnly), this.id, version, projectId);
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
					System.out.println("#### REMOVING FROM TEST QUEUE "+q);
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
		HistoryLog.Init(projectId).addEvent(new PropertyChange("implemented", "false", this));
		this.isImplemented = false;
		ofy().save().entity(this).now();
		queueMicrotask(new WriteTest(this, issueDescription, projectId, functionVersion), projectId);
	}

	// Marks this test as deleted, removing it from the list of tests on its owning function.
	public void delete()
	{
		this.isDeleted = true;
		ofy().save().entity(this).now();
	}

	// Notify this test that the function under test has changed its interface.
	public void functionChangedInterface(String oldFullDescription, String newFullDescription, String projectId, int functionVersion)
	{
		if(!this.isReadOnly)
			queueMicrotask(new WriteTest(this, oldFullDescription, newFullDescription, projectId, functionVersion), projectId);
	}


	public void functionChangedName(String name, String projectId,
			int functionVersion) {
		if(!this.isReadOnly){
			this.functionName = name;
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
	public static LoadResult<Test> find(long id)
	{
		return (LoadResult<Test>) ofy().load().key(Artifact.getKey(id));
	}

	// Generates a simple test key for the specified function and list of inputs
	private static String generateSimpleTestKey(String functionName, List<String> inputs)
	{
		return functionName + "**:" + inputs.toString();
	}

	private static int generateSimpleTestKeyHash(String functionName, List<String> inputs)
	{
		return generateSimpleTestKey(functionName, inputs).hashCode();
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
