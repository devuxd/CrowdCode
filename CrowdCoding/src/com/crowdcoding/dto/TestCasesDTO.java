package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Test;
import com.googlecode.objectify.Ref;

public class TestCasesDTO extends DTO 
{
	public String messageType = "TestCasesDTO";
	public List<TestCaseDTO> testCases = new ArrayList<TestCaseDTO>();
	
	// Default constructor
	public TestCasesDTO()
	{		
	}
	
	// Builds a corresponding TestCasesDTO from the specified function.
	// Only includes the functions tests that are actual test cases (with a description) and not 
	// simply mocks.
	public TestCasesDTO(Function function)
	{
		for (Ref<Test> testRef : function.getTestCases())
		{
			Test test = Test.load(testRef);
			if (test.hasDescription())			
				testCases.add(new TestCaseDTO(test));
		}
	}
	
	public String toString()
	{
		return testCases.toString();
	}
}
