package com.crowdcoding.dto.firebase.notification;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;
import com.crowdcoding.entities.microtasks.Microtask;

public class MicrotaskNotificationInFirebase extends NotificationInFirebase
{
	public String microtaskId;
	public String microtaskType;
	public String artifactName;

	// Default constructor (required by Jackson JSON library)
	public MicrotaskNotificationInFirebase()
	{
	}

	public MicrotaskNotificationInFirebase(String type, String microtaskId, String microtaskType, String artifactName)
	{
		super(type);
		this.microtaskId 	= microtaskId;
		this.microtaskType	= microtaskType;
		this.artifactName 	= artifactName;
	}
}
