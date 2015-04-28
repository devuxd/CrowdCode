package com.crowdcoding.dto.firebase;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;

public class CommentInFirebase extends DTO
{
	public String messageType = "CommentInFirebase";

	public long id;
	public String text;
	public String ownerId;
	public String ownerHandle;
	public int score;
	public List < Long >votersId= new ArrayList<Long>();
	public long time;
	// Default constructor (required by Jackson JSON library)
	public CommentInFirebase()
	{
	}

	public CommentInFirebase(long id, String ownerId, String ownerHandle, String text, long time, int score)
	{
		this.id= id;
		this.ownerId=ownerId;
		this.ownerHandle=ownerHandle;
		this.text=text;
		this.time= time;
		this.score=score;


	}
}
