package com.crowdcoding.entities;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.commands.MicrotaskCommand;
import com.crowdcoding.commands.ProjectCommand;
import com.crowdcoding.commands.QuestioningCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.DebugDTO;
import com.crowdcoding.dto.TestDTO;
import com.crowdcoding.dto.firebase.ArtifactsIdInFirebase;
import com.crowdcoding.dto.firebase.NotificationInFirebase;
import com.crowdcoding.dto.firebase.QuestionInFirebase;
import com.crowdcoding.dto.firebase.SubscribersInFirebase;
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

	private List<String> artifactsId = new ArrayList<String>();
	private List<String> tags = new ArrayList<String>();
	private boolean closed;
	private String title;

	public String getTitle() {
		return title;
	}

	// Constructor for deserialization
	protected Question()
	{

	}

	public Question(String title, String text, List<String> tags, String artifactId, String ownerId, String ownerHandle, String projectId)
	{
		super(text, ownerId, ownerHandle, projectId);
		this.title = title;
		this.tags= tags;
		this.artifactsId.add(artifactId);
		this.subsribersId.add(ownerId);
		ofy().save().entity(this).now();

		this.firebasePath="/questions/" + this.id;
		ofy().save().entity(this).now();

		storeToFirebase();
		
		NotificationInFirebase notification = new NotificationInFirebase( "question.added", "{ \"questionId\": \""+this.id+"\", \"title\": \""+this.title+"\" }" );
		ProjectCommand.notifyLoggedInWorkers(notification);
	}
	
	public void removeArtifactLink(String artifactId)
	{
		if(artifactsId.remove(artifactId)){
			ofy().save().entity(this).now();
			FirebaseService.updateQuestioningLinkedArtifacts(new ArtifactsIdInFirebase(artifactsId), this.firebasePath, projectId);
		}
	}
	
	public void addArtifactLink(String artifactId)
	{
		if(! artifactsId.contains(artifactId)){
			artifactsId.add(artifactId);
			ofy().save().entity(this).now();
			FirebaseService.updateQuestioningLinkedArtifacts(new ArtifactsIdInFirebase(artifactsId), this.firebasePath, projectId);
		}
	}

	public void unsubscribeWorker(String workerId)
	{
		if(subsribersId.remove(workerId)){
			ofy().save().entity(this).now();
			FirebaseService.updateQuestioningSubscribers(new SubscribersInFirebase(this.subsribersId), this.firebasePath, projectId);
		}
	}
	
	public void subscribeWorker(String workerId)
	{
		if(! artifactsId.contains(workerId)){
			artifactsId.add(workerId);
			ofy().save().entity(this).now();
			FirebaseService.updateQuestioningSubscribers(new SubscribersInFirebase(this.subsribersId), this.firebasePath, projectId);
		}
	}
	
	public void setClosed(boolean closed){
		this.closed = closed;
		ofy().save().entity(this).now();
		FirebaseService.updateQuestioningClosed(this.closed,this.firebasePath,projectId);
	}
	
	
	protected void storeToFirebase() {
		FirebaseService.writeQuestionCreated(new QuestionInFirebase(this.id, this.ownerId, this.ownerHandle, this.title, this.text, this.tags, this.time, this.score, this.subsribersId, this.artifactsId, this.closed), this.firebasePath, projectId);
	}
}
