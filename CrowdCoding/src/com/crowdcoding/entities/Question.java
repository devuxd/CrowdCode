package com.crowdcoding.entities;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.commands.MicrotaskCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.DebugDTO;
import com.crowdcoding.dto.TestDTO;
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
public class Question extends Questioning
{

	private boolean isReported;
	private List<String> reportersId = new ArrayList<String>();
	private List<String> subsribersId = new ArrayList<String>();
	private List<String> tags = new ArrayList<String>();
	private String title;

	// Constructor for deserialization
	protected Question()
	{

	}

	public Question(String title, String text, List<String> tags, String ownerId, String projectId)
	{
		super(text, ownerId, projectId);
		this.title = title;
		this.tags= tags;
		ofy().save().entity(this).now();
		this.firebasePath="/questions/" + this.id;
		ofy().save().entity(this).now();
		storeToFirebase();

	}

	protected void storeToFirebase() {
		FirebaseService.writeQuestionCreated(new QuestionInFirebase(this.id, this.ownerId, this.title, this.text, this.tags), this.firebasePath, projectId);
	}
}
