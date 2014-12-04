package com.crowdcoding.dto.firebase;

public class WriteFunctionInFirebase extends MicrotaskInFirebase
{
	public long functionID;
	public String promptType;
	public String oldFullDescription;
	public String newFullDescription;


	public WriteFunctionInFirebase()
	{
	}

	public WriteFunctionInFirebase(long id,String title, String type,
			String owningArtifact, Long owningArtifactId, boolean completed, int points,
			long functionID, String promptType,String oldFullDescription,String newFullDescription)
	{
		super(id,title, type, owningArtifact, owningArtifactId, completed, points);

		this.functionID = functionID;
		this.promptType = promptType;
		this.oldFullDescription = oldFullDescription;
		this.newFullDescription = newFullDescription;

	}
}
