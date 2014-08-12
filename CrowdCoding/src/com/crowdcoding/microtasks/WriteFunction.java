package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

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
public class WriteFunction extends Microtask 
{
	public enum PromptType { SKETCH, DESCRIPTION_CHANGE };		
	@Load private Ref<Function> function;
	private PromptType promptType;		
	
	private String oldFullDescription;		// Only defined for DESCRIPTION_CHANGE
	private String newFullDescription;		// Only defined for DESCRIPTION_CHANGE
	
		
	// Default constructor for deserialization
	private WriteFunction() 
	{				
	}
		
	// Initialization constructor for a SKETCH write function. Microtask is not ready.
	public WriteFunction(Function function, Project project)
	{
		super(project);
		this.promptType = PromptType.SKETCH;
		commonInitialization(function, project);
	}
	
	// Initialization constructor for a DESCRIPTION_CHANGE write function. Microtask is not ready. 
	public WriteFunction(Function function, String oldFullDescription, 
			String newFullDescription, Project project)
	{
		super(project);		
		this.promptType = PromptType.DESCRIPTION_CHANGE;
		
		// First replace \n with BR to format for display. Then, escape chars as necessary.
		this.oldFullDescription = oldFullDescription;	
		this.newFullDescription = newFullDescription;
		
		commonInitialization(function, project);
	}
	
    public Microtask copy(Project project)
    {
    	return new WriteFunction(this.function.getValue(), this.oldFullDescription, this.newFullDescription, project);
    } 
	
	private void commonInitialization(Function function, Project project)
	{
		this.function = (Ref<Function>) Ref.create(function.getKey());		
		ofy().save().entity(this).now();
        postToFirebase(project, function, false);
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this, function));
		project.historyLog().endEvent();
	}
	
	protected void doSubmitWork(DTO dto, Project project)
	{
		function.get().sketchCompleted((FunctionDTO) dto, project);	
	}
	
	public PromptType getPromptType()
	{
		return promptType;
	}	
	
	public String getOldFullDescription()
	{
		return oldFullDescription;
	}
	
	public String getNewFullDescription()
	{
		return newFullDescription;
	}
	
	protected Class getDTOClass()
	{
		return FunctionDTO.class;
	}
	
	public String getUIURL()
	{
		return "/html/writeFunction.jsp";
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
		return "Edit a function";
	}
	
	public String microtaskDescription()
	{
		return "editing a function";
	}
}
