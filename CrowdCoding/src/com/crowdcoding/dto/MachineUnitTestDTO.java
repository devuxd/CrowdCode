package com.crowdcoding.dto;

import com.googlecode.objectify.annotation.Load;

public class MachineUnitTestDTO extends DTO
{
	public String messageType = "MachineUnitTestDTO";
	@Load public int[] errorTestCase;
	
	// Default constructor (required by Jackson JSON library)
	public MachineUnitTestDTO()
	{		
	}	
	
	public String toString()
	{
		return errorTestCase + "";
	}
}
