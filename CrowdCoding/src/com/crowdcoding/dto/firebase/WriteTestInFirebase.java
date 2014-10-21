package com.crowdcoding.dto.firebase;


public class WriteTestInFirebase extends MicrotaskInFirebase
{
	public long testID;
	public long testedFunctionID;
	public String promptType;
	public String issueDescription;
	public String oldFunctionDescription;
	public String newFunctionDescription;
	public String oldTestCase;


	public WriteTestInFirebase()
	{
	}

	public WriteTestInFirebase(
			long id,
			String type,
			String owningArtifact,
			boolean completed,
			int points,
			long testID,
			long testedFunctionID,
			String promptType,
			String issueDescription, 				// Only defined for CORRECT
			String oldFunctionDescription,			// Only defined for FUNCTION_CHANGED
			String newFunctionDescription,			// Only defined for FUNCTION_CHANGED
			String oldTestCase)
	{
		super(id, type, owningArtifact, completed, points);
		this.testID = testID;
		this.testedFunctionID = testedFunctionID;
		this.promptType = promptType;
		this.issueDescription = issueDescription;
		this.oldFunctionDescription = oldFunctionDescription.replace("\n", "<br/>");;
		this.newFunctionDescription = newFunctionDescription.replace("\n", "<br/>");;
		this.oldTestCase = oldTestCase;
	}
}
