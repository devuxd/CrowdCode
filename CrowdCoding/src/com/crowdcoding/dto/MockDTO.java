package com.crowdcoding.dto;

import java.util.List;

public class MockDTO extends DTO 
{
	public String messageType = "MockDTO";
	
	public String functionName;
	public List<String> inputs;
	public String expectedOutput;
	public String code;
	
	// Default constructor (required by Jackson JSON library)
	public MockDTO()
	{		
	}
	
	public MockDTO(String functionName, List<String> inputs, String expectedOutput) 
	{
		this.functionName = functionName;
		this.inputs = inputs;
		this.expectedOutput = expectedOutput;
	}

	public String toString()
	{
		return "Mock for " + functionName + "(" + inputs.toString() + ")->" + expectedOutput;
	}
}
