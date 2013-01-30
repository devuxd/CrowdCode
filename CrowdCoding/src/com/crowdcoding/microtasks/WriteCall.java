package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Project;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.FunctionDTO;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class WriteCall extends Microtask 
{
	@Load private Ref<Function> callee;
	@Load private Ref<Function> caller;
		
	// Default constructor for deserialization
	private WriteCall() 
	{				
	}
	
	// Constructor for initial construction
	public WriteCall(Function caller, Function callee, Project project)
	{
		super(project);
		this.caller = (Ref<Function>) Ref.create(caller.getKey());	
		this.callee = (Ref<Function>) Ref.create(callee.getKey());		
		ofy().save().entity(this).now();
	}
	
	public void onAssign()
	{
		System.out.println("WriteCall for " + caller.get().getName() + " setting active coding");
		caller.get().activeCodingStarted();
	}
	
	protected void doSubmitWork(DTO dto, Project project)
	{
		caller.get().writeCallCompleted((FunctionDTO) dto, project);	
	}
	
	protected Class getDTOClass()
	{
		return FunctionDTO.class;
	}
	
	public String getUIURL()
	{
		return "/html/WriteCall.jsp";
	}
	
	public Function getCaller()
	{
		return caller.getValue();
	}
	
	public Function getCallee()
	{
		return callee.getValue();
	}
}
