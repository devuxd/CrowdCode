package com.crowdcoding.entities.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import org.apache.commons.lang3.StringEscapeUtils;

import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.firebase.MicrotaskInFirebase;
import com.crowdcoding.dto.firebase.WriteCallInFirebase;
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
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;
import com.googlecode.objectify.annotation.Parent;

@EntitySubclass(index=true)
public class WriteCall extends Microtask
{
	@Parent @Load private Ref<Function> caller;
	private String pseudoCall;
	private String calleeName;
	private String calleeFullDescription;

	
	// Default constructor for deserialization
	private WriteCall()
	{
	}

	// Constructor for initial construction. Microtask is set as not yet ready.
	public WriteCall(Function caller, String calleeName, String calleeFullDescription, String pseudoCall, Project project)
	{
		super(project);
		this.submitValue = 7;
		this.caller = (Ref<Function>) Ref.create(caller.getKey());
		this.calleeFullDescription = calleeFullDescription;
		this.pseudoCall = pseudoCall;
		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new WriteCallInFirebase(
				id,
				this.microtaskTitle(), 
				this.microtaskName(), 
				caller.getName(),
				caller.getID(),
				false, submitValue, 
				caller.getID(), 
				calleeName,
				calleeFullDescription, 
				pseudoCall ),
				Project.MicrotaskKeyToString(this.getKey()),
				project.getID());
				

		HistoryLog.Init(project.getID()).addEvent(new MicrotaskSpawned(this));
	}

	public Microtask copy(Project project)
	{
		return new WriteCall(  (Function) getOwningArtifact(), this.calleeName, this.calleeFullDescription, this.pseudoCall, project);
	}

	public Key<Microtask> getKey()
	{
		return Key.create( caller.getKey(), Microtask.class, this.id );
	}


	protected void doSubmitWork(DTO dto, String workerID, Project project)
	{
		caller.get().writeCallCompleted((FunctionDTO) dto, project);
//		WorkerCommand.awardPoints(workerID, this.submitValue);
		// increase the stats counter
		WorkerCommand.increaseStat(workerID, "function_calls",1);

	}

	// Returns true iff the microtask still needs to be done
	protected boolean isStillNeeded(Project project)
	{
		// AddCall is still needed iff the pseudocall is still in the code
		return caller.get().containsPseudoCall(pseudoCall);
	}

	protected Class getDTOClass()
	{
		return FunctionDTO.class;
	}

	public String getUIURL()
	{
		return "/html/microtasks/writeCall.jsp";
	}

	public Function getCaller()
	{
		return caller.getValue();
	}

	public String getEscapedCalleeFullDescription()
	{
		return StringEscapeUtils.escapeEcmaScript(calleeFullDescription);
	}

	public String getEscapedPseudoCall()
	{
		return StringEscapeUtils.escapeEcmaScript(pseudoCall);
	}


	public Artifact getOwningArtifact()
	{
		Artifact owning;
		try {
			return caller.safeGet();
		} catch ( Exception e ){
			ofy().load().ref(this.caller);
			return caller.get();
		}
	}

	public String microtaskTitle()
	{
		return "Add a call";
	}

	public String microtaskDescription()
	{
		return "write a call";
	}


	public String toJSON(){
		JSONObject json = new JSONObject();
		try {
			json.put("functionId",this.getCaller().getID());
			json.put("pseudoCall",this.getEscapedPseudoCall());
			json.put("caller",this.getCaller());
			json.put("calleeFullDescription",this.getEscapedCalleeFullDescription());
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return super.toJSON(json);
	}

}
