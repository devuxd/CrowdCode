package com.crowdcoding.dto.firebase.questions;

import java.util.LinkedList;
import java.util.List;

import com.crowdcoding.dto.DTO;

public class TagsInFirebase extends DTO
{
	public List<String> tags;

	// Default constructor (required by Jackson JSON library)
	public TagsInFirebase()
	{
	}

	public TagsInFirebase(List< String> tags)
	{
		this.tags = tags;
	}

	public String toString()
	{
		return tags.toString();
	}
}
