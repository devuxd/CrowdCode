package com.crowdcoding.dto.firebase.questions;

import java.util.LinkedList;
import java.util.List;

import com.crowdcoding.dto.DTO;

public class VotersIdInFirebase extends DTO
{
	public List<String> votersId;

	// Default constructor (required by Jackson JSON library)
	public VotersIdInFirebase()
	{
	}

	public VotersIdInFirebase(List< String> votersId)
	{
		this.votersId = votersId;
	}

	public String toString()
	{
		return votersId.toString();
	}
}
