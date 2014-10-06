package com.crowdcoding.dto.firebase;

public class WriteFunctionInFirebase extends MicrotaskInFirebase 
{
	public long functionID;
	public String promptType;


	public WriteFunctionInFirebase() 
	{
	}

	public WriteFunctionInFirebase(long id, String type,
			String owningArtifact, boolean completed, int points,
			long functionID, String promptType)
	{
		super(id, type, owningArtifact, completed, points);
		
		this.functionID = functionID;
		this.promptType = promptType;
		
	}
}
