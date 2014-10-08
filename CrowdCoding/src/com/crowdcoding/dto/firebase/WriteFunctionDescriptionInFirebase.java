package com.crowdcoding.dto.firebase;

public class WriteFunctionDescriptionInFirebase extends MicrotaskInFirebase 
{
	public String callDescription;


	public WriteFunctionDescriptionInFirebase() 
	{
	}

	public WriteFunctionDescriptionInFirebase(long id, String type,
			String owningArtifact, boolean completed, int points,
			String callDescription)
	{
		super(id, type, owningArtifact, completed, points);
		
		this.callDescription = callDescription;
		
		
	}
}
