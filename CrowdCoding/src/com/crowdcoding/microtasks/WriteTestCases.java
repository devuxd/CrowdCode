package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;

import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Project;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.MicrotaskDTO;
import com.crowdcoding.dto.TestCasesDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class WriteTestCases extends Microtask
{
	@Load private Ref<Function> function;
		
	// Default constructor for deserialization
	private WriteTestCases()
	{		
	}
	
	// Constructor for initial construction
	public WriteTestCases(Function function, Project project)
	{
		super(project);
		this.function = (Ref<Function>) Ref.create(function.getKey());		
		ofy().save().entity(this).now();
	}

	protected void doSubmitWork(MicrotaskDTO dto, Project project)
	{
		function.get().writeTestCasesCompleted((TestCasesDTO) dto, project);	
	}
	
	protected Class getDTOClass()
	{
		return TestCasesDTO.class;
	}	
	
	public String getUIURL()
	{
		return "/html/testcases.jsp";
	}
	
	public Function getFunction()
	{
		return function.getValue();
	}
}
