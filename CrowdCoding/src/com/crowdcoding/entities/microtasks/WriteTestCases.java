package com.crowdcoding.entities.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ajax.microtask.submission.TestCasesDTO;
import com.crowdcoding.dto.firebase.microtask.WriteTestCasesInFirebase;
import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.Function;
import com.crowdcoding.entities.Project;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.history.MicrotaskSpawned;
import com.crowdcoding.util.FirebaseService;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Subclass;
import com.googlecode.objectify.annotation.Load;
import com.googlecode.objectify.annotation.Parent;

@Subclass(index=true)
public class WriteTestCases extends Microtask
{
	public enum PromptType { WRITE, CORRECT };

	@Parent Ref<Function> function;
	private PromptType promptType;

	// Data for edit test cases microtask
	private String issueDescription;    // Description of the problem with the test case
	private String issuedTestCase;      // Text of the test case in dispute
	private long disputeId=0;

	// Default constructor for deserialization
	private WriteTestCases()
	{
	}

	// Constructor for initial construction for testing a function based on its signature
	public WriteTestCases(Function function, String projectId)
	{
		super(projectId,function.getID());
		this.promptType = PromptType.WRITE;
		this.function = (Ref<Function>) Ref.create( Key.create( Function.class,function.getID()) );

		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new WriteTestCasesInFirebase(id, this.microtaskTitle(),this.microtaskName(),
				function.getName(),
				function.getID(),
				false, false,
				submitValue, function.getID(), promptType.name(), "", ""),
				Microtask.keyToString(this.getKey()),
				projectId);

		HistoryLog.Init(projectId).addEvent(new MicrotaskSpawned(this));
	}

	// Constructor for initial construction for disputing a test case
	public WriteTestCases(Function function, String issueDescription, String issuedTestCase,
			long disputeId, String projectId)
	{
		super(projectId,function.getID());
		this.promptType = PromptType.CORRECT;
		this.function = (Ref<Function>) Ref.create(function.getKey());
		this.issueDescription = issueDescription;
		this.issuedTestCase   = issuedTestCase;
		this.disputeId = disputeId;

		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new WriteTestCasesInFirebase(id, this.microtaskTitle(),this.microtaskName(),
				function.getName(),
				function.getID(),
				false, false,
				submitValue, function.getID(), promptType.name(), issueDescription, issuedTestCase),
				Microtask.keyToString(this.getKey()),
				projectId);

		HistoryLog.Init(projectId).addEvent(new MicrotaskSpawned(this));
	}

	public Microtask copy(String projectId)
	{
		if(this.promptType==PromptType.WRITE)
			return new WriteTestCases( (Function) getOwningArtifact() , projectId);
		else
			return new WriteTestCases( (Function) getOwningArtifact(), this.issueDescription, this.issuedTestCase, disputeId,
					projectId);
	}

	public Key<Microtask> getKey()
	{
		return Key.create( function.getKey(), Microtask.class, this.id );
	}


	protected void doSubmitWork(DTO dto, String workerID, String projectId)
	{
		Function fun = (Function) this.getOwningArtifact();
		fun.writeTestCasesCompleted((TestCasesDTO) dto,disputeId, projectId);

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
			return function.safe();
		} catch ( Exception e ){
			ofy().load().ref(this.function);
			return function.get();
		}
	}

	public String getIssueDescription()
	{
		return issueDescription;
	}

	public String getIssuedTestCase()
	{
		return issuedTestCase;
	}

	// Gets the list of test cases, formatted as a JSON string that's a list
	// of test cases (with properly escaped strings)
	public String getEscapedTestCasesList(String projectId)
	{
		TestCasesDTO testCasesDTO = new TestCasesDTO(function.get(), projectId);
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
			json.put("promptType",       this.getPromptType());
			json.put("issueDescription", this.getIssueDescription());
			json.put("issuedTestCase",   this.getIssuedTestCase());
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return super.toJSON(json);
	}
}
