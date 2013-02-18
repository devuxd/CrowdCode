package com.crowdcoding.dto;

public class MachineUnitTestDTO extends DTO
{
	public String messageType = "MachineUnitTestDTO";
	public int errorTestCase;
	
	public String toString()
	{
		return errorTestCase + "";
	}
	// Default constructor (required by Jackson JSON library)
		public MachineUnitTestDTO()
		{		
		}	

}
