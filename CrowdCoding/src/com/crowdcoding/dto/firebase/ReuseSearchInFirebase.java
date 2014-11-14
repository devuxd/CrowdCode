package com.crowdcoding.dto.firebase;

public class ReuseSearchInFirebase extends MicrotaskInFirebase
{
	public String callDescription;
	public long functionID;

	public ReuseSearchInFirebase()
	{
	}

	public ReuseSearchInFirebase(long id,String title, String type,
			String owningArtifact, boolean completed, int points,
			 String callDescription, long callerID)
	{
		super(id, title, type, owningArtifact, completed, points);

		this.callDescription = callDescription;
		this.functionID=callerID;
	}
}
