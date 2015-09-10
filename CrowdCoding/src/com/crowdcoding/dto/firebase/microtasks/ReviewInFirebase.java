package com.crowdcoding.dto.firebase.microtasks;

import com.crowdcoding.entities.microtasks.Microtask;
import com.googlecode.objectify.Key;


public class ReviewInFirebase extends MicrotaskInFirebase
{
	public String microtaskKeyUnderReview;

	public ReviewInFirebase()
	{
	}

	public ReviewInFirebase(long id, String title, String type, String owningArtifact, Long owningArtifactId, long functionId, int points,
			 Key<Microtask> microtaskKeyUnderReview)
	{
		super(id,title, type, owningArtifact, owningArtifactId,  points, functionId);
		this.microtaskKeyUnderReview = Microtask.keyToString(microtaskKeyUnderReview);

	}
}
