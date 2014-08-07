package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.Project;
import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.commands.ProjectCommand;
import com.crowdcoding.artifacts.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.firebase.MicrotaskInFirebase;
import com.crowdcoding.dto.history.MicrotaskSkipped;
import com.crowdcoding.dto.history.MicrotaskSubmitted;
import com.crowdcoding.util.FirebaseService;
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
	protected boolean completed = false;
	protected int submitValue = DEFAULT_SUBMIT_VALUE;
	protected long assignmentTimeInMillis;	// time when worker is assigned microtask, in milliseconds
	
	// Default constructor for deserialization
	protected Microtask()
	{		
	}
	
	// Constructor for initialization. Microtask is set as ready.
	protected Microtask(Project project)
	{
		this.project = project.getKey();
		id = project.generateID("Microtask");
		ProjectCommand.queueMicrotask(id);
	}
	
	// Constructor for initialization. Ready determines if the microtask is ready to be assigned
	protected Microtask(Project project, boolean ready)
	{
		this.project = project.getKey();
		id = project.generateID("Microtask");
		if (ready)
			ProjectCommand.queueMicrotask(id);
	}		
	
	// Override this method to allow the microtask to decide, right before it is assigned,
	// if it is still needed
	protected boolean isStillNeeded(Project project) { return true; }
	
	public void submit(String jsonDTOData, String workerID, Project project)
	{
		// If this microtask has already been completed, drop it, and clear the worker from the microtask 
		if (this.completed)
		{
			System.out.println("For microtask " + this.toString() + " JSON submitted for already completed work: " 
					+ jsonDTOData);
			return;
		}
		
		DTO dto = DTO.read(jsonDTOData, getDTOClass());
		project.historyLog().beginEvent(new MicrotaskSubmitted(this, workerID));

		doSubmitWork(dto, project);	
		this.completed = true;
		ofy().save().entity(this).now();

		WorkerCommand.awardPoints(workerID, this.submitValue, this.microtaskDescription());		
				
		// Save the associated artifact to Firebase if there is one
		Artifact owningArtifact = this.getOwningArtifact();
		if (owningArtifact != null)
			owningArtifact.storeToFirebase(project);
		
		project.historyLog().endEvent();
		postToFirebase(project, this.getOwningArtifact());
	}	
	
	public void skip(String workerID, Project project)
	{
		project.historyLog().beginEvent(new MicrotaskSkipped(this, workerID));
		// Increment the point value by 10
		this.submitValue += 10;
		ofy().save().entity(this).now();				
		postToFirebase(project, this.getOwningArtifact());		
		project.historyLog().endEvent();
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
	
	public int getSubmitValue()
	{
		return submitValue;
	}
	
	// Posts the current state of the microtask to firebase
	protected void postToFirebase(Project project, Artifact owningArtifact)
	{
		String owningArtifactName = (owningArtifact == null) ? "" : owningArtifact.getName();
		Worker worker = null;
		String workerName = (worker == null) ? "" : worker.getHandle();
		FirebaseService.writeMicrotask(new MicrotaskInFirebase(id, this.microtaskName(),
				owningArtifactName, false, false, completed, submitValue, workerName), 
				id, project);
	}
	
	public String toString()
	{
		return "" + this.id + " " + this.getClass().getSimpleName() + 
				(this.getOwningArtifact() != null ? (" on " + this.getOwningArtifact().getName()) : "") + 
				(completed ? " completed " : " incomplete ") + "points: " + submitValue;
	}
}
