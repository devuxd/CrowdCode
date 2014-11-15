package com.crowdcoding.entities.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ReusedFunctionDTO;
import com.crowdcoding.dto.firebase.MicrotaskInFirebase;
import com.crowdcoding.dto.firebase.ReuseSearchInFirebase;
import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.Function;
import com.crowdcoding.entities.Project;
import com.crowdcoding.history.MicrotaskSpawned;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class ReuseSearch extends Microtask
{
	@Load private Ref<Function> function;
	private String callDescription;

	// Default constructor for deserialization
	private ReuseSearch()
	{
	}

	// Constructor for initial construction
	public ReuseSearch(Function function, String callDescription, Project project)
	{
		super(project);
		this.submitValue = 4;
		this.function = (Ref<Function>) Ref.create(function.getKey());
		this.callDescription = callDescription;
		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new ReuseSearchInFirebase(id,this.microtaskTitle(), this.microtaskName(), function.getName(),
				false, submitValue, callDescription, function.getID()), id, project);

		project.historyLog().beginEvent(new MicrotaskSpawned(this, function));
		project.historyLog().endEvent();
	}

    public Microtask copy(Project project)
    {
    	return new ReuseSearch(this.function.getValue(), this.callDescription, project);
    }

	protected void doSubmitWork(DTO dto, String workerID, Project project)
	{
		function.get().reuseSearchCompleted((ReusedFunctionDTO) dto, callDescription, project);
		WorkerCommand.awardPoints(workerID, this.submitValue);
		// increase the stats counter
		WorkerCommand.increaseStat(workerID, "searches",1);
	}

	protected Class getDTOClass()
	{
		return ReusedFunctionDTO.class;
	}

	public String getUIURL()
	{
		return "/html/microtasks/reuseSearch.jsp";
	}

	public String getCallDescription()
	{
		return callDescription;
	}

	public Function getCaller()
	{
		return function.get();
	}

	public Artifact getOwningArtifact()
	{
		return function.get();
	}

	public String microtaskTitle()
	{
		return "Reuse search";
	}

	public String microtaskDescription()
	{
		return "do a reuse search";
	}
}