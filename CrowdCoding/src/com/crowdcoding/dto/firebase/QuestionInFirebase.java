package com.crowdcoding.dto.firebase;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;

public class QuestionInFirebase extends DTO
{
	public String messageType = "QuestionInFirebase";

	public long id;
	public String text;
	public String title;
	public String ownerId;
	public String ownerHandle;
	public long createdAt;
	public long updatedAt;
	public long answersCount;
	public long commentsCount;
	public int score;
	public boolean closed;
	public long version;
	public List < String > tags= new ArrayList<String>();
	public List < String > votersId= new ArrayList<String>();
	public List < String > reportersId= new ArrayList<String>();
	public List < String > artifactsId= new ArrayList<String>();
	public List < Long >   answersId= new ArrayList<Long>();
	public List < String > subscribersId= new ArrayList<String>();
	
	// Default constructor (required by Jackson JSON library)
	public QuestionInFirebase(){}

	public QuestionInFirebase(long id, String ownerId, String ownerHandle, String title, String text, List <String> tags, long time, int score, List <String> subsribersId, List <String> artifactsId, boolean closed)
	{
		this.id= id;
		this.ownerId     = ownerId;
		this.ownerHandle = ownerHandle;
		this.title=title;
		this.text=text;
		this.tags=tags;
		this.createdAt = time;
		this.updatedAt = time;
		this.answersCount  = 0;
		this.commentsCount = 0;
		this.score=score;
		this.subscribersId =  subsribersId;
		this.artifactsId   =  artifactsId;
		this.closed   =  closed;
		this.version = 1;
	}
}
