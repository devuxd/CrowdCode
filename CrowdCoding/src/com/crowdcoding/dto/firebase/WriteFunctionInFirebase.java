package com.crowdcoding.dto.firebase;

public class WriteFunctionInFirebase extends MicrotaskInFirebase
{
	public long functionID;
	public String promptType;
	public String oldFullDescription;
	public String newFullDescription;
	public String disputeText;
	public long calleeId;


	public WriteFunctionInFirebase()
	{
	}

	public WriteFunctionInFirebase(long id,String title, String type,
			String owningArtifact, Long owningArtifactId, boolean completed, boolean canceled, int points,
			long functionID, String promptType,
			String oldFullDescription,String newFullDescription, String disputeText, long calleeId)
	{
		super(id,title, type, owningArtifact, owningArtifactId, completed, canceled, points);

		this.functionID = functionID;
		this.promptType = promptType;
		this.oldFullDescription = oldFullDescription;
		this.newFullDescription = newFullDescription;
		this.disputeText=disputeText;
		this.calleeId= calleeId;

	}
}
