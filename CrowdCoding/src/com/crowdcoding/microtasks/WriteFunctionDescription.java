package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.Project;
import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.EntrypointDTO;
import com.crowdcoding.dto.FunctionDescriptionDTO;
import com.crowdcoding.dto.history.MicrotaskSpawned;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class WriteFunctionDescription extends Microtask 
{
	@Load private Ref<Function> function;
	private String callDescription;
	 
	// Default constructor for deserialization
	private WriteFunctionDescription()
	{		
	}
	
	// Constructor for initial construction
	public WriteFunctionDescription(Function function, String callDescription, Project project)
	{
		super(project);
		this.callDescription = callDescription;
		this.function = (Ref<Function>) Ref.create(function.getKey());		
		ofy().save().entity(this).now();
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this, function));
		project.historyLog().endEvent();
	}
	
	protected void doSubmitWork(DTO dto, Project project)
	{
		FunctionDescriptionDTO functionDTO = (FunctionDescriptionDTO) dto;	
		function.get().writeDescriptionCompleted(functionDTO.name, functionDTO.description, functionDTO.returnType, 
				functionDTO.parameters, project);	
	}
	
	protected Class getDTOClass()
	{
		return FunctionDescriptionDTO.class;
	}	
	
	public String getCallDescription()
	{
		return callDescription;
	}
	
	public String getUIURL()
	{
		return "/html/WriteFunctionDescription.jsp";
	}	
	
	public Artifact getOwningArtifact()
	{
		return function.get();
	}
	
	public String microtaskTitle()
	{
		return "Write a function description";
	}
	
	public String microtaskDescription()
	{
		return "describing a function";
	}
}
