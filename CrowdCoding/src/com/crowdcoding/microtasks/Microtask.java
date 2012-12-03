package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;

import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Project;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.DTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;
import com.googlecode.objectify.cmd.Query;

/*
 * NOTE: The Microtask class is abstract and SHOULD NOT be instantiated, except for internally inside objectify
 * which needs to instantiate them to register subclasses.
 */
@Entity
public /*abstract*/ class Microtask 
{
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
		id = project.generateID("Microtask");
	}
		
	// Assigns a microtask and returns it. Returns null if no microtasks are available.
	public static Microtask Assign(Worker crowdUser)
	{		
		dumpMicrotasks();
		
		Microtask microtask = ofy().load().type(Microtask.class).filter("assigned", false).first().get();         
		
		// If there's no unassigned microtasks available, return null
		if (microtask == null)
			return null;

		microtask.assigned = true;
		crowdUser.setMicrotask(microtask);
		ofy().save().entity(microtask).now();
		
		return microtask;
	}
	
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
		return Key.create(Microtask.class, id);
	}
	
	public long getID()
	{
		return id;
	}	
	
	// returns the relative path to the UI for this microtask
	public String getUIURL() { return ""; }
	
	// Sets the microtask as completed using the submission data (in json format)
	public void submit(String jsonDTOData, Worker worker, Project project)
	{	
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
	
	// Writes all microtasks to the console
	public static void dumpMicrotasks()
	{
		System.out.println("**** ALL MICROTASKS ****");
		
		Query<Microtask> q = ofy().load().type(Microtask.class);		
		for (Microtask microtask : q)
			System.out.println(microtask.toString());
	}
	
	public String toString()
	{
		return "" + this.id + " " + this.getClass().getSimpleName() + (assigned ? " assigned " : " unassigned ") + 
				(completed ? " completed " : " incomplete ");
	}
}
