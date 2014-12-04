package com.crowdcoding.dto.firebase;

public class WriteTestCasesInFirebase extends MicrotaskInFirebase
{
	public long functionID;
	public String promptType;
	public String disputeDescription;
	public String disputedTestCase;

	public WriteTestCasesInFirebase()
	{
	}

	public WriteTestCasesInFirebase(long id,String title, String type,
			String owningArtifact, Long owningArtifactId, boolean completed, int points,
			long testedFunctionID, String promptType, String disputeDescription, String disputedTestCase)
	{
		super(id,title, type, owningArtifact, owningArtifactId, completed, points);

		this.functionID = testedFunctionID;
		this.promptType = promptType;
		this.disputeDescription = disputeDescription;
		this.disputedTestCase = disputedTestCase;
	}
}
