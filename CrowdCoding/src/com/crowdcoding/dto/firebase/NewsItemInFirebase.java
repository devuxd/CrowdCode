package com.crowdcoding.dto.firebase;

import com.crowdcoding.dto.DTO;

public class NewsItemInFirebase extends DTO 
{
	public String messageType = "NewsItemInFirebase";	
	public int points;
	public String description;
	public String type;			// May be WorkReviewed or SubmittedReview
	public long microtaskID;	// Corresponding microtask for the new item.
	public boolean reviewPassed;

	// Default constructor (required by Jackson JSON library)
	public NewsItemInFirebase()
	{		
		reviewPassed = true;
	}
	
	public NewsItemInFirebase(int points, String description, String type, long microtaskID)
	{
		this.points = points;
		this.description = description;
		this.type = type;
		this.microtaskID = microtaskID;
	}	
	

	public NewsItemInFirebase(int points, String description, String type, long microtaskID, boolean reviewPassed )
	{
		this.points = points;
		this.description = description;
		this.type = type;
		this.microtaskID = microtaskID;
		this.reviewPassed = reviewPassed;
	}

}
