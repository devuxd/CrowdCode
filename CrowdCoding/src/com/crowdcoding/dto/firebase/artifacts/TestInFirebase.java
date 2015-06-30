package com.crowdcoding.dto.firebase.artifacts;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;

public class TestInFirebase extends DTO
{
	public String messageType = "TestInFirebase";

	public long id;
	public int version;
	public String description;		// Description of the test case
	public String code = "";
	public long functionId;		// Id of the function being tested
	public boolean isReadOnly;
	public boolean isApiArtifact;
	public boolean isDeleted;
	public boolean hasEverPassed;
	public double  creationTime;


	// Default constructor (required by Jackson JSON library)
	public TestInFirebase()
	{
	}

	public TestInFirebase(long id, int version, String description, String code, long functionId, boolean hasEverPassed, double creationTime,
			boolean isReadOnly, boolean isApiArtifact, boolean isDeleted)
	{
		this.id 		   = id;
		this.version       = version;
		this.code          = code;
		this.description   = description;
		this.functionId    = functionId;
		this.isDeleted	   = isDeleted;
		this.isReadOnly	   = isReadOnly;
		this.isApiArtifact = isApiArtifact;
	}
}
