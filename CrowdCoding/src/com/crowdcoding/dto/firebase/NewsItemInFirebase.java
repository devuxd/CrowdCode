package com.crowdcoding.dto.firebase;

import com.crowdcoding.dto.DTO;

public class NewsItemInFirebase extends DTO 
{
	public String messageType = "NewsItemInFirebase";	
	public int points;
	public String description;
	public String type;			// May be WorkReviewed or SubmittedReview
	public String microtaskKey;	// Corresponding microtask for the new item.
	public boolean reviewPassed;

	// Default constructor (required by Jackson JSON library)
	public NewsItemInFirebase()
	{		
		reviewPassed = true;
	}
	
	public NewsItemInFirebase(int points, String description, String type, String microtaskKey)
	{
		this.points = points;
		this.description = description;
		this.type = type;
		this.microtaskKey = microtaskKey;
	}	
	

	public NewsItemInFirebase(int points, String description, String type, String microtaskKey, boolean reviewPassed )
	{
		this.points = points;
		this.description = description;
		this.type = type;
		this.microtaskKey = microtaskKey;
		this.reviewPassed = reviewPassed;
	}

}
