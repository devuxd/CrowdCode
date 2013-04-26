package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.Project;
import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.UserStory;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.history.MicrotaskSkipped;
import com.crowdcoding.dto.history.MicrotaskSpawned;
import com.crowdcoding.dto.history.MicrotaskSubmitted;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;
import com.googlecode.objectify.annotation.Parent;
import com.googlecode.objectify.cmd.Query;

/*
 * NOTE: The Microtask class is abstract and SHOULD NOT be instantiated, except for internally inside objectify
 * which needs to instantiate them to register subclasses.
 */
@Entity
public /*abstract*/ class Microtask 
{
	@Parent private Key<Project> project;
	@Id protected long id;
	@Index protected boolean ready = false;	// Is the microtask ready to be assigned?
	@Index protected boolean assigned = false;
	@Index protected boolean completed = false;
	protected int submitValue = 10;
	protected long assignmentTimeInMillis;	// time when worker is assigned microtask, in milliseconds
	protected Ref<Worker> worker;
	protected List<Ref<Worker>> excludedWorkers = new ArrayList<Ref<Worker>>();  // Workers who may not be assigned this microtask
	
	// Default constructor for deserialization
	protected Microtask()
	{		
	}
	
	// Constructor for initialization. Microtask is set as ready.
	protected Microtask(Project project)
	{
		this.project = project.getKey();
		this.ready = true;
		id = project.generateID("Microtask");
	}
	
	// Constructor for initialization. Ready determines if the microtask is ready to be assigned
	protected Microtask(Project project, boolean ready)
	{
		this.project = project.getKey();
		this.ready = ready;
		id = project.generateID("Microtask");
	}		
		
	// Assigns a microtask and returns it. Returns null if no microtasks are available.
	public static Microtask Assign(Worker crowdUser, Project project)
	{		
		System.out.println(StatusReport(project));
		
		// Look for an unassigned microtask that crowdUser is not excluded from doing
		Microtask microtask = null;
		Key<Worker> workerKey = crowdUser.getKey();
		Query<Microtask> q = ofy().load().type(Microtask.class).ancestor(project.getKey()).filter(
				"assigned", false).filter("ready", true);  
		microtaskSearch: for (Microtask potentialMicrotask : q)
		{
			for (Ref<Worker> excludedWorker : potentialMicrotask.excludedWorkers)
			{
				if (excludedWorker.equivalent(workerKey))
					continue microtaskSearch;				
			}
			
			// Not excluded. A microtask was found.
			microtask = potentialMicrotask;
			break;			
		}		
		
		// Functionality to crowdsource a userStory if there is nothing to do. This behavior
		// is currently disabled.
		/*if (microtask == null)
		{
			UserStory userStory = new UserStory(project);
			microtask = userStory.getMicrotask();			
			if (microtask == null)
				throw new RuntimeException("Error - creating a user story did not create a microtask as expected");			
		}*/
		
		if (microtask == null)
			return null;

		microtask.worker = Ref.create(crowdUser.getKey());
		microtask.assigned = true;
		microtask.assignmentTimeInMillis = System.currentTimeMillis();
		microtask.onAssign(project);
		crowdUser.setMicrotask(microtask);
		ofy().save().entity(microtask).now();
		
		return microtask;
	}
	
	// Override this method to handle an assigment event.
	public void onAssign(Project project) {};
	
	// Unassigns worker from this microtask
	// Precondition - the worker must be assigned to this microtask
	public void skip(Worker worker, Project project)
	{
		assert (worker.getMicrotask() == this);
		assert (assigned == true);
		
		project.historyLog().beginEvent(new MicrotaskSkipped(this));
		
		// Increment the point value by 10
		this.submitValue += 10;
		
		// Exclude this worker from being assigned this microtask in the future
		excludedWorkers.add(Ref.create(worker.getKey()));
		
		// Unassign the microtask
		this.worker = null;
		worker.setMicrotask(null);
		assigned = false;	
		ofy().save().entity(this).now();
		
		project.historyLog().endEvent();
	}
	
	// Sets the microtask as ready to be assigned
	public void makeReady()
	{
		if (!this.ready)
		{
			this.ready = true;
			ofy().save().entity(this).now();
		}
	}
	
	public boolean isReady()
	{
		return ready;
	}
		
	public Key<Microtask> getKey()
	{
		return Key.create(project, Microtask.class, id);
	}
	
	public long getID()
	{
		return id;
	}	
	
	// returns the relative path to the UI for this microtask
	public String getUIURL() { return ""; }
	
	// Called to process a microtask submission based on form data (in json format)
	// If the microtask has previously been submitted or is no longer open, the submission is
	// dropped, ensuring workers cannot submit against already completed microtasks.
	public void submit(String jsonDTOData, Worker worker, Project project)
	{	
		System.out.println("Handling microtask submission: " + this.toString() + " " + jsonDTOData);
		
		// If this microtask has already been completed, drop it, and clear the worker from the microtask 
		if (this.completed)
		{
			System.out.println("For microtask " + this.toString() + " JSON submitted for already completed work: " 
					+ jsonDTOData);
			worker.setMicrotask(null);
			return;
		}
		
		project.historyLog().beginEvent(new MicrotaskSubmitted(this));

		DTO dto = DTO.read(jsonDTOData, getDTOClass());
		doSubmitWork(dto, project);	
		this.completed = true;
		worker.setMicrotask(null);
		worker.awardPoints(this.submitValue, this.microtaskDescription(), project);
		project.microtaskCompleted();
		ofy().save().entity(this).now();
		
		project.historyLog().endEvent();
	}

	// This method MUST be overridden in the subclass to do submit work.
	protected void doSubmitWork(DTO dto, Project project)
	{
		throw new RuntimeException("Error - must implement doSubmitWork!");
	}
	
	// This method MUST be overridden in the subclass
	protected Class getDTOClass()
	{
		throw new RuntimeException("Error - must implement in subclass!");
	}
	
	// This method MUST be overridden in the subclass to provide the owning artifact.
	// The owning artifact is the artifact that will be modified by this microtask. If multiple artifacts 
	// may be modified, the owning artifact is null.
	public Artifact getOwningArtifact()
	{
		throw new RuntimeException("Error - must implement in subclass!");
	}
	
	// This method MUST be overridden in the subclass to provide the name of the microtask.
	public String microtaskTitle()
	{
		throw new RuntimeException("Error - must implement in subclass!");
	}	
	
	// This method MUST be overridden in the subclass to provide the name of the microtask.
	public String microtaskDescription()
	{
		throw new RuntimeException("Error - must implement in subclass!");
	}
	
	public String microtaskName()
	{
		// Get the name of the runtime microtask instance (e.g., ReuseSearch)
		return this.getClass().getSimpleName();
	}
	
	public long assignmentTimeInMillis()
	{
		return assignmentTimeInMillis;
	}
	
	public Worker getWorker()
	{
		if (worker != null)
			return ofy().load().key(worker.getKey()).get();
		else
			return null;
	}
	
	public int getSubmitValue()
	{
		return submitValue;
	}
	
	public static String StatusReport(Project project)
	{
		StringBuilder output = new StringBuilder();
		
		output.append("**** ALL MICROTASKS ****\n");
		
		Query<Microtask> q = ofy().load().type(Microtask.class).ancestor(project.getKey());		
		for (Microtask microtask : q)
			output.append(microtask.toString() + "\n");
		
		return output.toString();
	}
	
	public String toString()
	{
		return "" + this.id + " " + this.getClass().getSimpleName() + 
				(this.getOwningArtifact() != null ? (" on " + this.getOwningArtifact().getName()) : "") + 
				": " + (ready? " ready " : " not ready ") + 
				(assigned ? " assigned " : " unassigned ") + 
				(completed ? " completed " : " incomplete ") + "points: " + submitValue + 
				((worker != null) ? (" worker: " + ofy().load().key(worker.getKey()).get().getHandle()) : " ");
	}
}
