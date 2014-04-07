package com.crowdcoding.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.LinkedList;
import java.util.Queue;

import com.crowdcoding.Project;
import com.crowdcoding.microtasks.DebugTestFailure;
import com.crowdcoding.microtasks.Microtask;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Parent;

/*
 * NOTE: Artifact classes are abstract and SHOULD NOT be instantiated, except for internally inside objectify
 * which needs to instantiate them to register subclasses.
 */

@Entity
public /*abstract*/ class Artifact 
{
	@Parent Key<Project> project;
	@Id protected long id;
	
	// Queued microtasks waiting to be done (not yet in the ready state)
	protected Queue<Ref<Microtask>> queuedMicrotasks = new LinkedList<Ref<Microtask>>();		
	protected Ref<Microtask> microtaskOut;
	
	// Default constructor for deserialization
	protected Artifact()
	{		
	}
	
	// Constructor for initialization. 
	protected Artifact(Project project)
	{
		this.project = project.getKey();
		id = project.generateID("Artifact");
	}
		
	public Key<? extends Artifact> getKey()
	{
		return Key.create(project, Artifact.class, id);
	}
	
	// Gets the corresponding key for an artifact based on its id
	public static Key<? extends Artifact> getKey(long id, Project project)
	{
		return Key.create(project.getKey(), Artifact.class, id);
	}
	
	public long getID()
	{
		return id;
	}

	public String getArtifactType() 
	{ 
		// Return the name of the runtime class of this instance (e.g., Function)
		return this.getClass().getSimpleName();
	}
	
	public /* abstract */  String getName() { throw new RuntimeException("Must implement getName()."); };
	
	
	//////////////////////////////////////////////////////////////////////////////
	//  MICROTASK QUEUEING
	//////////////////////////////////////////////////////////////////////////////
		
	// Queues the specified microtask and looks for work
	public void queueMicrotask(Microtask microtask, Project project)
	{
		queuedMicrotasks.add(Ref.create(microtask.getKey()));
		ofy().save().entity(this).now();
		lookForWork(project);		
	}
	
	// Makes the specified microtask out for work
	protected void makeMicrotaskOut(Microtask microtask)
	{
		microtask.makeReady();
		microtaskOut = Ref.create(microtask.getKey());
		ofy().save().entity(this).now();
	}
	
	protected void microtaskOutCompleted()
	{
		microtaskOut = null;
		ofy().save().entity(this).now();
	}
	
	// If there is no microtask currently out for this artifact, looks at the queued microtasks.
	// If there is a microtasks available, marks it as ready to be done.
	protected void lookForWork(Project project)
	{
		// If there is currently not already a microtask being done on this function, 
		// determine if there is work to be done
		if (microtaskOut == null && !queuedMicrotasks.isEmpty())
		{	
			makeMicrotaskOut(ofy().load().ref(queuedMicrotasks.remove()).get());
		}
	}
	
	// Returns if there is work to be done (either a microtask out or queued work)
	protected boolean workToBeDone()
	{
		return microtaskOut != null || !queuedMicrotasks.isEmpty();		
	}
}
