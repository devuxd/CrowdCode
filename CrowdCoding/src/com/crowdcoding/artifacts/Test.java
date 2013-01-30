package com.crowdcoding.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.microtasks.DisputeUnitTestFunction;
import com.crowdcoding.microtasks.DebugTestFailure;
import com.crowdcoding.microtasks.WriteTest;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class Test extends Artifact
{
	public enum State { DESCRIBED, IMPLEMENTED, DISPUTED };
	
	private String description;
	private String code; 	
	private boolean unitTestIsOpen;
	private State state;
	
	@Load private Ref<Function> function;
	private boolean notifyFunctionOnImplemented;
	
	// Constructor for deserialization
	protected Test()
	{
	}
	
	public Test(String description, Function function, Project project)
	{
		super(project);		
		this.description = description;
		this.state = State.DESCRIBED;
		logState();
		this.function = (Ref<Function>) Ref.create(function.getKey());
		notifyFunctionOnImplemented = false;
		ofy().save().entity(this).now();
		WriteTest writeTest = new WriteTest(this, project);
	}
	
	public void writeTestCompleted(FunctionDTO dto, Project project)
	{
		this.code = dto.code;
		state = State.IMPLEMENTED;
		logState();
		boolean areThereOpenUnitTestFunctions = false;
		for (Ref<Test> testCase: function.getValue().getTestCases())
		{
			if(testCase.getValue().isUnitTestOpen())
			{
				areThereOpenUnitTestFunctions = true;
			}		
		}
		if (notifyFunctionOnImplemented) {
			this.function.getValue().runTestsIfReady(project);
		}
		/*
		// this should only trigger if completed, need to figure out how to distinguish
		if(!areThereOpenUnitTestFunctions)
		{
				if(this.function.getValue() != null)
				{
					if(!this.function.getValue().anyTestCasesDisputed())
					{
						DebugTestFailure unitTest = new DebugTestFailure(this.function,project);
					}
				}
				else
				{
					DebugTestFailure unitTest = new DebugTestFailure(this.function,project);
				}
				this.unitTestIsOpen = true;
		}*/
		ofy().save().entity(this).now();
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
	
	public Function getFunction()
	{
		return function.getValue();
	}
	
	public boolean isDisputed()
	{
		return (state == State.DISPUTED);
	}
	public boolean isImplemented()
	{
		System.out.println("Test '"+description+"' was asked if it was implemented.");
		logState();
		return (state == State.IMPLEMENTED);
	}
	public void registerCallback()
	{
		notifyFunctionOnImplemented = true;
		ofy().save().entity(this).now();
	}
	
	public boolean isUnitTestOpen()
	{
		return unitTestIsOpen;
	}

	public void disputeUnitTestCorrectionCreated(FunctionDTO dto, Project project) 
	{
		this.state = State.DISPUTED;
		logState();
		System.out.println(getTestCode());
		System.out.println(getDescription());
		System.out.println(function.getValue().getDescription());
		System.out.println(function.getValue().getFunctionHeader());
		System.out.println(function.getValue().getCode());
		System.out.println(function.getValue().anyTestCasesDisputed());
		ofy().save().entity(this).now();
		DisputeUnitTestFunction disputedTest = new DisputeUnitTestFunction(this, dto.description, project);
		ofy().save().entity(this).now();
	}
	
	public void disputeUnitTestCorrectionCompleted(FunctionDTO dto2, Project project) 
	{
		this.state = State.IMPLEMENTED;
		logState();
		writeTestCompleted(dto2, project);
		ofy().save().entity(this).now();
	}

	public void closeUnitTest()
	{
		this.unitTestIsOpen = false;
		ofy().save().entity(this).now();
	}
	
	private void logState() 
	{
		System.out.println("State of test '"+description+"' is now "+state.name()+".");		
	}
}
