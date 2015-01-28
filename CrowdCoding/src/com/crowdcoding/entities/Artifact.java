package com.crowdcoding.entities;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.LinkedList;
import java.util.Queue;

import com.crowdcoding.commands.ProjectCommand;
import com.crowdcoding.entities.microtasks.DebugTestFailure;
import com.crowdcoding.entities.microtasks.Microtask;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;
import com.googlecode.objectify.annotation.Load;
import com.googlecode.objectify.annotation.Parent;

/*
 * NOTE: Artifact classes are abstract and SHOULD NOT be instantiated, except for internally inside objectify
 * which needs to instantiate them to register subclasses.
 */

@Entity
public /*abstract*/ class Artifact
{
	@Id protected Long id;
	@Index String projectId;
	protected int version;		// version of the artifact

	// Queued microtasks waiting to be done (not yet in the ready state)
	protected Queue<Ref<Microtask>> queuedMicrotasks = new LinkedList<Ref<Microtask>>();
	protected boolean microtaskOut;		// Is there an associated microtask currently in progress?

	// Default constructor for deserialization
	protected Artifact()
	{
	}

	// Constructor for initialization.
	protected Artifact(String projectId)
	{
		this.projectId = projectId;
	}

	public Key<? extends Artifact> getKey()
	{
		return Key.create(Artifact.class,id);
	}

	// Gets the corresponding key for an artifact based on its id
	public static Key<? extends Artifact> getKey(Long id)
	{
		return Key.create( Artifact.class, id );
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

	// Writes the artifact out to Firebase, publishing the current state of the artifact to all clients.
	public void storeToFirebase(String projectId) { throw new RuntimeException("Must implement storeToFirebase().");  };

	//////////////////////////////////////////////////////////////////////////////
	//  MICROTASK QUEUEING
	//////////////////////////////////////////////////////////////////////////////

	// Queues the specified microtask and looks for work
	public void queueMicrotask(Microtask microtask, String projectId)
	{
		queuedMicrotasks.add(Ref.create(microtask.getKey()));
		ofy().save().entity(this).now();
		lookForWork();
	}

	// Makes the specified microtask out for work
	protected void makeMicrotaskOut(Microtask microtask)
	{
		ProjectCommand.queueMicrotask(microtask.getKey(), null);
		microtaskOut = true;
		ofy().save().entity(this).now();
	}
	// Makes the specified microtask out for work
	protected void setMicrotaskOut()
	{
		microtaskOut = true;
		ofy().save().entity(this).now();
	}

	protected void microtaskOutCompleted()
	{
		microtaskOut = false;
		ofy().save().entity(this).now();
	}


	protected void incrementVersion()
	{
		version++;
		ofy().save().entity(this).now();
	}

	// If there is no microtask currently out for this artifact, looks at the queued microtasks.
	// If there is a microtasks available, marks it as ready to be done.
	protected void lookForWork()
	{
		// If there is currently not already a microtask being done on this function,
		// determine if there is work to be done
		if (!microtaskOut && !queuedMicrotasks.isEmpty())
		{
			makeMicrotaskOut(ofy().load().ref(queuedMicrotasks.remove()).get());
		}
	}

	// Returns if there is work to be done (either a microtask out or queued work)
	protected boolean workToBeDone()
	{
		return microtaskOut || !queuedMicrotasks.isEmpty();
	}
}
