package com.crowdcoding.dto.firebase;

import com.crowdcoding.dto.DTO;

public class NewsItemInFirebase extends DTO
{
	public String messageType = "NewsItemInFirebase";
	public int awardedPoints;
	public int maxPoints;
	public String microtaskType; // May be WorkReviewed or SubmittedReview
	public String type;			 // May be WorkReviewed or SubmittedReview
	public String microtaskKey;	// Corresponding microtask for the new item.
	public String timeInMillis;
	public int score;
	public String challengeStatus;
	public boolean canBeChallenged;

	// Default constructor (required by Jackson JSON library)
	public NewsItemInFirebase()
	{

	}

	public NewsItemInFirebase(int awardedPoints, int maxPoints, String microtaskType, String type, String microtaskKey, int score, String challengeStatus, boolean canBeChallenged )
	{
		this.awardedPoints		= awardedPoints;
		this.maxPoints 			= maxPoints;
		this.microtaskType 		= microtaskType;
		this.type 				= type;
		this.microtaskKey 		= microtaskKey;
		this.score 				= score;
		this.challengeStatus	= challengeStatus;
		this.canBeChallenged	= canBeChallenged;
		this.timeInMillis 		= Long.toString(System.currentTimeMillis());
	}

}
