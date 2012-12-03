package com.crowdcoding.dto;

public class PointEventDTO extends DTO 
{
	public String messageType = "PointEventDTO";	
	public int points;
	public String description;

	public PointEventDTO(int points, String description)
	{
		this.points = points;
		this.description = description;
	}	
}
