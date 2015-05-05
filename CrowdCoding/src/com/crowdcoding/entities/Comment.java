package com.crowdcoding.entities;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.commands.MicrotaskCommand;
import com.crowdcoding.commands.QuestioningCommand;
import com.crowdcoding.dto.TestDTO;
import com.crowdcoding.dto.firebase.CommentInFirebase;
import com.crowdcoding.dto.firebase.NotificationInFirebase;
import com.crowdcoding.dto.firebase.QuestionInFirebase;
import com.crowdcoding.dto.firebase.TestInFirebase;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.entities.microtasks.WriteTest;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.history.PropertyChange;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.LoadResult;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Subclass;
import com.googlecode.objectify.annotation.Index;

@Subclass(index=true)
public class Comment extends Questioning
{

	private Long questionId;
	private Long answerId;


	// Constructor for deserialization
	protected Comment()
	{
	}

	public Comment(String text, long questionId, long answerId, String ownerId, String ownerHandle, String projectId)
	{
		super(text, ownerId, ownerHandle, projectId);

		this.questionId = questionId;
		this.answerId = answerId;
		this.points = 1;
		ofy().save().entity(this).now();
		
		this.firebasePath= "/questions/" + questionId + "/answers/"+ answerId +"/comments/" + this.id;
		ofy().save().entity(this).now();
		
		storeToFirebase();
		
		NotificationInFirebase notification = new NotificationInFirebase( "comment.added", "{ \"questionId\": \""+this.questionId+"\", \"answerId\": \""+this.answerId+"\", \"workerHandle\": \""+this.ownerHandle+"\", \"text\": \""+this.text+"\"}"  );
		QuestioningCommand.notifySubscribers(this.answerId, notification, ownerId);
	}

	protected void storeToFirebase() {
		FirebaseService.writeCommentCreated(new CommentInFirebase(this.id, this.ownerId, ownerHandle, this.text, this.time, this.score), this.firebasePath, projectId);
	}
}
