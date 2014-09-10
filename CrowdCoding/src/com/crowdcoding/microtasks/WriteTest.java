package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.Project;
import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Test;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.TestDTO;
import com.crowdcoding.dto.firebase.MicrotaskInFirebase;
import com.crowdcoding.dto.firebase.WriteTestInFirebase;
import com.crowdcoding.dto.history.MicrotaskSpawned;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class WriteTest extends Microtask
{
	public enum PromptType { WRITE, CORRECT, FUNCTION_CHANGED, TESTCASE_CHANGED };	
	
	@Load private Ref<Test> test;
	private PromptType promptType;
	
	private String issueDescription;			// Only defined for CORRECT
	private String oldFunctionDescription;		// Only defined for FUNCTION_CHANGED
	private String newFunctionDescription;		// Only defined for FUNCTION_CHANGED	
	private String oldTestCase;					// Only defined for TESTCASE_CHANGED
	
	
	// Default constructor for deserialization
	private WriteTest()
	{         
	}
	
	// Constructor for WRITE prompt
	public WriteTest(Test test, Project project)
	{
	     super(project);
	     this.promptType = PromptType.WRITE;
	     this.test = (Ref<Test>) Ref.create(test.getKey());         
	     ofy().save().entity(this).now();
		 FirebaseService.writeMicrotaskCreated(new WriteTestInFirebase(id, this.microtaskName(), test.getName(), 
			  false, submitValue, test.getID(), promptType.name(), "", "", "", ""), id, project);
	    
	     project.historyLog().beginEvent(new MicrotaskSpawned(this, test));
	     project.historyLog().endEvent();
	}
	 
	// Constructor for CORRECT prompt
	public WriteTest(Test test2, String issueDescription, Project project)
	{
		super(project);
		this.promptType = PromptType.CORRECT;
		this.test = (Ref<Test>) Ref.create(test2.getKey());		
		this.issueDescription = issueDescription;
		ofy().save().entity(this).now();
		 FirebaseService.writeMicrotaskCreated(new WriteTestInFirebase(id, this.microtaskName(), test2.getName(), 
				  false, submitValue, test2.getID(), promptType.name(), issueDescription, "", "", ""), id, project);
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this, test2));
		project.historyLog().endEvent();
	}
	
	// Constructor for FUNCTION_CHANGED prompt
	public WriteTest(Test test2, String oldFullDescription, String newFullDescription, Project project)
	{
		super(project);
		this.promptType = PromptType.FUNCTION_CHANGED;
		this.test = (Ref<Test>) Ref.create(test2.getKey());		
		this.oldFunctionDescription = oldFullDescription;
		this.newFunctionDescription = newFullDescription;
		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new WriteTestInFirebase(id, this.microtaskName(), test2.getName(), 
				  false, submitValue, test2.getID(), promptType.name(), "", oldFullDescription, newFullDescription, ""), 
			  id, project);
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this, test2));
		project.historyLog().endEvent();
	}	 
	
	// Constructor for TESTCASE_CHANGED prompt
	public WriteTest(Project project, Test test, String oldTestCase)
	{
		super(project);
		this.promptType = PromptType.TESTCASE_CHANGED;
		this.test = (Ref<Test>) Ref.create(test.getKey());		
		this.oldTestCase = oldTestCase;

		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new WriteTestInFirebase(id, this.microtaskName(), test.getName(), 
				  false, submitValue, test.getID(), promptType.name(), "", "", "", oldTestCase), id, project);
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this, test));
		project.historyLog().endEvent();
	}	
	
	// Private copy constructor initialize all data elements
	private WriteTest(Test test, PromptType promptType, String issueDescription, String oldFunctionDescription,
			String newFunctionDescription, String oldTestCase, Project project)
	{
		super(project);
		this.test = (Ref<Test>) Ref.create(test.getKey());	
		this.promptType = promptType;
		this.issueDescription = issueDescription;
		this.oldFunctionDescription = oldFunctionDescription;
		this.newFunctionDescription = newFunctionDescription;
		this.oldTestCase = oldTestCase;		

		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new WriteTestInFirebase(id, this.microtaskName(), test.getName(), 
				  false, submitValue, test.getID(), promptType.name(), issueDescription, 
				  oldFunctionDescription, newFunctionDescription, oldTestCase), id, project);
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this, test));
		project.historyLog().endEvent();
	}	 
	
    public Microtask copy(Project project)
    {
    	return new WriteTest(this.test.getValue(), this.promptType, this.issueDescription,
    			this.oldFunctionDescription, this.newFunctionDescription, this.oldTestCase, project);
    }
	
	protected void doSubmitWork(DTO dto, String workerID, Project project)
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
	
	public Function getFunction(Project project)
	{
	     return Function.find(test.getValue().getFunctionID(), project).get();
	}
	
	public Artifact getOwningArtifact()
	{
		return test.get();
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
	
	public String getOldTestCase()
	{
		return oldTestCase;
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
		return "write a test";
	}
}