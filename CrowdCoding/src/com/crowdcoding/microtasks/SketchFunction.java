package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;

import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Project;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.DTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class SketchFunction extends Microtask 
{
	@Load private Ref<Function> function;
		
	// Default constructor for deserialization
	private SketchFunction() 
	{				
	}
	
	// Constructor for initial construction
	public SketchFunction(Function function, Project project)
	{
		super(project);
		this.function = (Ref<Function>) Ref.create(function.getKey());		
		ofy().save().entity(this).now();
	}
	
	protected void doSubmitWork(DTO dto, Project project)
	{
		function.get().sketchCompleted((FunctionDTO) dto, project);	
	}
	
	protected Class getDTOClass()
	{
		return FunctionDTO.class;
	}
	
	public String getUIURL()
	{
		return "/html/sketch.jsp";
	}
	
	public Function getFunction()
	{
		return function.getValue();
	}
}
