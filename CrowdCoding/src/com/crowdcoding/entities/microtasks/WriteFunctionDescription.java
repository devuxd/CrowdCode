package com.crowdcoding.entities.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ajax.microtask.submission.FunctionDescriptionDTO;
import com.crowdcoding.dto.ajax.microtask.submission.PseudoFunctionDTO;
import com.crowdcoding.dto.firebase.microtask.WriteFunctionDescriptionInFirebase;
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
public class WriteFunctionDescription extends Microtask
{
	@Parent @Load private Ref<Function> function;
	private long callerId;
	private String pseudoFunctionName;
	private String pseudoFunctionDescription;

	// Default constructor for deserialization
	private WriteFunctionDescription()
	{
	}

	// Constructor for initial construction
	public WriteFunctionDescription(Function function, String pseudoFunctionName, String pseudoFunctionDescription, long callerId, String projectId)
	{
		super(projectId,function.getID());
		this.submitValue = 8;
		this.pseudoFunctionName = pseudoFunctionName;
		this.pseudoFunctionDescription = pseudoFunctionDescription;

		this.function = (Ref<Function>) Ref.create(function.getKey());
		this.callerId = callerId;
		ofy().save().entity(this).now();

		FirebaseService.writeMicrotaskCreated(new WriteFunctionDescriptionInFirebase(id,this.microtaskTitle(), this.microtaskName(),
				function.getName(),
				function.getID(),
				false, false, submitValue,pseudoFunctionName, pseudoFunctionDescription, callerId),
				Microtask.keyToString(this.getKey()),
				projectId);

		HistoryLog.Init(projectId).addEvent(new MicrotaskSpawned(this));
	}

	public Microtask copy(String projectId)
	{
		return new WriteFunctionDescription( (Function) getOwningArtifact(),this.pseudoFunctionName, this.pseudoFunctionDescription, this.callerId, projectId);
	}

	public Key<Microtask> getKey()
	{
		return Key.create( function.getKey(), Microtask.class, this.id );
	}

	protected void doSubmitWork(DTO dto, String workerID, String projectId)
	{
		FunctionDescriptionDTO functionDTO = (FunctionDescriptionDTO) dto;

		// The initial code for a function is a line of pseudocode that instructs
		// the worker to only remove it when the function is done. This keeps regenerating
		// new sketch tasks until the worker has marked it as done by removing the pseudocode
		// line.
		functionDTO.code = "{\n\t//#Mark this function as implemented by removing this line.\n}";
		functionDTO.callerId=this.callerId;
		function.get().writeDescriptionCompleted(functionDTO, projectId);

//		WorkerCommand.awardPoints(workerID, this.submitValue);
		// increase the stats counter
		WorkerCommand.increaseStat(workerID, "function_descriptions",1);

	}

	protected Class getDTOClass()
	{
		return FunctionDescriptionDTO.class;
	}

	public String getCallDescription()
	{
		return pseudoFunctionName;
	}

	public String getUIURL()
	{
		return "/html/microtasks/writeFunctionDescription.jsp";
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

	public long getCaller()
	{
		return callerId;
	}

	public String microtaskTitle()
	{
		return "Write a function description";
	}

	public String microtaskDescription()
	{
		return "describe a function";
	}

	public String toJSON(){
		JSONObject json = new JSONObject();
		try {
			json.put("caller",this.getCaller());
			json.put("callDescription",this.getCallDescription());
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return super.toJSON(json);
	}
}
