package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;

public class TestDTO extends DTO
{
	public String messageType = "TestDTO";
	public Long functionID ;
	public String functionName  = "";
	public int functionVersion;		// version of the function under test that the worker saw when authoring this test.
	public String code = "";
	public String description = "";
	public boolean hasSimpleTest;	// is there a simple test defined for this test?
	public boolean inDispute;	    // is the test being disputed?
	public boolean isFunctionDispute;	    // is the FUNCTION being disputed?
	public String disputeText;      // only available if the test is in dispute.

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
		this.inDispute = false;
		this.isFunctionDispute = false;
	}
}
