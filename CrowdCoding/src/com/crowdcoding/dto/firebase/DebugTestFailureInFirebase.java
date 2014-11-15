package com.crowdcoding.dto.firebase;


public class DebugTestFailureInFirebase extends MicrotaskInFirebase
{
	public long testID;
	public long functionID;

	public DebugTestFailureInFirebase()
	{
	}

	public DebugTestFailureInFirebase(
			long id,
			String title,
			String type,
			String owningArtifact,
			boolean completed,
			int points,
			long testedFunctionID)
	{
		super(id,title, type, owningArtifact, completed, points);
		this.functionID = testedFunctionID;
	}

	public DebugTestFailureInFirebase(
			long id,
			String title,
			String type,
			String owningArtifact,
			boolean completed,
			int points,
			long testID,
			long testedFunctionID)
	{
		super(id,title, type, owningArtifact, completed, points);
		this.testID = testID;
		this.functionID = testedFunctionID;
	}
}