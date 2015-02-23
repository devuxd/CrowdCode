package com.crowdcoding.dto.firebase;

import com.crowdcoding.dto.PseudoFunctionDTO;

public class WriteCallInFirebase extends MicrotaskInFirebase
{
	public long functionID;
	public long calleeID;
 	public String pseudoName;

	public WriteCallInFirebase()
	{
	}

	public WriteCallInFirebase(long id,String title, String type,
			String owningArtifact, Long owningArtifactId, boolean completed, boolean canceled, int points,
			long functionID, long calleeID, String pseudoName)
	{
		super(id,title, type, owningArtifact, owningArtifactId, completed, canceled, points);

		this.functionID=functionID;

		this.calleeID=calleeID;
		this.pseudoName=pseudoName;


	}
}
