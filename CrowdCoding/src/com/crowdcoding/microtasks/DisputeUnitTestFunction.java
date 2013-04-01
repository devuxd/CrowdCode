package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.crowdcoding.Project;
import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Test;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.history.MicrotaskSpawned;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class DisputeUnitTestFunction extends Microtask 
{
	private String description;
	@Load private Ref<Test> test;

	// Default constructor for deserialization
	private DisputeUnitTestFunction() 
	{				
	}

	// Constructor for initial construction
	public DisputeUnitTestFunction(Test test2, String description, Project project)
	{
		super(project);
		this.test = (Ref<Test>) Ref.create(test2.getKey());		
		this.description = description;
		ofy().save().entity(this).now();
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this, test2));
		project.historyLog().endEvent();
	}

	protected void doSubmitWork(DTO dto, Project project)
	{
		FunctionDTO dto2 = (FunctionDTO)dto;
		test.get().disputeUnitTestCorrectionCompleted(dto2, project);	
	}

	protected Class getDTOClass()
	{
		return FunctionDTO.class;
	}

	public String getUIURL()
	{
		return "/html/DisputeUnitTest.jsp";
	}
	
	public String getTestCode()
	{
		return test.getValue().getTestCode();
	}
	
	public String getDescription()
	{
		return description;
	}
	
	public Function getFunction()
	{
		return test.getValue().getFunction();
	}
	
	public Artifact getOwningArtifact()
	{
		return test.get();
	}
	
	public String microtaskTitle()
	{
		return "Correct a unit test";
	}
	
	public String microtaskDescription()
	{
		return "correcting a unit test";
	}
}
