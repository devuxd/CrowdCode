package com.crowdcoding.dto.firebase.notification;


public class CommentNotificationInFirebase extends NotificationInFirebase
{
	public long questionId;
	public long answerId;
	public String workerHandle;
	public String text;

	// Default constructor (required by Jackson JSON library)
	public CommentNotificationInFirebase()
	{
	}

	public CommentNotificationInFirebase(String type, long questionId, long answerId, String workerHandle, String text )
	{
		super(type);
		this.questionId 	= questionId;
		this.answerId		= answerId;
		this.workerHandle 	= workerHandle;
		this.text 			= text;
	}
}
