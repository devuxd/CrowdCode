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
	public long time;
	public int score;
	public List < String >tags= new ArrayList<String>();
	public List < Long >votersId= new ArrayList<Long>();
	public List < Long >reportersId= new ArrayList<Long>();
	public List < Long >artifactsId= new ArrayList<Long>();
	public List < Long >answersId= new ArrayList<Long>();
	public List < Long >sunscribersId= new ArrayList<Long>();
	// Default constructor (required by Jackson JSON library)
	public QuestionInFirebase()
	{
	}

	public QuestionInFirebase(long id, String ownerId, String title, String text, List <String> tags, long time, int score)
	{
		this.id= id;
		this.ownerId=ownerId;
		this.title=title;
		this.text=text;
		this.tags=tags;
		this.time=time;
		this.score=score;
	}
}
