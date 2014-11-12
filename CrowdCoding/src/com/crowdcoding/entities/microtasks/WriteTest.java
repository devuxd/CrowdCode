package com.crowdcoding.entities.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.TestDTO;
import com.crowdcoding.dto.firebase.WriteTestInFirebase;
import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.Function;
import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.Test;
import com.crowdcoding.history.MicrotaskSpawned;
import com.crowdcoding.util.FirebaseService;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;
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
	private int functionVersion;


	// Default constructor for deserialization
	private WriteTest()
	{
	}

	// Constructor for WRITE prompt
	public WriteTest(Test test, Project project, int functionVersion)
	{
	     super(project);
	     this.promptType = PromptType.WRITE;
	     this.test = (Ref<Test>) Ref.create(test.getKey());
	     ofy().save().entity(this).now();
		 FirebaseService.writeMicrotaskCreated(new WriteTestInFirebase(id, this.microtaskName(), test.getName(),
			  false, submitValue, test.getID(), test.getFunctionID(), functionVersion, promptType.name(), "", "", "", ""), id, project);

	     project.historyLog().beginEvent(new MicrotaskSpawned(this, test));
	     project.historyLog().endEvent();
	}

	// Constructor for CORRECT prompt
	public WriteTest(Test test2, String issueDescription, Project project, int functionVersion)
	{
		super(project);
		this.promptType = PromptType.CORRECT;
		this.test = (Ref<Test>) Ref.create(test2.getKey());
		this.issueDescription = issueDescription;
		ofy().save().entity(this).now();
		 FirebaseService.writeMicrotaskCreated(new WriteTestInFirebase(id, this.microtaskName(), test2.getName(),
				  false, submitValue, test2.getID(), test2.getFunctionID(),functionVersion, promptType.name(), issueDescription, "", "", ""), id, project);

		project.historyLog().beginEvent(new MicrotaskSpawned(this, test2));
		project.historyLog().endEvent();
	}

	// Constructor for FUNCTION_CHANGED prompt
	public WriteTest(Test test2, String oldFullDescription, String newFullDescription, Project project, int functionVersion)
	{
		super(project);
		this.promptType = PromptType.FUNCTION_CHANGED;
		this.test = (Ref<Test>) Ref.create(test2.getKey());
		this.oldFunctionDescription = oldFullDescription;
		this.newFunctionDescription = newFullDescription;
		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new WriteTestInFirebase(id, this.microtaskName(), test2.getName(),
				  false, submitValue, test2.getID(), test2.getFunctionID(),functionVersion, promptType.name(), "", oldFullDescription, newFullDescription, ""),
			  id, project);

		project.historyLog().beginEvent(new MicrotaskSpawned(this, test2));
		project.historyLog().endEvent();
	}

	// Constructor for TESTCASE_CHANGED prompt
	public WriteTest(Project project, Test test, String oldTestCase, int functionVersion)
	{
		super(project);
		this.promptType = PromptType.TESTCASE_CHANGED;
		this.test = (Ref<Test>) Ref.create(test.getKey());
		this.oldTestCase = oldTestCase;

		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new WriteTestInFirebase(id, this.microtaskName(), test.getName(),
				  false, submitValue, test.getID(), test.getFunctionID(),functionVersion, promptType.name(), "", "", "", oldTestCase), id, project);

		project.historyLog().beginEvent(new MicrotaskSpawned(this, test));
		project.historyLog().endEvent();
	}

	// Private copy constructor initialize all data elements
	private WriteTest(Test test, PromptType promptType, String issueDescription, String oldFunctionDescription,
			String newFunctionDescription, String oldTestCase, Project project, int functionVersion)
	{
		super(project);
		this.test = (Ref<Test>) Ref.create(test.getKey());
		this.promptType = promptType;
		this.issueDescription = issueDescription;
		this.oldFunctionDescription = oldFunctionDescription;
		this.newFunctionDescription = newFunctionDescription;
		this.oldTestCase = oldTestCase;
		this.functionVersion= functionVersion;

		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new WriteTestInFirebase(id, this.microtaskName(), test.getName(),
				  false, submitValue, test.getID(), test.getFunctionID(),functionVersion, promptType.name(), issueDescription,
				  oldFunctionDescription, newFunctionDescription, oldTestCase), id, project);

		project.historyLog().beginEvent(new MicrotaskSpawned(this, test));
		project.historyLog().endEvent();
	}

    public Microtask copy(Project project)
    {
    	return new WriteTest(this.test.getValue(), this.promptType, this.issueDescription,
    			this.oldFunctionDescription, this.newFunctionDescription, this.oldTestCase, project, functionVersion);
    }

	protected void doSubmitWork(DTO dto, String workerID, Project project)
	{
		 System.out.println("do submit test become complete");
	     test.get().writeTestCompleted((TestDTO) dto, project);


		// increase the stats counter
		WorkerCommand.increaseStat(workerID, "tests",1);

	}

	protected Class getDTOClass()
	{
	     return TestDTO.class;
	}

	public String getUIURL()
	{
	     return "/html/microtasks/writeTest.jsp";
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

	public String toJSON(){
		JSONObject json = new JSONObject();
		try {
			json.put("promptType",this.getPromptType());
			json.put("issueDescription",this.getIssueDescription());
			json.put("oldTestCase",this.getOldTestCase());
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return super.toJSON(json);
	}
}