package com.crowdcoding.dto;

public class MachineUnitTestDTO extends DTO
{
	public String messageType = "MachineUnitTestDTO";
	public int errorTestCase;
	
	// Default constructor (required by Jackson JSON library)
	public MachineUnitTestDTO()
	{		
	}	
	
	public String toString()
	{
		return errorTestCase + "";
	}
}
