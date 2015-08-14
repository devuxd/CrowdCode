package com.crowdcoding.entities.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.List;

import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ajax.microtask.submission.DescribeFunctionBehaviorDTO;
import com.crowdcoding.dto.ajax.microtask.submission.TestDisputedDTO;
import com.crowdcoding.dto.firebase.microtasks.DescribeFunctionBehaviourInFirebase;
import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.artifacts.Artifact;
import com.crowdcoding.entities.artifacts.Function;
import com.crowdcoding.entities.artifacts.Test;
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
public class DescribeFunctionBehavior extends Microtask
{
	public enum PromptType { WRITE, CORRECT, FUNCTION_CHANGED, CALLEE_CHANGED, ADT_CHANGED };

	@Parent @Load Ref<Function> functionRef;
	private Long functionId;
	private String functionName;

	private PromptType promptType;

	//Data for FUNCTION_CHANGED
	private int oldFunctionVersion;

	//Data for ADT_CHANGED
	private int oldADTVersion;
	private long ADTId;

	// Data for CORRECT
	private List<TestDisputedDTO> disputedTests;    // Description of the problem with the test case
	

	//Data for CALLEE_CHANGED
	private int oldCalleeVersion;
	private long calleeId;


	// Default constructor for deserialization
	private DescribeFunctionBehavior()
	{
	}
		
	// Constructor for WRITE Prompt Type for write a new behaviour and test of a function
	public DescribeFunctionBehavior(Ref<Function> Function, long functionId, String functionName, String projectId )
	{
		super(projectId,functionId);
		this.promptType	  = PromptType.WRITE;
		describeFunctionBehavior( Function, functionId, functionName );

	}

	// Constructor for FUNCTION_CHANGED Prompt Type for ask to edit the test code on a change of a function signature
	public DescribeFunctionBehavior(Ref<Function> Function, long functionId, String functionName, int oldFunctionVersion, String projectId)
	{
		super(projectId,functionId);
		this.promptType	  		= PromptType.FUNCTION_CHANGED;

		this.oldFunctionVersion = oldFunctionVersion;

		describeFunctionBehavior( Function, functionId, functionName );

	}
	// Constructor for ADT_CHANGED Prompt Type for ask to edit the test code on a change of a ADT Structure
	public DescribeFunctionBehavior(Ref<Function> Function, long functionId, String functionName, int oldADTVersion, long ADTId, String projectId)
	{
		super(projectId, functionId);
		this.promptType	  	= PromptType.ADT_CHANGED;

		this.oldADTVersion 	= oldADTVersion;
		this.ADTId			= ADTId;

		describeFunctionBehavior( Function, functionId, functionName );

	}
	// Constructor for CORRECT Prompt Type for ask to edit the test when has been issued
	public DescribeFunctionBehavior(Ref<Function> Function, long functionId, String functionName, List<TestDisputedDTO> disputedTests, String projectId)
	{
		super(projectId,functionId);
		this.promptType			= PromptType.CORRECT;

		this.disputedTests 	= disputedTests;

		describeFunctionBehavior( Function, functionId, functionName );
	}

	// Constructor for CALLEE CHANGED Promp
	public DescribeFunctionBehavior(Ref<Function> Function, long functionId, String functionName, long calleeId, int oldCalleeVersion, String projectId)
	{
		super(projectId,functionId);
		this.promptType			= PromptType.CALLEE_CHANGED;

		this.calleeId 			= calleeId;
		this.oldCalleeVersion	= oldCalleeVersion;
		describeFunctionBehavior( Function, functionId, functionName );
	}

	private void describeFunctionBehavior(Ref<Function> Function, long functionId, String functionName )
	{
		this.functionId   = functionId;
		this.functionName = functionName;
		this.functionRef = Function;

		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(
				new DescribeFunctionBehaviourInFirebase(
						id,
						this.microtaskTitle(),
						this.microtaskName(),
						functionName,
						functionId,
						submitValue,
						functionId,
						promptType.name(),
						oldFunctionVersion,
						oldADTVersion,
						ADTId,
						disputedTests,
						calleeId,
						oldCalleeVersion),
				Microtask.keyToString(this.getKey()),
				projectId);

		HistoryLog.Init(projectId).addEvent(new MicrotaskSpawned(this));

	}
	
	public Microtask copy(String projectId)
	{
		switch (promptType) {
			case WRITE:
				return new DescribeFunctionBehavior( this.functionRef, this.functionId, this.functionName, this.projectId);
			case FUNCTION_CHANGED:
				return new DescribeFunctionBehavior( this.functionRef, this.functionId, this.functionName, this.oldFunctionVersion, this.projectId);
			case ADT_CHANGED:
				return new DescribeFunctionBehavior( this.functionRef, this.functionId, this.functionName, this.oldADTVersion, this.ADTId, this.projectId);
			case CORRECT:
				return new DescribeFunctionBehavior( this.functionRef, this.functionId, this.functionName, this.disputedTests, this.projectId);
			default:
				
				return null;
		}
	}

	public Key<Microtask> getKey()
	{
		return Key.create( this.functionRef.getKey(), Microtask.class, this.id );
	}


	protected void doSubmitWork(DTO dto, String workerId)
	{
		Function function= functionRef.get();
		function.describeFunctionBehaviorCompleted((DescribeFunctionBehaviorDTO)dto);

		WorkerCommand.awardPoints(workerId, this.submitValue);
//		// increase the stats counter
		WorkerCommand.increaseStat(workerId, "describe_behavior",1);
	}
	public Artifact getOwningArtifact()
	{
		try {
			return functionRef.safe();
		} catch ( Exception e ){
			ofy().load().ref(this.functionRef);
			return functionRef.get();
		}
	}

	protected Class getDTOClass()
	{
		return DescribeFunctionBehaviorDTO.class;
	}

	public PromptType getPromptType()
	{
		return promptType;
	}

	public String microtaskTitle()
	{
		return "Describe Function Behavior";
	}

	public String microtaskDescription()
	{
		return "Describe Function Behavior";
	}
}
