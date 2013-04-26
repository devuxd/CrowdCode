package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;

public class TestDTO extends DTO 
{
	public String messageType = "TestDTO";
	
	public String code = "";
	public boolean hasSimpleTest;	// is there a simple test defined for this test? 
	
	// If there is a simple test, the following describe it.
	public List<String> simpleTestInputs = new ArrayList<String>();
	public String simpleTestOutput;

	// Default constructor (required by Jackson JSON library)
	public TestDTO()
	{		
	}	
	
	public TestDTO(String code, boolean hasSimpleTest,
			List<String> simpleTestInputs, String simpleTestOutput) 
	{
		this.code = code;
		this.hasSimpleTest = hasSimpleTest;
		this.simpleTestInputs = simpleTestInputs;
		this.simpleTestOutput = simpleTestOutput;
	}
}
