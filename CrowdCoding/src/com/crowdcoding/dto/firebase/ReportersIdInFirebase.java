package com.crowdcoding.dto.firebase;

import java.util.LinkedList;
import java.util.List;

import com.crowdcoding.dto.DTO;

public class ReportersIdInFirebase extends DTO
{
	public List<String> reportersId;

	// Default constructor (required by Jackson JSON library)
	public ReportersIdInFirebase()
	{
	}

	public ReportersIdInFirebase(List< String> reportersId)
	{
		this.reportersId = reportersId;
	}

	public String toString()
	{
		return reportersId.toString();
	}
}
