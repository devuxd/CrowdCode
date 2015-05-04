package com.crowdcoding.dto.firebase;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;

public class NotificationInFirebase extends DTO
{
	public String type;
	public String data;
	public long time;

	// Default constructor (required by Jackson JSON library)
	public NotificationInFirebase()
	{
	}

	public NotificationInFirebase(String type,String data)
	{
		this.type = type;
		this.data = data;
		this.time = System.currentTimeMillis();
	}
}
