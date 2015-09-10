package com.crowdcoding.dto.firebase.notification;

public class QuestionNotificationInFirebase extends NotificationInFirebase
{
	public long questionId;
	public String title;

	// Default constructor (required by Jackson JSON library)
	public QuestionNotificationInFirebase()
	{
	}

	public QuestionNotificationInFirebase(String type, long questionId, String title)
	{
		super(type);
		this.questionId 	= questionId;
		this.title	= title;
	}
}
