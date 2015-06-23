package com.crowdcoding.entities.questions;

import static com.googlecode.objectify.ObjectifyService.ofy;




import com.crowdcoding.commands.QuestioningCommand;
import com.crowdcoding.dto.firebase.notification.AnswerNotificationInFirebase;
import com.crowdcoding.dto.firebase.questions.AnswerInFirebase;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.annotation.Subclass;

@Subclass(index=true)
public class Answer extends Questioning
{
	private Long questionId;

	public Answer(){}

	public Answer(String text, long questionId, String ownerId, String ownerHandle, String projectId)
	{
		super(text, ownerId, ownerHandle, projectId);

		this.questionId = questionId;
		this.subsribersId.add(ownerId);
		this.points = 2;
		ofy().save().entity(this).now();

		this.firebasePath= "/questions/" + questionId + "/answers/"+ this.id;
		ofy().save().entity(this).now();

		FirebaseService.writeAnswerCreated(new AnswerInFirebase(this.id, this.ownerId, this.ownerHandle, this.text, this.createdAt, this.score), this.firebasePath, projectId);

		QuestioningCommand.setClosed(this.questionId, false);

		QuestioningCommand.incrementQuestionAnswers(this.questionId);

		QuestioningCommand.subscribeWorker(this.questionId, ownerId, false);

		AnswerNotificationInFirebase notification = new AnswerNotificationInFirebase( "answer.added", this.questionId, this.ownerHandle, this.questionId.toString());

		QuestioningCommand.notifySubscribers(this.questionId, notification, ownerId);

	}

}
