package com.crowdcoding.dto.firebase.notification;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;
import com.crowdcoding.entities.microtasks.Microtask;

public class AchievementNotificationInFirebase extends NotificationInFirebase
{
	public String message;
	public String condition;
	public int requirement;
	
	// Default constructor (required by Jackson JSON library)
	public AchievementNotificationInFirebase()
	{
	}

	public AchievementNotificationInFirebase(String type, String message, String condition, int requirement)
	{
		super(type);
		
		this.message     = message;
		this.condition   = condition;
		this.requirement = requirement;
	}
}
