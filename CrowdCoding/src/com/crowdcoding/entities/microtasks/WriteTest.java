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
public class WriteTest extends Microtask
{
	public enum PromptType { WRITE, CORRECT, FUNCTION_CHANGED, TESTCASE_CHANGED };

	@Parent @Load private Ref<Test> test;
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
	public WriteTest(Test test, String projectId, int functionVersion)
	{
		super(projectId);
		this.promptType = PromptType.WRITE;
		this.test = (Ref<Test>) Ref.create(test.getKey());
		this.functionVersion=functionVersion;

		ofy().load().ref(this.test);
		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new WriteTestInFirebase(id, this.microtaskTitle(),this.microtaskName(),
				test.getName(),
				test.getID(),
				false, false,
				submitValue, test.getID(), test.getFunctionID(), functionVersion, promptType.name(), "", "", "", ""),
				Microtask.keyToString(this.getKey()),
				projectId);

		HistoryLog.Init(projectId).addEvent(new MicrotaskSpawned(this));
	}

	// Constructor for CORRECT prompt
	public WriteTest(Test test2, String issueDescription, String projectId, int functionVersion)
	{
		super(projectId);
		this.promptType = PromptType.CORRECT;
		this.test = (Ref<Test>) Ref.create(test2.getKey());
		this.issueDescription = issueDescription;
		this.functionVersion=functionVersion;

		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new WriteTestInFirebase(id, this.microtaskTitle(),this.microtaskName(),
				test2.getName(),
				test2.getID(),
				false, false,
				submitValue, test2.getID(), test2.getFunctionID(),functionVersion, promptType.name(), issueDescription, "", "", ""),
				Microtask.keyToString(this.getKey()),
				projectId);

		HistoryLog.Init(projectId).addEvent(new MicrotaskSpawned(this));
	}

	// Constructor for FUNCTION_CHANGED prompt
	public WriteTest(Test test2, String oldFullDescription, String newFullDescription, String projectId, int functionVersion)
	{
		super(projectId);
		this.promptType = PromptType.FUNCTION_CHANGED;
		this.functionVersion=functionVersion;

		this.test = (Ref<Test>) Ref.create(test2.getKey());
		this.oldFunctionDescription = oldFullDescription;
		this.newFunctionDescription = newFullDescription;
		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new WriteTestInFirebase(id, this.microtaskTitle(),this.microtaskName(),
				test2.getName(),
				test2.getID(),
				false, false,
				submitValue, test2.getID(), test2.getFunctionID(),functionVersion, promptType.name(), "", oldFullDescription, newFullDescription, ""),
				Microtask.keyToString(this.getKey()),
				projectId);

		HistoryLog.Init(projectId).addEvent(new MicrotaskSpawned(this));
	}

	// Constructor for TESTCASE_CHANGED prompt
	public WriteTest(String projectId, Test test, String oldTestCase, int functionVersion)
	{
		super(projectId);
		this.promptType = PromptType.TESTCASE_CHANGED;
		this.functionVersion=functionVersion;

		this.test = (Ref<Test>) Ref.create(test.getKey());
		this.oldTestCase = oldTestCase;

		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new WriteTestInFirebase(id,this.microtaskTitle(), this.microtaskName(),
				test.getName(),
				test.getID(),
				false, false,
				submitValue, test.getID(), test.getFunctionID(),functionVersion, promptType.name(), "", "", "", oldTestCase),
				Microtask.keyToString(this.getKey()),
				projectId);

		HistoryLog.Init(projectId).addEvent(new MicrotaskSpawned(this));
	}

	// Private copy constructor initialize all data elements
	private WriteTest(Test test, PromptType promptType, String issueDescription, String oldFunctionDescription,
			String newFunctionDescription, String oldTestCase, String projectId, int functionVersion)
	{
		super(projectId);
		this.test = (Ref<Test>) Ref.create(test.getKey());
		this.promptType = promptType;
		this.issueDescription = issueDescription;
		this.oldFunctionDescription = oldFunctionDescription;
		this.newFunctionDescription = newFunctionDescription;
		this.oldTestCase = oldTestCase;
		this.functionVersion= functionVersion;

		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new WriteTestInFirebase(id,this.microtaskTitle(), this.microtaskName(),
				test.getName(),
				test.getID(),
				false, false,
				submitValue, test.getID(), test.getFunctionID(),functionVersion, promptType.name(), issueDescription,
				oldFunctionDescription, newFunctionDescription, oldTestCase),
				Microtask.keyToString(this.getKey()),
				projectId);

		HistoryLog.Init(projectId).addEvent(new MicrotaskSpawned(this));
	}

	public Microtask copy(String projectId)
	{
		return new WriteTest( (Test) getOwningArtifact() , this.promptType, this.issueDescription,
				this.oldFunctionDescription, this.newFunctionDescription, this.oldTestCase, projectId, functionVersion);
	}

	public Key<Microtask> getKey()
	{
		return Key.create( test.getKey(), Microtask.class, this.id );
	}

	protected void doSubmitWork(DTO dto, String workerID,String projectId)
	{

		System.out.println("SUBMITTING TEST "+dto);
		test.get().writeTestCompleted((TestDTO) dto, projectId);


//		WorkerCommand.awardPoints(workerID, this.submitValue);
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

	public Function getFunction(String projectId)
	{
		return Function.find(test.getValue().getFunctionID()).now();
	}

	public Artifact getOwningArtifact()
	{
		Artifact owning;
		try {
			return test.safe();
		} catch ( Exception e ){
			ofy().load().ref(this.test);
			return test.get();
		}
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
			json.put("functionVersion", this.functionVersion);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return super.toJSON(json);
	}
}