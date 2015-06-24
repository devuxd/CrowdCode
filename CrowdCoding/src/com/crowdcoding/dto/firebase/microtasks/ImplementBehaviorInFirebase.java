package com.crowdcoding.dto.firebase.microtasks;

public class ImplementBehaviorInFirebase extends MicrotaskInFirebase
{
	public String promptType;
	long testId;
	Long calleeId;
	Integer oldCalleeVersion;
	String disputeText;


	public ImplementBehaviorInFirebase()
	{
	}

	public ImplementBehaviorInFirebase(
			long id,
			String title,
			String type,
			String owningArtifact,
			Long owningArtifactId,
			int points,
			long functionId,
			String promptType,
			long testId,
			long calleeId,
			int oldCalleeVersion,
			String disputeText)
	{
		super(id,title, type, owningArtifact, owningArtifactId, points, functionId);

		this.promptType = promptType;

		this.testId			  = testId;
		this.disputeText	  = disputeText;
		if( calleeId!=0 )
			this.calleeId		  = calleeId;
		if( oldCalleeVersion!=0 )
		this.oldCalleeVersion = oldCalleeVersion;

	}
}
