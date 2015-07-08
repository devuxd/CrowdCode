package com.crowdcoding.dto.firebase;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;
import com.crowdcoding.entities.microtasks.Microtask;

public class NotificationInFirebase extends DTO
{
	public String type;
	public String data;
	public long time;

	// Default constructor (required by Jackson JSON library)
	public NotificationInFirebase()
	{
	}
	
	public NotificationInFirebase(String type, int prev, int current)
	{
		this.type = type;
		this.data = "{ \"prevLevel\": "+prev + ", \"currentLevel\": "+current + "}";
		this.time = System.currentTimeMillis();
	}
	
	public NotificationInFirebase(String type, String message, String condition, int requirement)
	{
		int a = 2, b = 5;
		this.type = type;
		this.data = "{ \"message\": \""+message.toString()+"\",  \"condition\": \""+condition+"\",  \"requirement\": \""+requirement+"\" }";
		this.time = System.currentTimeMillis();
	}
	
	public NotificationInFirebase(String type,String data)
	{
		this.type = type;
		this.data = data;
		this.time = System.currentTimeMillis();
	}
}
