package com.crowdcoding.dto.firebase;

public class WriteCallInFirebase extends MicrotaskInFirebase
{
	public String calleeFullDescription;

	public WriteCallInFirebase()
	{
	}

	public WriteCallInFirebase(long id, String type,
			String owningArtifact, boolean completed, int points,
			String calleeFullDescription)
	{
		super(id, type, owningArtifact, completed, points);

		this.calleeFullDescription=calleeFullDescription.replace("\n", "<br />");


	}
}
