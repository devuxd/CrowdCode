package com.crowdcoding.dto;


public class ReviewDTO extends DTO
{
	public String messageType = "ReviewDTO";
	
	public String initialSubmittedDTO;	// DTO, in string format, of the microtask under review
	public long microtaskIDReviewed;
	public String reviewText;
	public int qualityScore;
	public int quantityScore;	
}