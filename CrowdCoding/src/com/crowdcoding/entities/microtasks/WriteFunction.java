package com.crowdcoding.entities.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.firebase.MicrotaskInFirebase;
import com.crowdcoding.dto.firebase.WriteFunctionInFirebase;
import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.Function;
import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.microtasks.WriteTestCases.PromptType;
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
public class WriteFunction extends Microtask
{
	public enum PromptType { SKETCH, DESCRIPTION_CHANGE, RE_EDIT, REMOVE_CALLEE };
	@Parent @Load private Ref<Function> function;
	private PromptType promptType;

	private String oldFullDescription;		// Only defined for DESCRIPTION_CHANGE
	private String newFullDescription;		// Only defined for DESCRIPTION_CHANGE

	private String disputeText;				// Only defined for RE_EDIT and REMOVE_CALLEE
	private long calleeId;					// Only defined for REMOVE_CALLEE, id of the callee to remove

	private long   disputeId = 0;			//id of the artifact that disputed this function

	// Default constructor for deserialization
	private WriteFunction()
	{
	}

	// Initialization constructor for a SKETCH write function. Microtask is not ready.
	public WriteFunction(Function function, String projectId)
	{
		super(projectId);

		this.promptType = PromptType.SKETCH;
		WriteFunction(function, projectId);
	}

	// Initialization constructor for a DESCRIPTION_CHANGE write function. Microtask is not ready.
	public WriteFunction(Function function, String oldFullDescription,
			String newFullDescription, String projectId)
	{
		super(projectId);
		this.promptType = PromptType.DESCRIPTION_CHANGE;

		// First replace \n with BR to format for display. Then, escape chars as necessary.
		this.oldFullDescription = oldFullDescription;
		this.newFullDescription = newFullDescription;

		WriteFunction(function, projectId);
	}

	// Initialization constructor for a RE_EDIT write function. Microtask is not ready.
	public WriteFunction(Function function, String disputeText, long disputeId, String projectId)
	{
		super(projectId);
		this.promptType = PromptType.RE_EDIT;

		// First replace \n with BR to format for display. Then, escape chars as necessary.

		this.disputeText = disputeText;
		this.disputeId = disputeId;
		WriteFunction(function, projectId);
	}
	public WriteFunction(Function function, long calleeId, String disputeText, String projectId)
	{
		super(projectId);
		this.promptType = PromptType.REMOVE_CALLEE;

		this.disputeText = disputeText;
		this.calleeId = calleeId;

		WriteFunction(function, projectId);
	}


	public Microtask copy(String projectId)
	{
		if(this.promptType==PromptType.SKETCH)
			return new WriteFunction( (Function) getOwningArtifact() ,projectId);
		else if(this.promptType==PromptType.DESCRIPTION_CHANGE)
			return new WriteFunction( (Function) getOwningArtifact() , this.oldFullDescription, this.newFullDescription, projectId);
		else if (this.promptType==PromptType.RE_EDIT)
			return new WriteFunction( (Function) getOwningArtifact() , this.disputeText, disputeId, projectId);
		else
			return new WriteFunction((Function) getOwningArtifact() , this.calleeId, this.disputeText, projectId);
	}

	public Key<Microtask> getKey()
	{
		return Key.create( function.getKey(), Microtask.class, this.id );
	}


	private void WriteFunction(Function function, String projectId)
	{
		this.function = (Ref<Function>) Ref.create(function.getKey());
		ofy().load().ref(this.function);
		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new WriteFunctionInFirebase(
				id,
				this.microtaskTitle(),
				this.microtaskName(),
				function.getName(),
				function.getID(),
				false,
				false,
				submitValue,
				function.getID(),
				this.promptType.name(),
				this.oldFullDescription,
				this.newFullDescription,
				this.disputeText,
				this.calleeId),
				Microtask.keyToString(this.getKey()),
				projectId);


		HistoryLog.Init(projectId).addEvent(new MicrotaskSpawned(this));
	}

	protected void doSubmitWork(DTO dto, String workerID, String projectId)
	{
		function.get().sketchCompleted((FunctionDTO) dto, disputeId , projectId);
//		WorkerCommand.awardPoints(workerID, this.submitValue);
		// increase the stats counter
		WorkerCommand.increaseStat(workerID, "functions",1);

	}

	public PromptType getPromptType()
	{
		return promptType;
	}

	public String getOldFullDescription()
	{
		return oldFullDescription;
	}

	public String getNewFullDescription()
	{
		return newFullDescription;
	}

	protected Class getDTOClass()
	{
		return FunctionDTO.class;
	}

	public String getUIURL()
	{
		return "/html/microtasks/writeFunction.jsp";
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
		return "Edit a function";
	}

	public String microtaskDescription()
	{
		return "edit a function";
	}


	public String toJSON(){
		JSONObject json = new JSONObject();
		try {
			json.put("promptType",this.getPromptType());
			json.put("newFullDescription",this.getNewFullDescription());
			json.put("oldFullDescription",this.getOldFullDescription());
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return super.toJSON(json);
	}
}
