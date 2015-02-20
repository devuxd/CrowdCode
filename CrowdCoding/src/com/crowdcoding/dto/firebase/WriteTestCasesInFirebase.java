package com.crowdcoding.dto.firebase;

public class WriteTestCasesInFirebase extends MicrotaskInFirebase
{
	public long functionID;
	public String promptType;
	public String issueDescription;
	public String issuedTestCase;

	public WriteTestCasesInFirebase()
	{
	}

	public WriteTestCasesInFirebase(
			long id,
			String title, 
			String type,
			String owningArtifact, 
			Long owningArtifactId, 
			boolean completed, 
			int points,
			long testedFunctionID, 
			String promptType, 
			String issueDescription, 
			String issuedTestCase)
	{
		super(id,title, type, owningArtifact, owningArtifactId, completed, points);

		this.functionID       = testedFunctionID;
		this.promptType       = promptType;
		this.issueDescription = issueDescription;
		this.issuedTestCase   = issuedTestCase;
	}
}
