package com.crowdcoding.entities.Artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;

import com.crowdcoding.commands.ProjectCommand;
import com.crowdcoding.entities.microtasks.Microtask;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;

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

	//true if the artifact is still needed false otherwise
	protected boolean isAPIArtifact;
	protected boolean isReadOnly;
	protected boolean isDeleted;


	// Default constructor for deserialization
	protected Artifact()
	{
	}

	// Constructor for initialization.
	protected Artifact(boolean isAPIArtifact, boolean isReadOnly, String projectId)
	{
		this.isAPIArtifact = isAPIArtifact;
		this.isReadOnly	   = isReadOnly;
		this.isDeleted     = false;
		this.version       = 0;
		this.projectId     = projectId;
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

	public long getId()
	{
		return id;
	}

	public Ref getRef()
	{
		return Ref.create(this.getKey());
	}

	public void deleteArtifact()
	{
		if(! isAPIArtifact){
			this.isDeleted = true;
			ofy().save().entity(this).now();

		}

	}

	public void unDeleteArtifact()
	{
		this.isDeleted = false;
		ofy().save().entity(this).now();
	}
	public boolean isDeleted()
	{
		return this.isDeleted;
	}

	public String getArtifactType()
	{
		// Return the name of the runtime class of this instance (e.g., Function)
		return this.getClass().getSimpleName();
	}

	public /* abstract */  String getName() { throw new RuntimeException("Must implement getName()."); };

	// Writes the artifact out to Firebase, publishing the current state of the artifact to all clients.
	public void storeToFirebase(String projectId) { throw new RuntimeException("Must implement storeToFirebase().");  };

	protected void incrementVersion()
	{
		version++;
		ofy().save().entity(this).now();
	}

}
