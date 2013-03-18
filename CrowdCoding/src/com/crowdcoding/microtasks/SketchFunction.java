package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;

import com.crowdcoding.Project;
import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.history.MicrotaskSpawned;
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
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this, function));
		project.historyLog().endEvent();
	}
	
	public void onAssign(Project project)
	{
		System.out.println("Sketch for " + function.get().getName() + " setting active coding");
		function.get().activeCodingStarted(project);
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
	
	public Artifact getOwningArtifact()
	{
		return getFunction();
	}
	
	public String microtaskTitle()
	{
		return "Write a function";
	}
}
