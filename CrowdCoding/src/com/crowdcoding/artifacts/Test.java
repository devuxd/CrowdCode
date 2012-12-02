package com.crowdcoding.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.microtasks.DisputeUnitTestFunction;
import com.crowdcoding.microtasks.UnitTestFunction;
import com.crowdcoding.microtasks.WriteTest;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class Test extends Artifact
{
	private String description;
	private String code; 	
	private boolean disputed;
	@Load private Ref<Function> function;
	
	// Constructor for deserialization
	protected Test()
	{
	}
	
	public Test(String description, Function function, Project project)
	{
		super(project);		
		this.description = description;
		this.function = (Ref<Function>) Ref.create(function.getKey());
		this.disputed = false;
		ofy().save().entity(this).now();
		
		WriteTest writeTest = new WriteTest(this, project);
		// this should only trigger if completed, need to figure out how to distinguish
		UnitTestFunction unitTest = new UnitTestFunction(this.function,project);
	}
	
	public void writeTestCompleted(FunctionDTO dto, Project project)
	{
		this.code = dto.code;
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
		return disputed;
	}

	public void disputeUnitTestCorrectionCreated(FunctionDTO dto, Project project) 
	{
		this.disputed = true;
		DisputeUnitTestFunction disputedTest = new DisputeUnitTestFunction(this, dto.description, project);
	}
	
	public void disputeUnitTestCorrectionCompleted(FunctionDTO dto2, Project project) 
	{
		this.disputed = false;
		writeTestCompleted(dto2, project);
		// only when no other unit test are disputed will we see the unit test function 
		if(!function.getValue().anyTestCasesDisputed())
		{
			UnitTestFunction unitTest = new UnitTestFunction(this.function,project);
		}
	}
}
