package com.crowdcoding.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.Project;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.TestDTO;
import com.crowdcoding.dto.history.PropertyChange;
import com.crowdcoding.microtasks.WriteTest;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Index;
import com.googlecode.objectify.annotation.Load;
import com.googlecode.objectify.cmd.Query;

@EntitySubclass(index=true)
public class Test extends Artifact
{
	private String description;		// initial one line description give of the test. May be null for tests generated through other means
	@Index private boolean isImplemented;
	@Load private Ref<Function> function;

	private String code; 	
	private boolean hasSimpleTest;
	private List<String> simpleTestInputs = new ArrayList<String>();
	private String simpleTestOutput;	
	
	// Constructor for deserialization
	protected Test()
	{
	}
	
	public Test(String description, Function function, Project project)
	{
		super(project);	

		project.historyLog().beginEvent(new PropertyChange("implemented", "false", this));
		
		this.isImplemented = false;
		this.function = (Ref<Function>) Ref.create(function.getKey());
		this.description = description;
		this.hasSimpleTest = true;
		this.code = generateDefaultUnitTest(function);

		ofy().save().entity(this).now();
		queueMicrotask(new WriteTest(this, project), project);
		
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
		this.code = dto.code;
		this.hasSimpleTest = dto.hasSimpleTest;
		this.simpleTestInputs = dto.simpleTestInputs;
		this.simpleTestOutput = dto.simpleTestOutput;		
		ofy().save().entity(this).now();
		
		microtaskOutCompleted();
		lookForWork(project);		
		checkIfBecameImplemented(project);
	}	
	
	public String toString()
	{
		return "Test " + function.get().getName() + " for '" + description + "' " +
				(isImplemented? " implemented" : " not implemented");
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
