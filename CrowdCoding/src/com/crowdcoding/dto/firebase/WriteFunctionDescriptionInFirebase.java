package com.crowdcoding.dto.firebase;

public class WriteFunctionDescriptionInFirebase extends MicrotaskInFirebase
{
	public String callDescription;
	public long functionID;

	public WriteFunctionDescriptionInFirebase()
	{
	}

	public WriteFunctionDescriptionInFirebase(long id, String type,
			String owningArtifact, boolean completed, int points,
			String callDescription, long callerID)
	{
		super(id, type, owningArtifact, completed, points);

		this.callDescription = callDescription;
		this.functionID=callerID;


	}
}
