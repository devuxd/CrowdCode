package com.crowdcoding.dto.firebase.questions;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;
import com.crowdcoding.entities.Question;

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

	public QuestionInFirebase(long id, String ownerId, String ownerHandle, String title, String text, List <String> tags, long createdAt, long updatedAt, int score, int version, long answersCount, long commentsCount, List <String> subsribersId, List <String> artifactsId, boolean closed)
	{
		this.id= id;
		this.ownerId     = ownerId;
		this.ownerHandle = ownerHandle;
		this.title=title;
		this.text=text;
		this.tags=tags;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.answersCount  = answersCount;
		this.commentsCount = commentsCount;
		this.score=score;
		this.subscribersId =  subsribersId;
		this.artifactsId   =  artifactsId;
		this.closed   =  closed;
		this.version = version;
	}
}
