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
	public boolean isImplemented;	// does the test currently have a valid implementation?
	public String disputeText;      // only available if the test is in dispute.

	public List<String> simpleTestInputs = new ArrayList<String>();
	public String simpleTestOutput;

	public String description;		// Description of the test case
	public String functionName;		// Name of the function being tested
	public long functionID;		// ID of the function being tested
	public boolean readOnly;
	public boolean isDeleted;
	// Default constructor (required by Jackson JSON library)
	public TestInFirebase()
	{
	}

	public TestInFirebase(long id, int version, String code, boolean hasSimpleTest,
			List<String> simpleTestInputs, String simpleTestOutput, String description,
			String functionName, long functionID, boolean isImplemented, boolean readOnly, boolean isDeleted)
	{
		this.id = id;
		this.version = version;
		this.code = code;
		this.hasSimpleTest = hasSimpleTest;
		this.simpleTestInputs = simpleTestInputs;
		this.simpleTestOutput = simpleTestOutput;
		this.description = description;
		this.functionName = functionName;
		this.functionID = functionID;
		this.isImplemented = isImplemented;
		this.readOnly=readOnly;
		this.isDeleted=isDeleted;
	}
}
