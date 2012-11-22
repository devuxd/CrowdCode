package com.crowdcoding.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.dto.FunctionDTO;
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
		
		ofy().save().entity(this).now();
		
		WriteTest writeTest = new WriteTest(this, project);
		// this should only trigger if completed, need to figure out how to distinguish
		UnitTestFunction unitTest = new UnitTestFunction(this.function,project);
	}
	
	public void writeTestCompleted(FunctionDTO dto, Project project)
	{
		Function func = function.getValue();
		
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
	
	public String getDescriptionAndCode()
	{
		return description + " code: " + code;
	}
	
	public Function getFunction()
	{
		return function.getValue();
	}
}
