package com.crowdcoding.dto.firebase.notification;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;
import com.crowdcoding.entities.microtasks.Microtask;

public class NotificationInFirebase extends DTO
{
	public String type;
	public long time;

	// Default constructor (required by Jackson JSON library)
	public NotificationInFirebase()
	{
	}

	public NotificationInFirebase(String type)
	{
		this.type			= type;
		this.time 			= System.currentTimeMillis();
	}
}
