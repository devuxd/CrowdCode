package com.crowdcoding.dto.firebase.artifacts;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;

public class StubInFirebase extends DTO
{
	public String messageType = "StubInFirebase";
	public long id;
	public int version;
	public String inputsKey;
	public String output;
	public boolean isReadOnly;
	public boolean isApiArtifact;
	public boolean isDeleted;
	// Default constructor (required by Jackson JSON library)
	public StubInFirebase()
	{
	}

	public StubInFirebase(long id, int version, String inputsKey, String output, boolean isReadOnly, boolean isApiArtifact, boolean isDeleted)
	{
		this.id 		   = id;
		this.version 	   = version;
		this.inputsKey 	   = inputsKey;
		this.output 	   = output;
		this.isReadOnly    = isReadOnly;
		this.isApiArtifact = isApiArtifact;
		this.isDeleted     = isDeleted;
	}
}
