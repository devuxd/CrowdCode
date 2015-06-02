package com.crowdcoding.dto.firebase.microtask;

import com.crowdcoding.dto.ajax.microtask.submission.PseudoFunctionDTO;

public class WriteFunctionDescriptionInFirebase extends MicrotaskInFirebase
{
	public String pseudoFunctionName;
	public String pseudoFunctionDescription;
	public long functionID;

	public WriteFunctionDescriptionInFirebase()
	{
	}

	public WriteFunctionDescriptionInFirebase(long id,String title, String type,
			String owningArtifact, Long owningArtifactId, boolean completed, boolean canceled, int points,
			String pseudoFunctionName,String pseudoFunctionDescription, long callerID)
	{
		super(id,title, type, owningArtifact, owningArtifactId, completed, canceled, points);

		this.pseudoFunctionName=pseudoFunctionName;
		this.pseudoFunctionDescription = pseudoFunctionDescription;
		this.functionID=callerID;


	}
}
