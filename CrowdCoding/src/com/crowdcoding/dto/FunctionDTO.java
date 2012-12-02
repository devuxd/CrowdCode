package com.crowdcoding.dto;


public class FunctionDTO extends MicrotaskDTO
{
	public String code = "";
	public String testCaseNumber;
	public String description;
	public String name;
	
	public String toString()
	{
		if(testCaseNumber == null)
		{
			return code;
		}
		return description + "\n" + " function " + name + "test case number of function disputed: " + testCaseNumber;
	}
}
