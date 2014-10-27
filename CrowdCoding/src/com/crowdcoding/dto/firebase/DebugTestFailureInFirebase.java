package com.crowdcoding.dto.firebase;


public class DebugTestFailureInFirebase extends MicrotaskInFirebase
{
	public long testID;
	public long testedFunctionID;

	public DebugTestFailureInFirebase()
	{
	}

	public DebugTestFailureInFirebase(
			long id,
			String type,
			String owningArtifact,
			boolean completed,
			int points,
			long testID,
			long testedFunctionID)
	{
		super(id, type, owningArtifact, completed, points);
		this.testID = testID;
		this.testedFunctionID = testedFunctionID;
	}
}
