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
	public long time;
	public int score;
	public List < String > tags= new ArrayList<String>();
	public List < String > votersId= new ArrayList<String>();
	public List < String > reportersId= new ArrayList<String>();
	public List < String > artifactsId= new ArrayList<String>();
	public List < Long >   answersId= new ArrayList<Long>();
	public List < String > subscribersId= new ArrayList<String>();
	
	// Default constructor (required by Jackson JSON library)
	public QuestionInFirebase()
	{
	}

	public QuestionInFirebase(long id, String ownerId, String ownerHandle, String title, String text, List <String> tags, long time, int score, List <String> subsribersId, List <String> artifactsId)
	{
		this.id= id;
		this.ownerId     = ownerId;
		this.ownerHandle = ownerHandle;
		this.title=title;
		this.text=text;
		this.tags=tags;
		this.time=time;
		this.score=score;
		this.subscribersId =  subsribersId;
		this.artifactsId   =  artifactsId;
	}
}
