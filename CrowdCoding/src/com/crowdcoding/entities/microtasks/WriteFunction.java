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
public class WriteFunction extends Microtask
{
	public enum PromptType { SKETCH, DESCRIPTION_CHANGE, RE_EDIT };
	@Parent @Load private Ref<Function> function;
	private PromptType promptType;

	private String oldFullDescription;		// Only defined for DESCRIPTION_CHANGE
	private String newFullDescription;		// Only defined for DESCRIPTION_CHANGE
	private String disputeText;				// Only defined for RE_EDIT


	// Default constructor for deserialization
	private WriteFunction()
	{
	}

	// Initialization constructor for a SKETCH write function. Microtask is not ready.
	public WriteFunction(Function function, Project project)
	{
		super(project);

		this.promptType = PromptType.SKETCH;
		WriteFunction(function, project);
	}

	// Initialization constructor for a DESCRIPTION_CHANGE write function. Microtask is not ready.
	public WriteFunction(Function function, String oldFullDescription,
			String newFullDescription, Project project)
	{
		super(project);
		this.promptType = PromptType.DESCRIPTION_CHANGE;

		// First replace \n with BR to format for display. Then, escape chars as necessary.
		this.oldFullDescription = oldFullDescription;
		this.newFullDescription = newFullDescription;

		WriteFunction(function, project);
	}

	// Initialization constructor for a RE_EDIT write function. Microtask is not ready.
	public WriteFunction(Function function, String disputeText, Project project)
	{
		super(project);
		this.promptType = PromptType.RE_EDIT;

		// First replace \n with BR to format for display. Then, escape chars as necessary.
		this.disputeText = disputeText;
		WriteFunction(function, project);
	}

	public Microtask copy(Project project)
	{
		if(this.promptType==PromptType.SKETCH)
			return new WriteFunction( (Function) getOwningArtifact() ,project);
		else if(this.promptType==PromptType.DESCRIPTION_CHANGE)
			return new WriteFunction( (Function) getOwningArtifact() , this.oldFullDescription, this.newFullDescription, project);
		else
			return new WriteFunction( (Function) getOwningArtifact() , this.disputeText, project);

	}

	public Key<Microtask> getKey()
	{
		return Key.create( function.getKey(), Microtask.class, this.id );
	}


	private void WriteFunction(Function function, Project project)
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
				submitValue,
				function.getID(),
				this.promptType.name(),
				this.oldFullDescription,
				this.newFullDescription,
				this.disputeText),
				Project.MicrotaskKeyToString(this.getKey()),
				project);


		project.historyLog().beginEvent(new MicrotaskSpawned(this));
		project.historyLog().endEvent();
	}

	protected void doSubmitWork(DTO dto, String workerID, Project project)
	{
		function.get().sketchCompleted((FunctionDTO) dto, project);
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
			return function.safeGet();
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
