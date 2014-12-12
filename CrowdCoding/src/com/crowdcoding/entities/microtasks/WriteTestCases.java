package com.crowdcoding.entities.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.TestCasesDTO;
import com.crowdcoding.dto.firebase.MicrotaskInFirebase;
import com.crowdcoding.dto.firebase.WriteTestCasesInFirebase;
import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.Function;
import com.crowdcoding.entities.Project;
import com.crowdcoding.history.MicrotaskSpawned;
import com.crowdcoding.util.FirebaseService;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;
import com.googlecode.objectify.annotation.Parent;

@EntitySubclass(index=true)
public class WriteTestCases extends Microtask
{
	public enum PromptType { FUNCTION_SIGNATURE, CORRECT_TEST_CASE };

	@Parent Ref<Function> function;
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
		this.function = (Ref<Function>) Ref.create( Key.create( Function.class,function.getID()) );

		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new WriteTestCasesInFirebase(id, this.microtaskTitle(),this.microtaskName(), 
				function.getName(),
				function.getID(),
				false, submitValue, function.getID(), promptType.name(), "", ""),
				Project.MicrotaskKeyToString(this.getKey()),
				project);
		
		System.out.println("------ OWNING "+this.getOwningArtifact());
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this));
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
		FirebaseService.writeMicrotaskCreated(new WriteTestCasesInFirebase(id, this.microtaskTitle(),this.microtaskName(), 
				function.getName(),
				function.getID(),
				false, submitValue, function.getID(), promptType.name(), disputeDescription, disputedTestCase),
				Project.MicrotaskKeyToString(this.getKey()),
				project);

		project.historyLog().beginEvent(new MicrotaskSpawned(this));
		project.historyLog().endEvent();
	}

	public Microtask copy(Project project)
	{
		if(this.promptType==PromptType.FUNCTION_SIGNATURE)
			return new WriteTestCases( (Function) getOwningArtifact() , project);
		else
			return new WriteTestCases( (Function) getOwningArtifact(), this.disputeDescription, this.disputedTestCase,
					project);
	}

	public Key<Microtask> getKey()
	{
		return Key.create( function.getKey(), Microtask.class, this.id );
	}


	protected void doSubmitWork(DTO dto, String workerID, Project project)
	{
		Function fun = (Function) this.getOwningArtifact();
		fun.writeTestCasesCompleted((TestCasesDTO) dto, project);

//		WorkerCommand.awardPoints(workerID, this.submitValue);
		// increase the stats counter
		WorkerCommand.increaseStat(workerID, "test_cases",1);
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
		return "/html/microtasks/writeTestCases.jsp";
	}

	public Function getFunction()
	{
		return function.getValue();
	}

	public Artifact getOwningArtifact()
	{
		Artifact owning;
		try {
			return function.safeGet();
		} catch ( Exception e ){
			ofy().load().ref(this.function);
			return function.get();
		}
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

	public String toJSON(){
		JSONObject json = new JSONObject();
		try {
			json.put("promptType",this.getPromptType());
			json.put("disputedTestCase",this.getDisputedTestCase());
			json.put("disputeDescription",this.getDisputeDescription());
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return super.toJSON(json);
	}
}
