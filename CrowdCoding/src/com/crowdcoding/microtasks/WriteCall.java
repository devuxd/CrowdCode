package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import org.apache.commons.lang3.StringEscapeUtils;

import com.crowdcoding.Project;
import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.history.MicrotaskSpawned;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class WriteCall extends Microtask 
{
	@Load private Ref<Function> callee;
	@Load private Ref<Function> caller;
	private String pseudoCall;
		
	// Default constructor for deserialization
	private WriteCall() 
	{				
	}
	
	// Constructor for initial construction. Microtask is set as not yet ready.
	public WriteCall(Function caller, Function callee, String pseudoCall, Project project)
	{
		super(project, false);
		this.caller = (Ref<Function>) Ref.create(caller.getKey());	
		this.callee = (Ref<Function>) Ref.create(callee.getKey());
		this.pseudoCall = pseudoCall;
		ofy().save().entity(this).now();
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this, caller));
		project.historyLog().endEvent();
	}
	
	protected void doSubmitWork(DTO dto, Project project)
	{
		caller.get().writeCallCompleted((FunctionDTO) dto, project);	
	}
	
	// Returns true iff the microtask still needs to be done
	protected boolean isStillNeeded(Project project) 
	{
		// AddCall is still needed iff the pseudocall is still in the code
		return caller.get().containsPseudoCall(pseudoCall);		
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
	
	public String getEscapedPseudoCall()
	{
		return StringEscapeUtils.escapeEcmaScript(pseudoCall);
	}
	
	public Artifact getOwningArtifact()
	{
		return getCaller();
	}
	
	public String microtaskTitle()
	{
		return "Add a call";
	}
	
	public String microtaskDescription()
	{
		return "adding a call";
	}
}
