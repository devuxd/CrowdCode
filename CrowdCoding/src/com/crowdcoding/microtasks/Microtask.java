package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.Project;
import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.history.MicrotaskSkipped;
import com.crowdcoding.dto.history.MicrotaskSubmitted;
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
	static protected int DEFAULT_SUBMIT_VALUE = 10;
	
	@Parent private Key<Project> project;
	@Id protected long id;
	@Index protected boolean ready = false;	// Is the microtask ready to be assigned?
	@Index protected boolean assigned = false;
	@Index protected boolean completed = false;
	protected int submitValue = DEFAULT_SUBMIT_VALUE;
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
		
		// Look for a microtask, checking constraints on it along the way
		Microtask microtask = null;
		Key<Worker> workerKey = crowdUser.getKey();
		Query<Microtask> q = ofy().load().type(Microtask.class).ancestor(project.getKey()).filter(
				"assigned", false).filter("completed", false).filter("ready", true);  
		microtaskSearch: for (Microtask potentialMicrotask : q)
		{
			// 1. If the worker is excluded from doing it, keep looking
			for (Ref<Worker> excludedWorker : potentialMicrotask.excludedWorkers)
			{
				if (excludedWorker.equivalent(workerKey))
					continue microtaskSearch;				
			}
			
			// 2. If the microtask is no longer needed, keep looking
			if (!potentialMicrotask.isStillNeeded(project))
			{
				potentialMicrotask.markCompleted();
				continue microtaskSearch;
			}
			
			// A microtask was found!
			microtask = potentialMicrotask;
			break;			
		}
		
		// If there are no more microtasks currently available, return null
		if (microtask == null)
		{
			return null;
		}

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
	
	// Override this method to allow the microtask to decide, right before it is assigned,
	// if it is still needed
	protected boolean isStillNeeded(Project project) { return true; }
	
	// Marks the microtask as completed. 
	public void markCompleted()
	{
		this.completed = true;
		if (this.worker != null)
		{
			this.assigned = false;
			Worker worker = ofy().load().ref(this.worker).get();
			worker.setMicrotask(null);
			this.worker = null;					
		}
		ofy().save().entity(this).now();
	}
	
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
		
		// Check if microtask is highly skipped and should be reset
		resetIfHighlySkipped(project);
		
		project.historyLog().endEvent();
	}
	
	// Checks the microtask to see if most workers have skipped it. If so, resets the
	// excluded workers to give workers another chance.
	private void resetIfHighlySkipped(Project project)
	{
		// If all workers have skipped it, reset exclusion constraints.
		// TODO: we really should reset based on the status of logged in workers. But there
		// is currently no way to track that accurately.
		if (excludedWorkers.size() >= Worker.allWorkers(project).size())
		{
			excludedWorkers.clear();
			ofy().save().entity(this).now();
			
			System.out.println("Reset excluded workers for " + this.toString());
		}
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
		
		DTO dto = DTO.read(jsonDTOData, getDTOClass());
		
		// Give the microtask an opportunity to check the submissions.
		// If the microtask fails its validation tests, drop submission and treat it as a skip.
		if (submitAccepted(dto, project))
		{		
			project.historyLog().beginEvent(new MicrotaskSubmitted(this));
	
			doSubmitWork(dto, project);	
			this.completed = true;
			worker.setMicrotask(null);
			worker.awardPoints(this.submitValue, this.microtaskDescription(), project);
			project.microtaskCompleted();
			
			ofy().save().entity(this).now();

			// Save the associated artifact to Firebase if there is one
			Artifact owningArtifact = this.getOwningArtifact();
			if (owningArtifact != null)
				owningArtifact.storeToFirebase(project);
			
			project.historyLog().endEvent();
		}
		else
		{
			skip(worker, project);
		}
	}
	
	// Runs machine validation on the submitted data to determine if it is accepted as completing
	// the microtask. Subclasses may choose to override this method to provide logic to perform this 
	// check. The default behavior is to accept all submissions.
	protected boolean submitAccepted(DTO dto, Project project)
	{
		return true;
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
