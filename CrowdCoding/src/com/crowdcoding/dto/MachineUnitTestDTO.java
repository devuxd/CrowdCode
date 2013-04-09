package com.crowdcoding.dto;


public class MachineUnitTestDTO extends DTO
{
	public String messageType = "MachineUnitTestDTO";
	public int[] failingTestCases;
	public int[] passingTestCases;
	
	// Default constructor (required by Jackson JSON library)
	public MachineUnitTestDTO()
	{		
	}	
	
	public String toString()
	{
		return "Passing tests:" + passingTestCases + " Failing tests: " + failingTestCases;
	}
}
