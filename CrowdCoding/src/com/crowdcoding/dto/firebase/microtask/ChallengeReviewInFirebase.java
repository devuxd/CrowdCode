package com.crowdcoding.dto.firebase.microtask;

import com.crowdcoding.entities.microtasks.Microtask;
import com.googlecode.objectify.Key;


public class ChallengeReviewInFirebase extends MicrotaskInFirebase
{
	public String challengeText;
	public String microtaskKeyUnderChallenge;

	public ChallengeReviewInFirebase()
	{
	}

	public ChallengeReviewInFirebase(long id, String title, String type, String owningArtifact, Long owningArtifactId, long functionId, int points,
			 String challengeText, Key<Microtask> microtaskKeyUnderChallenge)
	{
		super(id,title, type, owningArtifact, owningArtifactId, points, functionId);
		this.microtaskKeyUnderChallenge = Microtask.keyToString(microtaskKeyUnderChallenge);
		this.challengeText = challengeText;

	}
}
