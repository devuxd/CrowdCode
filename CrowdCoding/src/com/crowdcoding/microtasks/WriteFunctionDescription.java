package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Project;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.EntrypointDTO;
import com.crowdcoding.dto.FunctionDescriptionDTO;
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
}
