package com.crowdcoding.dto.firebase;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;

public class NotificationInFirebase extends DTO
{
	public String type;
	public String text;
	public String dataId;
	public long time;

	// Default constructor (required by Jackson JSON library)
	public NotificationInFirebase()
	{
	}

	public NotificationInFirebase(String type,String text,long time)
	{
		this.type = type;
		this.text = text;
		this.time = time;
	}
}
