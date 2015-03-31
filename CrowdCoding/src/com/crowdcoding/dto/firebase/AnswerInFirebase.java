package com.crowdcoding.dto.firebase;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;

public class AnswerInFirebase extends DTO
{
	public String messageType = "AnswerInFirebase";

	public long id;
	public String text;
	public String ownerId;
	public List < Long >votersId= new ArrayList<Long>();
	public List < Long >reportersId= new ArrayList<Long>();
	public List < Long >commentsId= new ArrayList<Long>();
	// Default constructor (required by Jackson JSON library)
	public AnswerInFirebase()
	{
	}

	public AnswerInFirebase(long id, String ownerId, String text)
	{
		this.id= id;
		this.ownerId=ownerId;
		this.text=text;
	}
}
