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
	private long answers;
	private long comments;
	private long version;
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
		this.points = 3;
		this.answers  = 0;
		this.comments = 0;
		this.version = 1;
		ofy().save().entity(this).now();

		this.firebasePath="/questions/" + this.id;
		ofy().save().entity(this).now();

		FirebaseService.writeQuestionCreated(new QuestionInFirebase(this.id, this.ownerId, this.ownerHandle, this.title, this.text, this.tags, this.createdAt, this.score, this.subsribersId, this.artifactsId, this.closed), this.firebasePath, projectId);
		
		NotificationInFirebase notification = new NotificationInFirebase( "question.added", "{ \"questionId\": \""+this.id+"\", \"title\": \""+this.title+"\" }" );
		ProjectCommand.notifyLoggedInWorkers(notification);
	}

	public String getTitle() {
		return title;
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
		if( this.closed != closed ){
			this.closed = closed;
			ofy().save().entity(this).now();
			FirebaseService.updateQuestioningClosed(this.closed,this.firebasePath,projectId);
		}
	}

	public void incrementAnswers() {
		this.answers ++;
		this.incrementVersion();
	}
	
	public void incrementComments() {
		this.comments ++;
		this.incrementVersion();
	}

	public void incrementVersion(){
		this.version ++;
		this.updatedAt = System.currentTimeMillis();
		ofy().save().entity(this).now();
		FirebaseService.updateQuestion(this, projectId);
	}
	


	public void addTag(String tag) {
		if( ! this.tags.contains(tag) ){
			this.tags.add( tag );
			ofy().save().entity(this).now();
			FirebaseService.updateQuestionTags(this, projectId);
		}	
	};
	
	
	public void removeTag(String tag) {
		System.out.println(" TAGS "+this.tags.toString() + " contains "+tag+ " ? "+this.tags.contains(tag) );
		if( this.tags.contains(tag) ){
			this.tags.remove( tag );
			ofy().save().entity(this).now();
			FirebaseService.updateQuestionTags(this, projectId);
		}	
	};
	
	public long getUpdatedAt() {
		return this.updatedAt;
	}

	public long getAnswers() {
		return this.answers;
	}
	
	public long getComments() {
		return this.comments;
	}

	public long getVersion() {
		return this.version;
	}

	public List<String> getTags() {
		return this.tags;
	}
}
