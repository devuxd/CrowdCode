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
	@Load private Ref<Function> caller;
	private String pseudoCall;
	private String calleeFullDescription;
		
	// Default constructor for deserialization
	private WriteCall() 
	{				
	}
	
	// Constructor for initial construction. Microtask is set as not yet ready.
	public WriteCall(Function caller, String calleeFullDescription, String pseudoCall, Project project)
	{
		super(project);
		this.submitValue = 7;
		this.caller = (Ref<Function>) Ref.create(caller.getKey());	
		this.calleeFullDescription = calleeFullDescription;
		this.pseudoCall = pseudoCall;
		ofy().save().entity(this).now();
        postToFirebase(project, caller, false);
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this, caller));
		project.historyLog().endEvent();
	}
	
    public Microtask copy(Project project)
    {
    	return new WriteCall(this.caller.getValue(), this.calleeFullDescription, this.pseudoCall, project);
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
	
	public String getEscapedCalleeFullDescription()
	{
		return StringEscapeUtils.escapeEcmaScript(calleeFullDescription);
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
