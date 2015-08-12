package com.crowdcoding.dto.firebase.artifacts;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;

public class SimpleTestInFirebase extends DTO
{
	public String messageType = "StubInFirebase";
	public long id;
	public int version;
	public String description;
	public List<String> inputs;
	public String output;
	public boolean isSimple;
	public boolean isReadOnly;
	public boolean isApiArtifact;
	public boolean isDeleted;
	// Default constructor (required by Jackson JSON library)
	public SimpleTestInFirebase()
	{
	}

	public SimpleTestInFirebase(long id, int version, List<String> inputs, String output, String description, boolean isSimple, boolean isReadOnly, boolean isApiArtifact, boolean isDeleted)
	{
		this.id 		   = id;
		this.version 	   = version;
		this.inputs 	   = inputs;
		this.output 	   = output;
		this.description   = description;
		this.isSimple	   = isSimple;
		this.isReadOnly    = isReadOnly;
		this.isApiArtifact = isApiArtifact;
		this.isDeleted     = isDeleted;
	}
}
