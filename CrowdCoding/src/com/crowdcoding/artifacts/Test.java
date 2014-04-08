package com.crowdcoding.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.StringEscapeUtils;

import com.crowdcoding.Project;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.MockDTO;
import com.crowdcoding.dto.MocksDTO;
import com.crowdcoding.dto.TestDTO;
import com.crowdcoding.dto.history.PropertyChange;
import com.crowdcoding.microtasks.WriteTest;
import com.crowdcoding.microtasks.WriteTestCases;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Index;
import com.googlecode.objectify.annotation.Load;
import com.googlecode.objectify.cmd.Query;

@EntitySubclass(index=true)
public class Test extends Artifact
{
	// initial one line description give of the test. Null if hasDescription is false.
	private String description;		
	@Index private boolean isImplemented;
	@Index private boolean isDeleted;			// true iff the test has been deleted.
	@Load private Ref<Function> function;

	private String code; 	
	@Index private boolean hasSimpleTest;
	// string that uniquely describes what the simple test tests. Null for tests that don't have a simple test.
	@Index private String simpleTestKey;		
	private List<String> simpleTestInputs = new ArrayList<String>();
	private String simpleTestOutput;	
	
	// Attempts to find a simple test for the specified function and inputs.
	// Returns the test, if such a test exists, or null otherwise.
	public static Test findSimpleTestFor(String functionName, List<String> inputs, Project project)
	{
		Ref<Test> testRef = ofy().load().type(Test.class).ancestor(project.getKey())
				.filter("simpleTestKey", generateSimpleTestKey(functionName, inputs))
				.filter("isDeleted", false)
				.first();  
		if (testRef == null)
			return null;
		else
			return testRef.get();
	}
	
	// Returns a JSON string (in MockDTO format), escaped for Javascriptt
	public static String allMocksInSystemEscaped(Project project)
	{
		List<MockDTO> mockDTOs = new ArrayList<MockDTO>();
		Query<Test> simpleTests = ofy().load().type(Test.class).ancestor(project.getKey()).filter(
				"hasSimpleTest", true).filter("isImplemented", true).filter("isDeleted", false);
		for (Test simpleTest : simpleTests)		
			mockDTOs.add(new MockDTO(simpleTest.getFunction().getName(), simpleTest.simpleTestInputs, 
					simpleTest.simpleTestOutput));

		MocksDTO mocksDTO = new MocksDTO(mockDTOs);
		return StringEscapeUtils.escapeEcmaScript(mocksDTO.json());
	}	
	
	// Constructor for deserialization
	protected Test()
	{
	}
	
	public Test(String description, Function function, Project project)
	{
		super(project);	

		project.historyLog().beginEvent(new PropertyChange("implemented", "false", this));
		
		this.isImplemented = false;
		this.isDeleted = false;
		this.function = (Ref<Function>) Ref.create(function.getKey());
		this.description = description;
		this.hasSimpleTest = true;
		this.code = generateDefaultUnitTest(function);

		ofy().save().entity(this).now();
		function.addTest(this);
		queueMicrotask(new WriteTest(this, project), project);
		
		project.historyLog().endEvent();
	}	
	
	public Test(Function function, List<String> inputs, String output, String code, Project project)
	{
		super(project);	

		project.historyLog().beginEvent(new PropertyChange("implemented", "true", this));
		
		this.isImplemented = true;
		this.isDeleted = false;
		this.function = (Ref<Function>) Ref.create(function.getKey());
		this.description = "";
		this.hasSimpleTest = true;
		this.code = code;
		this.simpleTestInputs = inputs;
		this.simpleTestOutput = output;
		this.simpleTestKey = generateSimpleTestKey(function.getName(), inputs);

		ofy().save().entity(this).now();
		function.addTest(this);
		
		// The test is already fully implemented. It just needs to be run.
		project.requestTestRun();
		
		project.historyLog().endEvent();		
	}

	private String generateDefaultUnitTest(Function function)
	{	     
	      StringBuilder builder = new StringBuilder();
	      builder.append("equal(");
	      builder.append(function.getName());
	      builder.append("(");
	      for(String paramName : function.getParamNames()){
	           builder.append("<" + paramName + ">,");
	      }
	      builder.replace(builder.length()-1,builder.length(),"");
	      builder.append("), <expectedResult>, '" + getDescription() + "');");
	      return builder.toString();
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
	
	public Function getFunction()
	{
		return function.getValue();
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
	
	// Marks this test as deleted, removing it from the list of tests on its owning function.
	public void delete(Function function)
	{
		this.isDeleted = true;
		ofy().save().entity(this).now();		
		function.deleteTest((Key<Test>) this.getKey());
	}
	
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
	
	// Checks the status of the test, marking it as implemented if appropriate
	private void checkIfBecameImplemented(Project project)
	{
		if (!isImplemented && !workToBeDone())
		{
			// A test becomes implemented when it has no more work to do
			project.historyLog().beginEvent(new PropertyChange("implemented", "true", this));
			this.isImplemented = true;
			ofy().save().entity(this).now();
			
			function.get().testBecameImplemented(this, project);
			
			project.historyLog().endEvent();
		}				
	}

	public void disputeUnitTestCorrectionCreated(FunctionDTO dto, Project project) 
	{
		project.historyLog().beginEvent(new PropertyChange("implemented", "false", this));		
		this.isImplemented = false;
		ofy().save().entity(this).now();
		queueMicrotask(new WriteTest(this, dto.description, project), project);		
		project.historyLog().endEvent();
	}
	
	public void writeTestCompleted(TestDTO dto, Project project)
	{
		if (dto.inDispute)
		{
			project.historyLog().beginEvent(new PropertyChange("implemented", "false", this));	
			
			// Ignore any of the content for the test, if available. Set the test to unimplemented.			
			this.isImplemented = false;
			ofy().save().entity(this).now();
			microtaskOutCompleted();
			
			// Queue a microtask to edit the test cases.
			// The function needs to queue the microtask, as it spans all tests and there
			// should only be one of these on a function at a time. But ok if tests are being edited - 
			// can still queue something when its done...
			Function function = this.function.get();			
			function.queueMicrotask(new WriteTestCases(function, dto.disputeText, this.description, project), project);
			
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
				this.simpleTestKey = generateSimpleTestKey(getFunction().getName(), dto.simpleTestInputs);		
			ofy().save().entity(this).now();
			
			microtaskOutCompleted();
			lookForWork(project);		
			checkIfBecameImplemented(project);
		}
	}
	
	// Generates a simple test key for the specified function and list of inputs
	private static String generateSimpleTestKey(String functionName, List<String> inputs)
	{
		return functionName + "**:" + inputs.toString();		
	}
	
	public String toString()
	{
		return "Test " + function.get().getName() + " for '" + description + "' " +
				(isImplemented? " implemented" : " not implemented")
				+ (isDeleted? " DELETED " : "");
	}
	
	public static String StatusReport(Project project)
	{
		StringBuilder output = new StringBuilder();
		
		output.append("**** ALL TESTS ****\n");
		
		Query<Test> q = ofy().load().type(Test.class).ancestor(project.getKey());		
		for (Test test : q)
			output.append(test.toString() + "\n");
		
		return output.toString();
	}
}
