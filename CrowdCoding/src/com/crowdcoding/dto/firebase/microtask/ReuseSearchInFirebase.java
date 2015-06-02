package com.crowdcoding.dto.firebase.microtask;

import com.crowdcoding.dto.ajax.microtask.submission.PseudoFunctionDTO;

public class ReuseSearchInFirebase extends MicrotaskInFirebase
{
	public String pseudoFunctionDescription;
	public String pseudoFunctionName;
	public long functionID;

	public ReuseSearchInFirebase()
	{
	}

	public ReuseSearchInFirebase(long id,String title, String type,
			String owningArtifact, Long owningArtifactId, boolean completed, boolean canceled, int points,
			String pseudoFunctionName, String callDescription, long callerID)
	{
		super(id, title, type, owningArtifact, owningArtifactId, completed, canceled, points);

		this.pseudoFunctionName = pseudoFunctionName;
		this.pseudoFunctionDescription = callDescription;
		this.functionID=callerID;
	}
}
