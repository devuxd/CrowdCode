package com.crowdcoding.entities.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ajax.microtask.submission.ImplementBehaviorDTO;
import com.crowdcoding.dto.firebase.microtask.ImplementBehaviorInFirebase;
import com.crowdcoding.entities.Artifacts.Artifact;
import com.crowdcoding.entities.Artifacts.Function;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.history.MicrotaskSpawned;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Subclass;
import com.googlecode.objectify.annotation.Load;
import com.googlecode.objectify.annotation.Parent;

@Subclass(index=true)
public class ImplementBehavior extends Microtask
{
	public enum PromptType { WRITE, CALLEE_CHANGE, REMOVE_CALLEE, CORRECT };
	@Parent @Load private Ref<Function> function;
	private PromptType promptType;

	private long testId;					//Only defined for WRITE

	private int oldCalleeVersion;			//Only defined for CALLEE_CHANGED

	private String disputeText;				// Only defined for CORRECT and REMOVE_CALLEE
	private long calleeId;					// Only defined for REMOVE_CALLEE and CALLEE_CHANGED

	private long   disputeId;				//id of the artifact that disputed this function

	// Default constructor for deserialization
	private ImplementBehavior()
	{
	}

	// Initialization constructor for a WRITE write function. Microtask is not ready.
	public ImplementBehavior(Function function, long testId, String projectId)
	{
		super(projectId, function.getId());

		this.promptType = PromptType.WRITE;

		this.testId		= testId;

		implementBehavior(function, projectId);
	}

	// Initialization constructor for a DESCRIPTION_CHANGE write function. Microtask is not ready.
	public ImplementBehavior(Function function, long calleeId,
			int oldCalleeVersion, String projectId)
	{
		super(projectId,function.getId());
		this.promptType = PromptType.CALLEE_CHANGE;

		this.calleeId = calleeId;
		this.oldCalleeVersion = oldCalleeVersion;

		implementBehavior(function, projectId);
	}

	// Initialization constructor for a RE_EDIT write function. Microtask is not ready.
	public ImplementBehavior(Function function, String disputeText, long calleeId, String projectId)
	{
		super(projectId,function.getId());
		this.promptType = PromptType.REMOVE_CALLEE;

		this.disputeText = disputeText;
		this.calleeId = calleeId;
		implementBehavior(function, projectId);
	}
	public ImplementBehavior(Function function, String disputeText, String projectId)
	{
		super(projectId,function.getId());
		this.promptType = PromptType.CORRECT;

		this.disputeText = disputeText;

		implementBehavior(function, projectId);
	}


	public Microtask copy(String projectId)
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

	public Key<Microtask> getKey()
	{
		return Key.create( function.getKey(), Microtask.class, this.id );
	}


	private void implementBehavior(Function function, String projectId)
	{
		this.function = (Ref<Function>) Ref.create(function.getKey());
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

	protected void doSubmitWork(DTO dto, String workerID, String projectId)
	{
		function.get().implementBehaviorCompleted((ImplementBehaviorDTO) dto, disputeId , projectId);
//		WorkerCommand.awardPoints(workerID, this.submitValue);
		// increase the stats counter
		WorkerCommand.increaseStat(workerID, "functions",1);

	}

	public PromptType getPromptType()
	{
		return promptType;
	}

	protected Class getDTOClass()
	{
		return ImplementBehaviorDTO.class;
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

	public String microtaskTitle()
	{
		return "Implement function behavior";
	}

	public String microtaskDescription()
	{
		return "implement function behaviorn";
	}


}
