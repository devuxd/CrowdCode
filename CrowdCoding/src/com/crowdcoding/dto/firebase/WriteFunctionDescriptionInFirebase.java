package com.crowdcoding.dto.firebase;

import com.crowdcoding.dto.PseudoFunctionDTO;

public class WriteFunctionDescriptionInFirebase extends MicrotaskInFirebase
{
	public String callDescription;
	public long functionID;

	public WriteFunctionDescriptionInFirebase()
	{
	}

	public WriteFunctionDescriptionInFirebase(long id,String title, String type,
			String owningArtifact, Long owningArtifactId, boolean completed, boolean canceled, int points,
			String callDescription, long callerID)
	{
		super(id,title, type, owningArtifact, owningArtifactId, completed, canceled, points);

		this.callDescription = callDescription;
		this.functionID=callerID;


	}
}
