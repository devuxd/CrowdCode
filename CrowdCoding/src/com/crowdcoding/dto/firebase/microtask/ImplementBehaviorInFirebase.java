package com.crowdcoding.dto.firebase.microtask;

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
		this.calleeId		  = calleeId;
		this.oldCalleeVersion = oldCalleeVersion;

	}
}
