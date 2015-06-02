package com.crowdcoding.dto.firebase.notification;

public class AnswerNotificationInFirebase extends NotificationInFirebase
{
	public long questionId;
	public String workerHandle;
	public String text;

	// Default constructor (required by Jackson JSON library)
	public AnswerNotificationInFirebase()
	{
	}

	public AnswerNotificationInFirebase(String type, long questionId, String workerHandle, String text)
	{
		super(type);
		this.questionId 	= questionId;
		this.workerHandle	= workerHandle;
		this.text 			= text;
	}
}
