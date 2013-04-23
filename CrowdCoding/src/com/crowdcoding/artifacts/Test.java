package com.crowdcoding.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.Project;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.history.StateChange;
import com.crowdcoding.microtasks.DisputeUnitTestFunction;
import com.crowdcoding.microtasks.WriteTest;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Index;
import com.googlecode.objectify.annotation.Load;
import com.googlecode.objectify.cmd.Query;

@EntitySubclass(index=true)
public class Test extends Artifact
{
	public enum State { DESCRIBED, IMPLEMENTED, DISPUTED };
	
	private String description;
	private String code; 	
	@Index private boolean isImplemented;
	private State state;
	
	@Load private Ref<Function> function;
	
	// Constructor for deserialization
	protected Test()
	{
	}
	
	public Test(String description, Function function, Project project)
	{
		super(project);	

		project.historyLog().beginEvent(new StateChange(State.DESCRIBED.name(), this));
		
		this.description = description;
		this.function = (Ref<Function>) Ref.create(function.getKey());
		setState(State.DESCRIBED, project);

		ofy().save().entity(this).now();
		WriteTest writeTest = new WriteTest(this, project);
		
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
	
	public String getName()
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
		return isImplemented;
	}
	
	private void setState(State newState, Project project)
	{
		if (this.state != newState)
		{
			this.state = newState;
			logState();		
			if (newState == State.IMPLEMENTED)
			{
				isImplemented = true;
				ofy().save().entity(this).now();
				function.get().testBecameImplemented(this, project);
			}
			else
				ofy().save().entity(this).now();			
		}				
	}

	public void disputeUnitTestCorrectionCreated(FunctionDTO dto, Project project) 
	{
		project.historyLog().beginEvent(new StateChange(State.DISPUTED.name(), this));		
		setState(State.DISPUTED, project);		
		new DisputeUnitTestFunction(this, dto.description, project);		
		project.historyLog().endEvent();
	}
	
	public void editTestCompleted(FunctionDTO dto, Project project)
	{
		project.historyLog().beginEvent(new StateChange(State.IMPLEMENTED.name(), this));
		
		this.code = dto.code;
		ofy().save().entity(this).now();
		setState(State.IMPLEMENTED, project);
		
		project.historyLog().endEvent();
	}	
	
	private void logState() 
	{
		System.out.println("State of test '"+description+"' is now "+state.name()+".");		
	}
	
	public String toString()
	{
		return "Test " + function.get().getName() + " for '" + description + "' status: " + state.name();
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
