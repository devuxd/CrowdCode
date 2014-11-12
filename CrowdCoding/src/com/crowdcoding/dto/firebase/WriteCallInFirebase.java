package com.crowdcoding.dto.firebase;

public class WriteCallInFirebase extends MicrotaskInFirebase
{
	public long functionID;
	public String calleeFullDescription;
 	public String pseudoCall;

	public WriteCallInFirebase()
	{
	}

	public WriteCallInFirebase(long id, String type,
			String owningArtifact, boolean completed, int points,
			long functionID, String calleeFullDescription, String pseudocall)
	{
		super(id, type, owningArtifact, completed, points);

		this.functionID=functionID;

		this.calleeFullDescription=calleeFullDescription;
		this.pseudoCall=pseudoCall;


	}
}
