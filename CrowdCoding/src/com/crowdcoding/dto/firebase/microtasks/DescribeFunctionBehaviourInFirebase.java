package com.crowdcoding.dto.firebase.microtasks;

import java.util.List;

import com.crowdcoding.dto.ajax.microtask.submission.TestDisputedDTO;

public class DescribeFunctionBehaviourInFirebase extends MicrotaskInFirebase
{
	public String promptType;
	public Integer oldFunctionVersion;
	public Integer oldADTVersion;
	public Long ADTId;
	public List<TestDisputedDTO> disputedTests;
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
			List<TestDisputedDTO> disputedTests,
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

		this.disputedTests 	= disputedTests;

		if( calleeId !=0 )
			this.calleeId			= calleeId;

		if( oldCalleeVersion !=0 )
			this.oldCalleeVersion 	= oldCalleeVersion;

	}

}
