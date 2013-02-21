package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;

import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Project;
import com.crowdcoding.artifacts.UserStory;
import com.crowdcoding.dto.DTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.googlecode.objectify.Key;
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
	@Index protected boolean assigned = false;
	@Index protected boolean completed = false;
	protected int submitValue = 10;
	
	// Default constructor for deserialization
	protected Microtask()
	{		
	}
	
	// Constructor for initialization.
	protected Microtask(Project project)
	{
		this.project = project.getKey();
		id = project.generateID("Microtask");
	}
		
	// Assigns a microtask and returns it. Returns null if no microtasks are available.
	public static Microtask Assign(Worker crowdUser, Project project)
	{		
		System.out.println(StatusReport(project));
		
		Microtask microtask = ofy().load().type(Microtask.class).ancestor(project.getKey()).filter(
				"assigned", false).first().get();         
		
		// If there's no unassigned microtasks available, signifying that work
		// on the current user stories is complete (or nearly complete), 
		// generate a new WriteUserStory microtask.
		if (microtask == null)
		{
			UserStory userStory = new UserStory(project);
			microtask = userStory.getMicrotask();			
			if (microtask == null)
				throw new RuntimeException("Error - creating a user story did not create a microtask as expected");			
		}

		microtask.assigned = true;
		microtask.onAssign();
		crowdUser.setMicrotask(microtask);
		ofy().save().entity(microtask).now();
		
		return microtask;
	}
	
	// Override this method to handle an assigment event.
	public void onAssign() {};
	
	// Unassigns worker from this microtask
	// Precondition - the worker must be assigned to this microtask
	public void unassign(Worker worker)
	{
		assert (worker.getMicrotask() == this);
		assert (assigned == true);
		
		worker.setMicrotask(null);
		assigned = false;	
		ofy().save().entity(this).now();
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
		
		// If this microtask has already been submitted, drop it.
		if (this.completed)
		{
			System.out.println("For microtask " + this.toString() + " JSON submitted for already completed work: " 
					+ jsonDTOData);
			return;
		}
				
		ObjectMapper mapper = new ObjectMapper();
		
		DTO dto = null;
		try {
			dto = mapper.readValue(jsonDTOData, getDTOClass());
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		doSubmitWork(dto, project);	
		this.completed = true;
		worker.setMicrotask(null);
		worker.awardPoints(this.submitValue, project);
		ofy().save().entity(this).now();		
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
		return "" + this.id + " " + this.getClass().getSimpleName() + (assigned ? " assigned " : " unassigned ") + 
				(completed ? " completed " : " incomplete ");
	}
}
