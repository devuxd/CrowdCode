package com.crowdcoding.dto.firebase;

import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.microtasks.Microtask;
import com.googlecode.objectify.Key;


public class ReviewInFirebase extends MicrotaskInFirebase
{
	public String microtaskKeyUnderReview;


	public ReviewInFirebase()
	{
	}

	public ReviewInFirebase(long id, String title, String type, String owningArtifact, boolean completed, int points,
			Key<Microtask> microtaskKeyUnderReview)
	{
		super(id,title, type, owningArtifact, completed, points);
		this.microtaskKeyUnderReview = Project.MicrotaskKeyToString( microtaskKeyUnderReview );

	}
}
