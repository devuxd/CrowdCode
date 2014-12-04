package com.crowdcoding.dto;


public class ReviewDTO extends DTO
{
	public String messageType = "ReviewDTO";
	
	public String microtaskIDReviewed;
	public String reviewText;
	public String microtaskSubmission;
	public int qualityScore;
}