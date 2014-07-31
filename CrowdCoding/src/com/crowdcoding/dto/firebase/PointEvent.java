package com.crowdcoding.dto.firebase;

import com.crowdcoding.dto.DTO;

public class PointEvent extends DTO 
{
	public String messageType = "PointEventDTO";	
	public int points;
	public String description;

	// Default constructor (required by Jackson JSON library)
	public PointEvent()
	{		
	}
	
	public PointEvent(int points, String description)
	{
		this.points = points;
		this.description = description;
	}	
}
