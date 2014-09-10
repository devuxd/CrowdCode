package com.crowdcoding.dto;


public class ReviewDTO extends DTO
{
	public String messageType = "ReviewDTO";
	
	public long microtaskIDReviewed;
	public String reviewText;
	public int qualityScore;
}