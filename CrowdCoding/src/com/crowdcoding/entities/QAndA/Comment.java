package com.crowdcoding.entities.QAndA;

import static com.googlecode.objectify.ObjectifyService.ofy;



import com.crowdcoding.commands.QuestioningCommand;
import com.crowdcoding.dto.firebase.notification.CommentNotificationInFirebase;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.annotation.Subclass;

@Subclass(index=true)
public class Comment extends Questioning
{

	private Long questionId;
	private Long answerId;

	protected Comment(){}

	public Comment(String text, long questionId, long answerId, String ownerId, String ownerHandle, String projectId)
	{
		super(text, ownerId, ownerHandle, projectId);

		this.questionId = questionId;
		this.answerId = answerId;
		this.points = 1;
		ofy().save().entity(this).now();

		this.firebasePath= "/questions/" + questionId + "/answers/"+ answerId +"/comments/" + this.id;
		ofy().save().entity(this).now();

		FirebaseService.writeCommentCreated(new com.crowdcoding.dto.firebase.questions.CommentInFirebase(this.id, this.ownerId, ownerHandle, this.text, this.createdAt, this.score), this.firebasePath, projectId);

		QuestioningCommand.incrementQuestionComments(this.questionId);

		QuestioningCommand.setClosed(this.questionId, false);


		QuestioningCommand.subscribeWorker(this.questionId, ownerId, false);

		CommentNotificationInFirebase notification = new CommentNotificationInFirebase( "comment.added", this.questionId, this.answerId, this.ownerHandle, this.text );
		QuestioningCommand.notifySubscribers(this.questionId, notification, ownerId);
	}

}
