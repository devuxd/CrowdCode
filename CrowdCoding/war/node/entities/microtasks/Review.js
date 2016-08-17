package com.crowdcoding.entities.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ajax.microtask.submission.ImplementBehaviorDTO;
import com.crowdcoding.dto.firebase.microtasks.ImplementBehaviorInFirebase;
import com.crowdcoding.entities.artifacts.Artifact;
import com.crowdcoding.entities.artifacts.Function;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.history.MicrotaskSpawned;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Subclass;
import com.googlecode.objectify.annotation.Load;
import com.googlecode.objectify.annotation.Parent;

var http = require('http');

var server = http.createServer(function(req, res) {
  res.writeHead(200);
  res.end('Hello Http');
});
server.listen(8080);

@Subclass(index=true)
class ImplementBehavior extends Microtask
{
	public enum PromptType { WRITE, CALLEE_CHANGE, REMOVE_CALLEE, CORRECT };
	@Parent @Load var function;
	var promptType;

	var testId;					//Only defined for WRITE

	var oldCalleeVersion;			//Only defined for CALLEE_CHANGED

	var disputeText;				// Only defined for CORRECT and REMOVE_CALLEE
	var calleeId;					// Only defined for REMOVE_CALLEE and CALLEE_CHANGED

	var disputeId;				//id of the artifact that disputed this function

	// Default constructor for deserialization
	constructor ImplementBehavior()
	{
	}

	// Initialization constructor for a WRITE write function. Microtask is not ready.
	constructor(function, testId, projectId)
	{
		super(projectId, function.getId());

		this.promptType = PromptType.WRITE;

		this.testId		= testId;

		implementBehavior(function, projectId);
	}

	// Initialization constructor for a DESCRIPTION_CHANGE write function. Microtask is not ready.
	constructor(function, calleeId,
			int oldCalleeVersion, String projectId)
	{
		super(projectId,function.getId());
		this.promptType = PromptType.CALLEE_CHANGE;

		this.calleeId = calleeId;
		this.oldCalleeVersion = oldCalleeVersion;

		implementBehavior(function, projectId);
	}

	// Initialization constructor for a RE_EDIT write function. Microtask is not ready.
	constructor(function, disputeText, calleeId, projectId)
	{
		super(projectId,function.getId());
		this.promptType = PromptType.REMOVE_CALLEE;

		this.disputeText = disputeText;
		this.calleeId = calleeId;
		implementBehavior(function, projectId);
	}
	constructor(function, disputeText, projectId)
	{
		super(projectId,function.getId());
		this.promptType = PromptType.CORRECT;

		this.disputeText = disputeText;

		implementBehavior(function, projectId);
	}


	function copy(projectId)
	{
		switch (promptType) {
			case WRITE:
				return new ImplementBehavior( (Function) getOwningArtifact() , testId, projectId);
			case CALLEE_CHANGE:
				return new ImplementBehavior( (Function) getOwningArtifact() , calleeId, oldCalleeVersion, projectId);
			case REMOVE_CALLEE:
				return new ImplementBehavior( (Function) getOwningArtifact() , this.disputeText, disputeId, projectId);
			case CORRECT:
				return new ImplementBehavior((Function) getOwningArtifact(), this.disputeText, projectId);
	
			default:
				return null;
		}
	}

	function getKey()
	{
		return Key.create( function.getKey(), Microtask.class, this.id );
	}


	function implementBehavior(function, projectId)
	{
		this.function = function.getRef();
		ofy().load().ref(this.function);
		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new ImplementBehaviorInFirebase(
				id,
				this.microtaskTitle(),
				this.microtaskName(),
				function.getName(),
				function.getId(),
				submitValue,
				function.getId(),
				this.promptType.name(),
				this.testId,
				this.calleeId,
				this.oldCalleeVersion,
				this.disputeText),
				Microtask.keyToString(this.getKey()),
				projectId);


		HistoryLog.Init(projectId).addEvent(new MicrotaskSpawned(this));
	}

	function doSubmitWork(dto, workerID)
	{
		function.get().implementBehaviorCompleted((ImplementBehaviorDTO) dto, disputeId , projectId);
//		WorkerCommand.awardPoints(workerID, this.submitValue);
		// increase the stats counter
		WorkerCommand.increaseStat(workerID, "functions",1);
	}

	function getPromptType()
	{
		return promptType;
	}

	function getDTOClass()
	{
		return ImplementBehaviorDTO.class;
	}

	function getFunction()
	{
		return function.getValue();
	}


	function getOwningArtifact()
	{
		Artifact owning;
		try {
			return function.safe();
		} catch ( Exception e ){
			ofy().load().ref(this.function);
			return function.get();
		}
	}

	function microtaskTitle()
	{
		return "Implement function behavior";
	}

	function microtaskDescription()
	{
		return "implement function behaviorn";
	}


}
