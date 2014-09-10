package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.Project;
import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.TestCasesDTO;
import com.crowdcoding.dto.firebase.MicrotaskInFirebase;
import com.crowdcoding.dto.firebase.WriteTestCasesInFirebase;
import com.crowdcoding.dto.history.MicrotaskSpawned;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class WriteTestCases extends Microtask
{
	public enum PromptType { FUNCTION_SIGNATURE, CORRECT_TEST_CASE };
	
	@Load private Ref<Function> function;
	private PromptType promptType;
	
	// Data for edit test cases microtask
	private String disputeDescription;    // Description of the problem with the test case
	private String disputedTestCase;      // Text of the test case in dispute
		
	// Default constructor for deserialization
	private WriteTestCases()
	{		
	}
	
	// Constructor for initial construction for testing a function based on its signature
	public WriteTestCases(Function function, Project project)
	{
		super(project);
		this.promptType = PromptType.FUNCTION_SIGNATURE;
		this.function = (Ref<Function>) Ref.create(function.getKey());		
		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new WriteTestCasesInFirebase(id, this.microtaskName(), function.getName(), 
				  false, submitValue, function.getID(), promptType.name(), "", ""),
			 id, project);
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this, function));
		project.historyLog().endEvent();
	}	
	
	// Constructor for initial construction for disputing a test case
	public WriteTestCases(Function function, String disputeDescription, String disputedTestCase, 
			Project project)
	{
		super(project);
		this.promptType = PromptType.CORRECT_TEST_CASE;
		this.function = (Ref<Function>) Ref.create(function.getKey());	
		this.disputeDescription = disputeDescription;
		this.disputedTestCase = disputedTestCase;
		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new WriteTestCasesInFirebase(id, this.microtaskName(), function.getName(), 
				  false, submitValue, function.getID(), promptType.name(), disputeDescription, disputedTestCase),
			 id, project);
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this, function));
		project.historyLog().endEvent();
	}	
	
    public Microtask copy(Project project)
    {
    	return new WriteTestCases(this.function.getValue(), this.disputeDescription, this.disputedTestCase,
    			project);
    }

	protected void doSubmitWork(DTO dto, String workerID, Project project)
	{
		this.function.get().writeTestCasesCompleted((TestCasesDTO) dto, project);		
	}
	
	protected Class getDTOClass()
	{
		return TestCasesDTO.class;
	}	
	
	public PromptType getPromptType()
	{
		return promptType;
	}
	
	public String getUIURL()
	{
		return "/html/testcases.jsp";
	}
	
	public Function getFunction()
	{
		return function.getValue();
	}
	
	public Artifact getOwningArtifact()
	{
		return null;
	}
	
	public String getDisputeDescription()
	{
		return disputeDescription;
	}
	
	public String getDisputedTestCase()
	{
		return disputedTestCase;
	}
	
	// Gets the list of test cases, formatted as a JSON string that's a list
	// of test cases (with properly escaped strings)
	public String getEscapedTestCasesList(Project project)
	{
		TestCasesDTO testCasesDTO = new TestCasesDTO(function.get(), project);
		return testCasesDTO.json();
	}
		
	public String microtaskTitle()
	{
		return "Write test cases";
	}
	
	public String microtaskDescription()
	{
		return "write test cases";
	}
}
