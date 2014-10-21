package com.crowdcoding.entities.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.Project;
import com.crowdcoding.history.MicrotaskSkipped;
import com.crowdcoding.history.MicrotaskSubmitted;
import com.google.appengine.labs.repackaged.org.json.JSONArray;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Parent;

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
	}
			
	// Creates a copy of this microtask, identical in all respects except with a new microtaskID
	// and with a reset completed and assignmentTime. The microtask is NOT queued onto the project work queue.
	// This method MUST be overridden in the subclass
	public Microtask copy(Project project)
	{
		throw new RuntimeException("Error - must implement in subclass!");
	}
	
	// Override this method to allow the microtask to decide, right before it is assigned,
	// if it is still needed
	protected boolean isStillNeeded(Project project) { return true; }
	
	public void submit(String jsonDTOData, String workerID, Project project)
	{
		// If this microtask has already been completed, drop it, and clear the worker from the microtask
		// TODO: move this check to the project, as this check will be too late for work creating review microtasks.
		if (this.completed)
		{
			System.out.println("For microtask " + this.toString() + " JSON submitted for already completed work: " 
					+ jsonDTOData);
			return;
		}
		//System.out.println("PRINTING JSON DTO DATA");
		//System.out.println(jsonDTOData);
		DTO dto = DTO.read(jsonDTOData, getDTOClass());
		project.historyLog().beginEvent(new MicrotaskSubmitted(this, workerID));

		doSubmitWork(dto, workerID, project);	
		this.completed = true;
		ofy().save().entity(this).now();

		// Save the associated artifact to Firebase if there is one
		Artifact owningArtifact = this.getOwningArtifact();
		if (owningArtifact != null)
			owningArtifact.storeToFirebase(project);
		
		// increase the stats counter 
		WorkerCommand.increaseStat(workerID, "microtasks",1);
		
		project.historyLog().endEvent();
	}	
	
	public void skip(String workerID, Project project)
	{
		project.historyLog().beginEvent(new MicrotaskSkipped(this, workerID));
		// Increment the point value by 10
		this.submitValue += 10;
		ofy().save().entity(this).now();				
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
	protected void doSubmitWork(DTO dto, String workerID, Project project)
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
	
	// Should only be called from within the entity group of the owning artifact
	public static Ref<Microtask> find(long id, Project project)
	{
		return (Ref<Microtask>) ofy().load().key(Key.create(project.getKey(), Microtask.class, id));		
	}
	
	public String toString()
	{
		return "" + this.id + " " + this.getClass().getSimpleName() + 
				(this.getOwningArtifact() != null ? (" on " + this.getOwningArtifact().getName()) : "") + 
				(completed ? " completed " : " incomplete ") + "points: " + submitValue;
	}
	public String toJSON(){
		return toJSON(new JSONObject());
	}
	
	public String toJSON(JSONObject json){
		try {
			json.put("id", this.id);
			json.put("type", this.microtaskName());
			json.put("description", this.microtaskDescription());
			json.put("title", this.microtaskTitle());
			json.put("submitValue", this.getSubmitValue());
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return json.toString();
	}
}
