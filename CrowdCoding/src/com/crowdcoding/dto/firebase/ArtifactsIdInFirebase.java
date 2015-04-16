package com.crowdcoding.dto.firebase;

import java.util.LinkedList;
import java.util.List;

import com.crowdcoding.dto.DTO;

public class ArtifactsIdInFirebase extends DTO
{
	public List<String> artifactsId;

	// Default constructor (required by Jackson JSON library)
	public ArtifactsIdInFirebase()
	{
	}

	public ArtifactsIdInFirebase(List< String> artifactsId)
	{
		this.artifactsId = artifactsId;
	}

	public String toString()
	{
		return artifactsId.toString();
	}
}
