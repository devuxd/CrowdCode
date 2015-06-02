package com.crowdcoding.dto.firebase.microtask;

import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ajax.microtask.submission.ReviewDTO;
import com.crowdcoding.entities.microtasks.Microtask;
import com.googlecode.objectify.Key;


public class ReviewSubmissionInFirebase extends DTO
{
	public int qualityScore;
	public String reviewText;
	public String reviewKey;


	public ReviewSubmissionInFirebase()
	{
	}

	public ReviewSubmissionInFirebase(int qualityScore, String reviewText,Key<Microtask> reviewKey)
	{
		this.qualityScore = qualityScore;
		this.reviewText = reviewText;
		this.reviewKey = Microtask.keyToString(reviewKey);

	}
}
