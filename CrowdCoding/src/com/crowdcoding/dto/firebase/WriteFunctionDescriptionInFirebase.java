package com.crowdcoding.dto.firebase;

import com.crowdcoding.dto.PseudoFunctionDTO;

public class WriteFunctionDescriptionInFirebase extends MicrotaskInFirebase
{
	public PseudoFunctionDTO callDescription;
	public long functionID;

	public WriteFunctionDescriptionInFirebase()
	{
	}

	public WriteFunctionDescriptionInFirebase(long id,String title, String type,
			String owningArtifact, Long owningArtifactId, boolean completed, int points,
			PseudoFunctionDTO callDescription, long callerID)
	{
		super(id,title, type, owningArtifact, owningArtifactId, completed, points);

		this.callDescription = callDescription;
		this.functionID=callerID;


	}
}
