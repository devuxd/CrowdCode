package com.crowdcoding.artifacts;

import com.googlecode.objectify.Key;
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
}
