package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.Project;
import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.FunctionDescriptionDTO;
import com.crowdcoding.dto.history.MicrotaskSpawned;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class WriteFunctionDescription extends Microtask 
{
	@Load private Ref<Function> function;
	@Load private Ref<Function> caller;
	private String callDescription;
	 
	// Default constructor for deserialization
	private WriteFunctionDescription()
	{		
	}
	
	// Constructor for initial construction
	public WriteFunctionDescription(Function function, String callDescription, Function caller, 
			Project project)
	{
		super(project);
		this.submitValue = 8;
		this.callDescription = callDescription;
		this.function = (Ref<Function>) Ref.create(function.getKey());	
		this.caller = (Ref<Function>) Ref.create(caller.getKey());	
		ofy().save().entity(this).now();
        postToFirebase(project, function);
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this, function));
		project.historyLog().endEvent();
	}
	
	protected void doSubmitWork(DTO dto, Project project)
	{
		FunctionDescriptionDTO functionDTO = (FunctionDescriptionDTO) dto;	
		
		// The initial code for a function is a line of pseudocode that instructs
		// the worker to only remove it when the function is done. This keeps regenerating
		// new sketch tasks until the worker has marked it as done by removing the pseudocode
		// line.
		String code = "{\n\t//#Mark this function as implemented by removing this line.\n}";	
		
		function.get().writeDescriptionCompleted(functionDTO.name, functionDTO.returnType, functionDTO.paramNames, 
				functionDTO.paramTypes, functionDTO.header, functionDTO.description, code, project);	
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
	
	public Function getCaller()
	{
		return caller.get();
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
