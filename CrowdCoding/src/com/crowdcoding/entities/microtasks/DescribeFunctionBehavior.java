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
class DescribeFunctionBehavior extends Microtask
{
	//?public enum PromptType { WRITE, CORRECT, FUNCTION_CHANGED, CALLEE_CHANGED, ADT_CHANGED };

	@Parent @Load Ref<Function> functionRef;
	var functionId;
	var functionName;

	var promptType;

	//Data for FUNCTION_CHANGED
	var oldFunctionVersion;

	//Data for ADT_CHANGED
	var oldADTVersion;
	var ADTId;

	// Data for CORRECT
	var disputedTests;    // Description of the problem with the test case
	

	//Data for CALLEE_CHANGED
	var oldCalleeVersion;
	var calleeId;


	// Default constructor for deserialization
	constructor()
	{
	}
		
	// Constructor for WRITE Prompt Type for write a new behaviour and test of a function
	constructor(Function, functionId, functionName, projectId )
	{
		super(projectId,functionId);
		this.promptType	  = PromptType.WRITE;
		describeFunctionBehavior( Function, functionId, functionName );

	}

	// Constructor for FUNCTION_CHANGED Prompt Type for ask to edit the test code on a change of a function signature
	constructor(Function, functionId, functionName, oldFunctionVersion, projectId)
	{
		super(projectId,functionId);
		this.promptType	= PromptType.FUNCTION_CHANGED;

		this.oldFunctionVersion = oldFunctionVersion;

		describeFunctionBehavior( Function, functionId, functionName );

	}
	// Constructor for ADT_CHANGED Prompt Type for ask to edit the test code on a change of a ADT Structure
	constructor(Function, functionId, functionName, oldADTVersion, ADTId, projectId)
	{
		super(projectId, functionId);
		this.promptType	= PromptType.ADT_CHANGED;

		this.oldADTVersion = oldADTVersion;
		this.ADTId = ADTId;

		describeFunctionBehavior(Function, functionId, functionName );

	}
	// Constructor for CORRECT Prompt Type for ask to edit the test when has been issued
	constructor(Function, functionId, functionName, disputedTests, projectId)
	{
		super(projectId,functionId);
		this.promptType	= PromptType.CORRECT;

		this.disputedTests = disputedTests;

		describeFunctionBehavior( Function, functionId, functionName );
	}

	// Constructor for CALLEE CHANGED Promp
	constructor(Function, functionId, functionName, calleeId, oldCalleeVersion, projectId)
	{
		super(projectId,functionId);
		this.promptType = PromptType.CALLEE_CHANGED;

		this.calleeId = calleeId;
		this.oldCalleeVersion = oldCalleeVersion;
		describeFunctionBehavior( Function, functionId, functionName );
	}

	constructor(Ref<Function> Function, long functionId, String functionName )
	{
		this.functionId = functionId;
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
	
	function copy(projectId)
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

	function getKey()
	{
		return Key.create( this.functionRef.getKey(), Microtask.class, this.id );
	}


	function doSubmitWork(DTO dto, String workerId)
	{
		Function function= functionRef.get();
		function.describeFunctionBehaviorCompleted((DescribeFunctionBehaviorDTO)dto);

		WorkerCommand.awardPoints(workerId, this.submitValue);
//		// increase the stats counter
		WorkerCommand.increaseStat(workerId, "describe_behavior",1);
	}
	function getOwningArtifact()
	{
		try {
			return functionRef.safe();
		} catch ( Exception e ){
			ofy().load().ref(this.functionRef);
			return functionRef.get();
		}
	}

	function getDTOClass()
	{
		return DescribeFunctionBehaviorDTO.class;
	}

	function getPromptType()
	{
		return promptType;
	}

	function microtaskTitle()
	{
		return "Describe Function Behavior";
	}

	function microtaskDescription()
	{
		return "Describe Function Behavior";
	}
}