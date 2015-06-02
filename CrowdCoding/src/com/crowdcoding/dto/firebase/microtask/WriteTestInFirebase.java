package com.crowdcoding.dto.firebase.microtask;


public class WriteTestInFirebase extends MicrotaskInFirebase
{
	public long testID;
	public long functionID;
	public int functionVersion;
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
			String title,
			String type,
			String owningArtifact,
			Long owningArtifactId,
			boolean completed,
			boolean canceled,
			int points,
			long testID,
			long testedFunctionID,
			int functionVersion,
			String promptType,
			String issueDescription, 				// Only defined for CORRECT
			String oldFunctionDescription,			// Only defined for FUNCTION_CHANGED
			String newFunctionDescription,			// Only defined for FUNCTION_CHANGED
			String oldTestCase)
	{
		super(id,title, type, owningArtifact, owningArtifactId, completed, canceled, points);
		this.testID = testID;
		this.functionID = testedFunctionID;
		this.functionVersion = functionVersion;
		this.promptType = promptType;
		this.issueDescription = issueDescription;
		this.oldFunctionDescription = oldFunctionDescription;
		this.newFunctionDescription = newFunctionDescription;
		this.oldTestCase = oldTestCase;
	}
}
