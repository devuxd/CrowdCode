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

	public WriteFunctionInFirebase(long id, String type,
			String owningArtifact, boolean completed, int points,
			long functionID, String promptType,String oldFullDescription,String newFullDescription)
	{
		super(id, type, owningArtifact, completed, points);
		
		this.functionID = functionID;
		this.promptType = promptType;
		this.oldFullDescription = oldFullDescription;
		this.newFullDescription = newFullDescription;
		
		System.out.println("write function in firebase");
		
	}
}
