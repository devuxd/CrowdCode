package com.crowdcoding.artifacts;

import com.crowdcoding.util.IDGenerator;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;

/*
 * NOTE: Artifact classes are abstract and SHOULD NOT be instantiated, except for internally inside objectify
 * which needs to instantiate them to register subclasses.
 */

@Entity
public /*abstract*/ class Artifact 
{
	@Id protected long id;
	
	// Default constructor for deserialization
	protected Artifact()
	{		
	}
	
	// Constructor for initialization. 
	protected Artifact(Project project)
	{
		id = project.generateID("artifact");
	}
		
	public Key<? extends Artifact> getKey()
	{
		return Key.create(Artifact.class, id);
	}
}
