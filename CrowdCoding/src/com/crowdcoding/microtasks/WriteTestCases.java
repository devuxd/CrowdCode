package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.Project;
import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.UserStory;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.TestCasesDTO;
import com.crowdcoding.dto.history.MicrotaskSpawned;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class WriteTestCases extends Microtask
{
	public enum PromptType { FUNCTION_SIGNATURE, TEST_USER_STORY };
	
	@Load private Ref<Function> function;
	private Ref<UserStory> userStory; // userStory associated with TEST_USER_STORY prompts
	private PromptType promptType;
		
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
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this, function));
		project.historyLog().endEvent();
	}
	
	// Constructor for testing a function for its ability to implement a user story
	public WriteTestCases(Function function, UserStory userStory, Project project)
	{
		super(project);
		this.promptType = PromptType.TEST_USER_STORY;
		this.function = (Ref<Function>) Ref.create(function.getKey());	
		this.userStory = (Ref<UserStory>) Ref.create(userStory.getKey());
		ofy().save().entity(this).now();
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this, function));
		project.historyLog().endEvent();
	}

	protected void doSubmitWork(DTO dto, Project project)
	{
		List<String> testCases = new ArrayList<String>();
		// Extract each of the test cases and drop whitespace. Drop blank testcases.
		for (String rawTestCase : ((TestCasesDTO) dto).tests)
		{
			String testCase = rawTestCase.trim();
			if (!testCase.equals(""))
				testCases.add(testCase);
		}
		
		function.get().writeTestCasesCompleted(testCases, project);	
	}
	
	protected boolean submitAccepted(DTO dto, Project project)
	{
		// Check if any of the test cases are non-empty
		for (String rawTestCase : ((TestCasesDTO) dto).tests)
		{
			if (!rawTestCase.trim().equals(""))
				return true;
		}
		
		return false;
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
		return getFunction();
	}
	
	// Gets the user story text. Returns an empty string for any prompt types other than TEST_USER_STORY
	public String getUserStoryText()
	{
		if (promptType == PromptType.TEST_USER_STORY)
			return ofy().load().ref(userStory).get().getText();
		else
			return "";
	}
	
	public String microtaskTitle()
	{
		return "Write test cases";
	}
	
	public String microtaskDescription()
	{
		return "writing test cases";
	}
}
