package com.crowdcoding.entities.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.PseudoFunctionDTO;
import com.crowdcoding.dto.ReusedFunctionDTO;
import com.crowdcoding.dto.firebase.MicrotaskInFirebase;
import com.crowdcoding.dto.firebase.NewsItemInFirebase;
import com.crowdcoding.dto.firebase.ReuseSearchInFirebase;
import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.Function;
import com.crowdcoding.entities.Project;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.history.MicrotaskSpawned;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Subclass;
import com.googlecode.objectify.annotation.Load;
import com.googlecode.objectify.annotation.Parent;

@Subclass(index=true)
public class ReuseSearch extends Microtask
{
	@Parent @Load private Ref<Function> function;
	private String pseudoFunctionDescription;
	private String pseudoFunctionName;

	// Default constructor for deserialization
	private ReuseSearch()
	{
	}

	// Constructor for initial construction
	public ReuseSearch(Function function, String pseudoFunctionName, String pseudoFunctionDescription, String projectId)
	{
		super(projectId);
		this.submitValue = 5;
		this.function = (Ref<Function>) Ref.create(function.getKey());
		this.pseudoFunctionDescription = pseudoFunctionDescription;
		this.pseudoFunctionName = pseudoFunctionName;
		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new ReuseSearchInFirebase(
				id,this.microtaskTitle(),
				this.microtaskName(),
				function.getName(),
				function.getID(),
				false,
				false,
				submitValue,
				pseudoFunctionName,
				pseudoFunctionDescription,
				function.getID()),
				Microtask.keyToString(this.getKey()),
				projectId);

		HistoryLog.Init( projectId ).addEvent(new MicrotaskSpawned(this));
	}

    public Microtask copy(String projectId)
    {
    	return new ReuseSearch(  (Function) getOwningArtifact(), this.pseudoFunctionName, this.pseudoFunctionDescription, projectId);
    }

    public Key<Microtask> getKey()
	{
		return Key.create( function.getKey(), Microtask.class, this.id );
	}

	protected void doSubmitWork(DTO dto, String workerID, String projectId)
	{
		function.get().reuseSearchCompleted((ReusedFunctionDTO) dto,pseudoFunctionName, pseudoFunctionDescription, projectId);
//		WorkerCommand.awardPoints(workerID, this.submitValue);

		//FirebaseService.setPoints(workerID, workerOfReviewedWork,  this.submitValue, project);
    	FirebaseService.postToNewsfeed(workerID, (
    		new NewsItemInFirebase(
    			this.submitValue,
    			this.microtaskName(),
    			"SubmittedReuseSearch",
    			Microtask.keyToString(this.getKey()),
    			-1 // differentiate the reviews from the 0 score tasks
	    	).json()),
			Microtask.keyToString(this.getKey()),
			projectId
		);

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
		return pseudoFunctionDescription;
	}

	public Function getCaller()
	{
		return function.get();
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
		return "Reuse search";
	}

	public String microtaskDescription()
	{
		return "do a reuse search";
	}
}
