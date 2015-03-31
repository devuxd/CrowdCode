package com.crowdcoding.entities;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.commands.MicrotaskCommand;
import com.crowdcoding.dto.TestDTO;
import com.crowdcoding.dto.firebase.AnswerInFirebase;
import com.crowdcoding.dto.firebase.CommentInFirebase;
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
public class Answer extends Questioning
{
	private long questionId;

	// Constructor for deserialization
	protected Answer()
	{
	}

	public Answer(String text, long questionId, String ownerId,  String projectId)
	{
		super(text, ownerId, projectId);

		this.questionId = questionId;
		ofy().save().entity(this).now();
		this.firebasePath= "/questions/" + questionId + "/answers/"+ this.id;
		ofy().save().entity(this).now();
		storeToFirebase();

	}

	protected void storeToFirebase() {
		FirebaseService.writeAnswerCreated(new AnswerInFirebase(this.id, this.ownerId, this.text), this.firebasePath, projectId);
	}

}
