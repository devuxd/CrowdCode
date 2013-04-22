package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;


public class FunctionDTO extends DTO
{
	public String messageType = "FunctionDTO";
	
	public String testCaseNumber;
	public String description;
	public List<String> paramNames = new ArrayList<String>();;
	public String header;
	public String name;	
	public String code = "";
	
	public String toString()
	{
		if(testCaseNumber == null)
		{
			return description + "\n" + header + "\n" + code;
		}
		return description + "\n" + " function " + name + "test case number of function disputed: " + testCaseNumber;
	}
}
