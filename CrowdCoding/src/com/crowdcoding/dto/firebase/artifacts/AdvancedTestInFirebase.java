package com.crowdcoding.dto.firebase.artifacts;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;

public class AdvancedTestInFirebase extends DTO
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
	public double  creationTime;
	public boolean isSimple;


	// Default constructor (required by Jackson JSON library)
	public AdvancedTestInFirebase()
	{
	}

	public AdvancedTestInFirebase(long id, int version, String description, String code, long functionId, double creationTime,
			boolean isSimple, boolean isReadOnly, boolean isApiArtifact, boolean isDeleted)
	{
		this.id 		   = id;
		this.version       = version;
		this.code          = code;
		this.description   = description;
		this.functionId    = functionId;
		this.isDeleted	   = isDeleted;
		this.isReadOnly	   = isReadOnly;
		this.isApiArtifact = isApiArtifact;
		this.isSimple      = isSimple;
	}
}
