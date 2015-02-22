package com.crowdcoding.dto.firebase;

import com.crowdcoding.dto.PseudoFunctionDTO;

public class ReuseSearchInFirebase extends MicrotaskInFirebase
{
	public String pseudoFunctionDescription;
	public String pseudoFunctionName;
	public long functionID;

	public ReuseSearchInFirebase()
	{
	}

	public ReuseSearchInFirebase(long id,String title, String type,
			String owningArtifact, Long owningArtifactId, boolean completed, int points,
			String pseudoFunctionName, String callDescription, long callerID)
	{
		super(id, title, type, owningArtifact, owningArtifactId, completed, points);

		this.pseudoFunctionName = pseudoFunctionName;
		this.pseudoFunctionDescription = callDescription;
		this.functionID=callerID;
	}
}
