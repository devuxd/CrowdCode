package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;

public class TestCasesDTO extends DTO 
{
	public String messageType = "TestCasesDTO";
	public List<String> tests = new ArrayList<String>();
	
	public String toString()
	{
		return tests.toString();
	}
}
