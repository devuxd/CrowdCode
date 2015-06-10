package com.crowdcoding.dto.firebase;


public class DebugTestFailureInFirebase extends MicrotaskInFirebase
{
	public long functionID;

	public DebugTestFailureInFirebase()
	{
	}

	public DebugTestFailureInFirebase(
			long id,
			String title,
			String type,
			String owningArtifact,
			Long owningArtifactId,
			boolean completed,
			boolean canceled,
			int points,
			long testedFunctionID)
	{
		super(id,title, type, owningArtifact, owningArtifactId, completed, canceled, points);
		this.functionID = testedFunctionID;
	}
}
