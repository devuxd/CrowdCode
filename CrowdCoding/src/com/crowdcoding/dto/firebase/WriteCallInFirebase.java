package com.crowdcoding.dto.firebase;

import com.crowdcoding.dto.PseudoFunctionDTO;

public class WriteCallInFirebase extends MicrotaskInFirebase
{
	public long functionID;
	public String calleeName;
	public String calleeFullDescription;
 	public PseudoFunctionDTO pseudoCall;

	public WriteCallInFirebase()
	{
	}

	public WriteCallInFirebase(long id,String title, String type,
			String owningArtifact, Long owningArtifactId, boolean completed, int points,
			long functionID, String calleeName, String calleeFullDescription, PseudoFunctionDTO pseudoCall)
	{
		super(id,title, type, owningArtifact, owningArtifactId, completed, points);

		this.functionID=functionID;

		this.calleeName=calleeName;
		this.calleeFullDescription=calleeFullDescription;
		this.pseudoCall=pseudoCall;


	}
}
