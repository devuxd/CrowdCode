package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Project;
import com.crowdcoding.util.IDGenerator;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;

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
	
	// Default constructor for deserialization
	protected Microtask()
	{		
	}
	
	// Constructor for initialization.
	protected Microtask(Project project)
	{
		id = IDGenerator.Instance.generateID(this);
	}
		
	// Assigns a microtask and returns it. Returns null if no microtasks are available.
	public static Microtask Assign(Worker crowdUser)
	{		
		Microtask microtask = ofy().load().type(Microtask.class).filter("assigned", false).first().get();         
		
		// If there's no unassigned microtasks available, return null
		if (microtask == null)
			return null;

		microtask.assigned = true;
		crowdUser.setMicrotask(microtask);
		ofy().save().entity(microtask);
		
		return microtask;
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
}
