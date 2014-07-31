package com.crowdcoding.dto.firebase;

import com.crowdcoding.dto.DTO;

public class MicrotaskInFirebase extends DTO 
{
	public String messageType = "MicrotaskInFirebase";
	
	public long id;
	public String type;
	public String owningArtifact;
	public boolean ready;
	public boolean assigned;
	public boolean completed;
	public int points;
	public String workerID;
	
	// Default constructor (required by Jackson JSON library)
	public MicrotaskInFirebase()
	{		
	}

	public MicrotaskInFirebase(long id, String type, String owningArtifact,
			boolean ready, boolean assigned, boolean completed, int points,
			String workerID) {
		this.id = id;
		this.type = type;
		this.owningArtifact = owningArtifact;
		this.ready = ready;
		this.assigned = assigned;
		this.completed = completed;
		this.points = points;
		this.workerID = workerID;
	}		
}
