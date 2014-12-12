package com.crowdcoding.entities;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.dto.TestDTO;
import com.crowdcoding.dto.firebase.TestInFirebase;
import com.crowdcoding.entities.microtasks.WriteTest;
import com.crowdcoding.history.PropertyChange;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Index;

@EntitySubclass(index=true)
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

	public Test(String description, long functionID, String functionName, Project project, int functionVersion)
	{
		super(project);

		project.historyLog().beginEvent(new PropertyChange("implemented", "false", this));

		this.isImplemented = false;
		this.isDeleted = false;
		this.functionID = functionID;
		this.functionName = functionName;
		this.description = description;
		this.hasSimpleTest = true;
		this.code = ""; //generateDefaultUnitTest(function);
		this.functionVersion= functionVersion;

		ofy().save().entity(this).now();
		FunctionCommand.addTest(functionID, this.id);
		queueMicrotask(new WriteTest(this, project,functionVersion), project);

		project.historyLog().endEvent();
	}

	public Test(long functionID, String functionName, List<String> inputs, String output, String code, Project project, int functionVersion)
	{
		super(project);

		project.historyLog().beginEvent(new PropertyChange("implemented", "true", this));

		this.isImplemented = true;
		this.isDeleted = false;
		this.functionID = functionID;
		this.functionName = functionName;
		this.description = "";
		this.hasSimpleTest = true;
		this.code = code;
		this.simpleTestInputs = inputs;
		this.simpleTestOutput = output;
		this.simpleTestKeyHash = generateSimpleTestKeyHash(functionName, inputs);
		this.functionVersion = functionVersion;

		ofy().save().entity(this).now();
		FunctionCommand.addTest(functionID, this.id);

		// The test is already fully implemented. It just needs to be run.
		project.requestTestRun();

		project.historyLog().endEvent();
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

	// Gets a TestDTO (in String format) corresponding to the state of this test
	public String getTestDTO()
	{
		TestDTO dto = new TestDTO(this.code, this.hasSimpleTest, this.simpleTestInputs, this.simpleTestOutput);
		return dto.json();
	}

	public void setSimpleTestOutput(String simpleTestOutput, Project project)
	{
		this.simpleTestOutput = simpleTestOutput;
		ofy().save().entity(this).now();

		project.requestTestRun();
	}

	// Checks the status of the test, marking it as implemented if appropriate
	private void checkIfBecameImplemented(Project project)
	{
		if (!isImplemented && !workToBeDone())
		{
			// A test becomes implemented when it has no more work to do
			project.historyLog().beginEvent(new PropertyChange("implemented", "true", this));
			this.isImplemented = true;
			ofy().save().entity(this).now();

			System.out.println("Test became implemented for functionID="+functionID);
			FunctionCommand.testBecameImplemented(functionID, this.id);

			project.historyLog().endEvent();
		}
	}

	public void writeTestCompleted(TestDTO dto, Project project)
	{
		if (dto.isFunctionDispute)
		{
			project.historyLog().beginEvent(new PropertyChange("implemented", "false", this));

			// Ignore any of the content for the test, if available. Set the test to unimplemented.
			this.isImplemented = false;
			ofy().save().entity(this).now();
			microtaskOutCompleted();

			FunctionCommand.disputeFunctionSignature(functionID, dto.disputeText);

			project.historyLog().endEvent();
			lookForWork(project);
		}

		else if (dto.inDispute)
		{
			project.historyLog().beginEvent(new PropertyChange("implemented", "false", this));

			// Ignore any of the content for the test, if available. Set the test to unimplemented.
			this.isImplemented = false;
			ofy().save().entity(this).now();
			microtaskOutCompleted();

			FunctionCommand.disputeTestCases(functionID, dto.disputeText, this.description);

			project.historyLog().endEvent();
			lookForWork(project);
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
			lookForWork(project);
			checkIfBecameImplemented(project);
		}
	}

	public void storeToFirebase(Project project)
	{
		incrementVersion();
		if (this.isDeleted)
			FirebaseService.deleteTest(this.id, project);
		else
			FirebaseService.writeTest(new TestInFirebase(this.id, version, code, hasSimpleTest, simpleTestInputs,
				simpleTestOutput, description, functionName, functionID, isImplemented), this.id, version, project);
	}

	/******************************************************************************************
	 * Commands
	 *****************************************************************************************/

	public void dispute(String issueDescription, Project project, int functionVersion)
	{
		project.historyLog().beginEvent(new PropertyChange("implemented", "false", this));
		this.isImplemented = false;
		ofy().save().entity(this).now();
		queueMicrotask(new WriteTest(this, issueDescription, project, functionVersion), project);
		project.historyLog().endEvent();
	}

	// Marks this test as deleted, removing it from the list of tests on its owning function.
	public void delete()
	{
		this.isDeleted = true;
		ofy().save().entity(this).now();
	}

	// Notify this test that the function under test has changed its interface.
	public void functionChangedInterface(String oldFullDescription, String newFullDescription, Project project, int functionVersion)
	{
		// TODO: should we resave the function name here??

		queueMicrotask(new WriteTest(this, oldFullDescription, newFullDescription, project, functionVersion), project);
	}


	/******************************************************************************************
	 * Objectify Datastore methods
	 *****************************************************************************************/

	// Given a ref to a function that has not been loaded from the datastore,
	// load it and get the object
	public static Test load(Ref<Test> ref)
	{
		return ofy().load().ref(ref).get();
	}

	// Given an id for a test, finds the corresponding test. Returns null if no such test exists.
	public static Ref<Test> find(long id, Project project)
	{
		return (Ref<Test>) ofy().load().key(Artifact.getKey(id, project));
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
