package com.crowdcoding.dto.firebase;

import com.crowdcoding.dto.DTO;

public class MicrotaskInFirebase extends DTO 
{
	public String messageType = "MicrotaskInFirebase";
	
	public long id;
	public String type;
	public String owningArtifact;
	public boolean completed;
	public int points;
	
	// Default constructor (required by Jackson JSON library)
	public MicrotaskInFirebase()
	{		
	}

	public MicrotaskInFirebase(long id, String type, String owningArtifact,
			boolean completed, int points) {
		this.id = id;
		this.type = type;
		this.owningArtifact = owningArtifact;
		this.completed = completed;
		this.points = points;
	}		
}
