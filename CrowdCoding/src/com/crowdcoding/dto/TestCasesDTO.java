package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.entities.Function;
import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.Test;
import com.googlecode.objectify.Ref;

public class TestCasesDTO extends DTO
{
	public String messageType = "TestCasesDTO";
	public List<TestCaseDTO> testCases = new ArrayList<TestCaseDTO>();
	public int functionVersion;			// Version of the function under test that the worker saw when authoring these test cases.
	public boolean isFunctionDispute;	    // is the FUNCTION being disputed?
	public String disputeText;      // only available if the test is in dispute.

	// Default constructor
	public TestCasesDTO()
	{
	}

	// Builds a corresponding TestCasesDTO from the specified function.
	// Only includes the functions tests that are actual test cases (with a description) and not
	// simply mocks.
	public TestCasesDTO(Function function, Project project)
	{

		this.isFunctionDispute=false;
		//this.disputeText="";
		for (Ref<Test> testRef : function.getTestCases(project))
		{
			Test test = Test.load(testRef);
			if (test.hasDescription())
				testCases.add(new TestCaseDTO(test, functionVersion));
		}
	}

	public String toString()
	{
		return testCases.toString();
	}
}
