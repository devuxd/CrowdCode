package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;

import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Project;
import com.crowdcoding.artifacts.Test;
import com.crowdcoding.dto.EntrypointDTO;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.MicrotaskDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class WriteTest extends Microtask 
{
	@Load private Ref<Test> test;
	
	// Default constructor for deserialization
	private WriteTest()
	{		
	}
	
	// Constructor for initial construction
	public WriteTest(Test test, Project project)
	{
		super(project);
		this.test = (Ref<Test>) Ref.create(test.getKey());		
		ofy().save().entity(this).now();
	}

	protected void doSubmitWork(MicrotaskDTO dto, Project project)
	{
		test.get().writeTestCompleted((FunctionDTO) dto, project);
	}
	
	protected Class getDTOClass()
	{
		return FunctionDTO.class;
	}	
		
	public String getUIURL()
	{
		return "/html/writeTest.jsp";
	}
}
