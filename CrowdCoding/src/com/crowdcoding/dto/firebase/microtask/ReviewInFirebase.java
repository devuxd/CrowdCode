package com.crowdcoding.dto.firebase.microtask;

import com.crowdcoding.entities.microtasks.Microtask;
import com.googlecode.objectify.Key;


public class ReviewInFirebase extends MicrotaskInFirebase
{
	public String microtaskKeyUnderReview;
	public long functionID;


	public ReviewInFirebase()
	{
	}

	public ReviewInFirebase(long id, String title, String type, String owningArtifact, Long owningArtifactId, long functionId, boolean completed, boolean canceled, int points,
			 Key<Microtask> microtaskKeyUnderReview)
	{
		super(id,title, type, owningArtifact, owningArtifactId, completed, canceled,  points);
		this.microtaskKeyUnderReview = Microtask.keyToString(microtaskKeyUnderReview);
		this.functionID = functionId;

	}
}
