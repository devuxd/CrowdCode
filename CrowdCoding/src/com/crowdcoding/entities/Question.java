package com.crowdcoding.entities;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.commands.MicrotaskCommand;
import com.crowdcoding.commands.ProjectCommand;
import com.crowdcoding.commands.QuestioningCommand;
import com.crowdcoding.commands.WorkerCommand;
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
	private long answersCount;
	private long commentsCount;
	private int version;
	private boolean closed;
	private String title;
	

	public Question(){}

	public Question(String title, String text, List<String> tags, String artifactId, String ownerId, String ownerHandle, String projectId)
	{
		super(text, ownerId, ownerHandle, projectId);
		this.title = title;
		this.tags= tags;
		this.artifactsId.add(artifactId);
		this.subsribersId.add(ownerId);
		this.points        = 3;
		this.answersCount  = 0;
		this.commentsCount = 0;
		this.version       = 0;
		
		ofy().save().entity(this).now();
		
		this.firebasePath= "/questions/" + this.id ;

		save();
		storeVersionToFirebase();
		
		NotificationInFirebase notification = new NotificationInFirebase( "question.added", "{ \"questionId\": \""+this.id+"\", \"title\": \""+this.title+"\" }" );
		ProjectCommand.notifyLoggedInWorkers(notification);
		WorkerCommand.increaseStat(ownerId, "questions", 1);
	}


	public String getTitle() {
		return title;
	}
	
	public void setTitle(String title) {
		this.title = title;
	}
	
	public void setText(String text){
		this.text = text;
	}
	
	public void setTags(List<String> tags){
		this.tags = tags;
	}

	public void addArtifactLink(String artifactId)
	{
		artifactsId.add(artifactId);
		ofy().save().entity(this).now();
		FirebaseService.updateQuestioningLinkedArtifacts(new ArtifactsIdInFirebase(artifactsId), this.firebasePath, projectId);
	}

	public void removeArtifactLink(String artifactId)
	{
		artifactsId.remove(artifactId);
		ofy().save().entity(this).now();
		FirebaseService.updateQuestioningLinkedArtifacts(new ArtifactsIdInFirebase(artifactsId), this.firebasePath, projectId);
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
		if(! subsribersId.contains(workerId)){
			subsribersId.add(workerId);
			ofy().save().entity(this).now();
			FirebaseService.updateQuestioningSubscribers(new SubscribersInFirebase(this.subsribersId), this.firebasePath, projectId);
		}
	}
	
	public void setClosed(boolean closed){
		this.closed = closed;
		ofy().save().entity(this).now();
		storeToFirebase();
	}

	public void incrementAnswers() {
		this.answersCount ++;
	}
	
	public void incrementComments() {
		this.commentsCount ++;
	}

	public long getUpdatedAt() {
		return this.updatedAt;
	}

	public long getAnswers() {
		return this.answersCount;
	}
	
	public long getComments() {
		return this.commentsCount;
	}

	public long getVersion() {
		return this.version;
	}

	public List<String> getTags() {
		return this.tags;
	}

	public void save() {
		this.version++;
		this.updatedAt = System.currentTimeMillis();
		storeToFirebase();
		ofy().save().entity(this).now();
	}
	

	public void storeVersionToFirebase(){
		FirebaseService.writeQuestionVersion(new QuestionInFirebase(
				this.id, 
				this.ownerId, 
				this.ownerHandle, 
				this.title, 
				this.text, 
				this.tags, 
				this.createdAt, 
				this.updatedAt,
				this.score, 
				this.version,
				this.answersCount,
				this.commentsCount,
				this.subsribersId, 
				this.artifactsId, 
				this.closed
			),  
			projectId
		);
	}
	private void storeToFirebase() {
		FirebaseService.writeQuestion(new QuestionInFirebase(
				this.id, 
				this.ownerId, 
				this.ownerHandle, 
				this.title, 
				this.text, 
				this.tags, 
				this.createdAt, 
				this.updatedAt,
				this.score, 
				this.version,
				this.answersCount,
				this.commentsCount,
				this.subsribersId, 
				this.artifactsId, 
				this.closed
			),  
			projectId
		);
	}
	
}
