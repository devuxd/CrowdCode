package com.crowdcoding.dto.firebase.microtasks;

public class DescribeFunctionBehaviourInFirebase extends MicrotaskInFirebase
{
	public String promptType;
	public Integer oldFunctionVersion;
	public Integer oldADTVersion;
	public Long ADTId;
	public String issueDescription;
	public Long issuedTestId;
	public Long calleeId;
	public Integer oldCalleeVersion;

	public DescribeFunctionBehaviourInFirebase()
	{
	}

	public DescribeFunctionBehaviourInFirebase(
			long id,
			String title,
			String type,
			String owningArtifact,
			Long owningArtifactId,
			int points,
			long testedFunctionId,
			String promptType,
			int oldFunctionVersion,
			int oldADTVersion,
			long ADTId,
			String issueDescription,
			long issuedTestId,
			long calleeId,
			int oldCalleeVersion)
	{
		super(id,title, type, owningArtifact, owningArtifactId, points, testedFunctionId);

		this.promptType       	= promptType;

		if( oldFunctionVersion !=0 )
			this.oldFunctionVersion = oldFunctionVersion;

		if( oldADTVersion !=0 )
			this.oldADTVersion 		= oldADTVersion;

		if( ADTId !=0 )
			this.ADTId 				= ADTId;

		this.issueDescription 	= issueDescription;

		if( issuedTestId !=0 )
			this.issuedTestId 		= issuedTestId;

		if( calleeId !=0 )
			this.calleeId			= calleeId;

		if( oldCalleeVersion !=0 )
			this.oldCalleeVersion 	= oldCalleeVersion;

	}

}
