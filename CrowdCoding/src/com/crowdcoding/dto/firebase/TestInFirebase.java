package com.crowdcoding.dto.firebase;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;

public class TestInFirebase extends DTO 
{
	public String messageType = "TestInFirebase";
	
	public long id;
	public int version;
	public String code = "";
	public boolean hasSimpleTest;	// is there a simple test defined for this test? 
	public boolean inDispute;	    // is the test being disputed?
	public String disputeText;      // only available if the test is in dispute.	
	
	public List<String> simpleTestInputs = new ArrayList<String>();
	public String simpleTestOutput;
	
	public String description;		// Description of the test case
	public String functionName;		// Name of the function being tested
	public long functionID;		// ID of the function being tested
	
	// Default constructor (required by Jackson JSON library)
	public TestInFirebase()
	{		
	}	
	
	public TestInFirebase(long id, int version, String code, boolean hasSimpleTest,
			List<String> simpleTestInputs, String simpleTestOutput, String description, 
			String functionName, long functionID) 
	{
		this.id = id;
		this.version = version;
		this.code = code;
		this.hasSimpleTest = hasSimpleTest;
		this.simpleTestInputs = simpleTestInputs;
		this.simpleTestOutput = simpleTestOutput;
		this.inDispute = false;
		this.description = description;
		this.functionName = functionName;
		this.functionID = functionID;
	}
}
