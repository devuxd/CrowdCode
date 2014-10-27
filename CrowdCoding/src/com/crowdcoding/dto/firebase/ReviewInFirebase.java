package com.crowdcoding.dto.firebase;


public class ReviewInFirebase extends MicrotaskInFirebase
{
	public long microtaskIDUnderReview;


	public ReviewInFirebase()
	{
	}

	public ReviewInFirebase(long id, String type, String owningArtifact, boolean completed, int points,
			long microtaskIDUnderReview)
	{
		super(id, type, owningArtifact, completed, points);
		this.microtaskIDUnderReview = microtaskIDUnderReview;

	}
}
