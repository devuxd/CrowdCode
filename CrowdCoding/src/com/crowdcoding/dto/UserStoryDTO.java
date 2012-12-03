package com.crowdcoding.dto;

public class UserStoryDTO extends DTO 
{
	public String messageType = "UserStoryDTO";
	public String text;
	
	public String toString()
	{
		return text;
	}	
}
