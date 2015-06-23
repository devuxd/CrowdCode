package com.crowdcoding.dto.firebase.artifact;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;

public class StubInFirebase extends DTO
{
	public String messageType = "StubInFirebase";
	public long id;
	public int version;
	public List<String> inputs;
	public String output;
	public boolean isReadOnly;
	public boolean isApiArtifact;
	public boolean isDeleted;
	// Default constructor (required by Jackson JSON library)
	public StubInFirebase()
	{
	}

	public StubInFirebase(long id, int version, List<String> inputs, String output, boolean isReadOnly, boolean isApiArtifact, boolean isDeleted)
	{
		this.id 		   = id;
		this.version 	   = version;
		this.inputs 	   = inputs;
		this.output 	   = output;
		this.isReadOnly    = isReadOnly;
		this.isApiArtifact = isApiArtifact;
		this.isDeleted     = isDeleted;
	}
}
