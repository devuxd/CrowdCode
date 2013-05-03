package com.crowdcoding.dto;

import java.util.List;

public class MockDTO extends DTO 
{
	public String messageType = "MockDTO";
	
	public String functionName;
	public List<String> inputs;
	public String expectedOutput;
	public String code;
	
	public String toString()
	{
		return "Mock for " + functionName + "(" + inputs.toString() + ")->" + expectedOutput;
	}
}
