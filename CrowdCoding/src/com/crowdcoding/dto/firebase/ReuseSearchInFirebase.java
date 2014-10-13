package com.crowdcoding.dto.firebase;

public class ReuseSearchInFirebase extends MicrotaskInFirebase 
{
	public String callDescription;


	public ReuseSearchInFirebase() 
	{
	}

	public ReuseSearchInFirebase(long id, String type,
			String owningArtifact, boolean completed, int points,
			 String callDescription)
	{
		super(id, type, owningArtifact, completed, points);
		
		this.callDescription = callDescription;
		
	}
}
