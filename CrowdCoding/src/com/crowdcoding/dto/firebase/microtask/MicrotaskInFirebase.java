package com.crowdcoding.dto.firebase.microtask;

import com.crowdcoding.dto.DTO;

public class MicrotaskInFirebase extends DTO
{
	public String messageType = "MicrotaskInFirebase";

	public long id;
	public String title;
	public String type;
	public Long owningArtifactId;
	public String owningArtifact;
	public boolean completed;
	public int points;
	public Long functionId;


	// Default constructor (required by Jackson JSON library)
	public MicrotaskInFirebase()
	{
	}

	public MicrotaskInFirebase(long id, String title, String type, String owningArtifact,
			Long owningArtifactId, int points, Long functionId) {
		this.id 				= id;
		this.title				= title;
		this.type 				= type;
		this.owningArtifact 	= owningArtifact;
		this.owningArtifactId	= owningArtifactId;
		this.points 			= points;
		this.functionId 		= functionId;
		this.completed 			= false;

	}
}
