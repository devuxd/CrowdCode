package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.Project;
import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Test;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.TestDTO;
import com.crowdcoding.dto.history.MicrotaskSpawned;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class WriteTest extends Microtask
{
	public enum PromptType { WRITE, CORRECT, FUNCTION_CHANGED };	
	
	@Load private Ref<Test> test;
	private PromptType promptType;
	
	private String issueDescription;			// Only defined for CORRECT
	private String oldFunctionDescription;		// Only defined for FUNCTION_CHANGED
	private String newFunctionDescription;		// Only defined for FUNCTION_CHANGED	
	
	
	// Default constructor for deserialization
	private WriteTest()
	{         
	}
	
	// Constructor for WRITE prompt
	public WriteTest(Test test, Project project)
	{
	     super(project, false);
	     this.promptType = PromptType.WRITE;
	     this.test = (Ref<Test>) Ref.create(test.getKey());         
	     ofy().save().entity(this).now();
	    
	     project.historyLog().beginEvent(new MicrotaskSpawned(this, test));
	     project.historyLog().endEvent();
	}
	 
	// Constructor for CORRECT prompt
	public WriteTest(Test test2, String issueDescription, Project project)
	{
		super(project, false);
		this.promptType = PromptType.CORRECT;
		this.test = (Ref<Test>) Ref.create(test2.getKey());		
		this.issueDescription = issueDescription;
		ofy().save().entity(this).now();
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this, test2));
		project.historyLog().endEvent();
	}
	
	// Constructor for FUNCTION_CHANGED prompt
	public WriteTest(Test test2, String oldFullDescription, String newFullDescription, Project project)
	{
		super(project, false);
		this.promptType = PromptType.FUNCTION_CHANGED;
		this.test = (Ref<Test>) Ref.create(test2.getKey());		
		this.oldFunctionDescription = oldFullDescription;
		this.newFunctionDescription = newFullDescription;
		ofy().save().entity(this).now();
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this, test2));
		project.historyLog().endEvent();
	}	 
	
	protected void doSubmitWork(DTO dto, Project project)
	{
	     test.get().writeTestCompleted((TestDTO) dto, project);
	}
	
	protected Class getDTOClass()
	{
	     return TestDTO.class;
	}    
	     
	public String getUIURL()
	{
	     return "/html/writeTest.jsp";
	}
	
	public Function getFunction()
	{
	     return test.getValue().getFunction();
	}
	
	public Artifact getOwningArtifact()
	{
	     return getFunction();
	}
	 
	public Test getTest()
	{
		return test.get();
	}
	
	// Gets the description of the originating test case
	public String getDescription()
	{
	    return test.getValue().getDescription();
	}
	
	// Get the description of an issue reported with the test
	public String getIssueDescription()
	{
		return issueDescription;
	}
	 
	public String getOldFunctionDescription()
	{
		return oldFunctionDescription;
	}
	
	public String getNewFunctionDescription()
	{
		return newFunctionDescription;
	}
	
	public PromptType getPromptType()
	{
		return promptType;
	}
	
	public String microtaskTitle()
	{
	     return "Write a test";
	}
	 
	public String microtaskDescription()
	{
		return "writing a test";
	}
}