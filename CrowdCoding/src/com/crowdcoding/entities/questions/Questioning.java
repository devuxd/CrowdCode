package com.crowdcoding.entities.questions;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.firebase.notification.NotificationInFirebase;
import com.crowdcoding.dto.firebase.questions.*;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;

/*
 * NOTE: Artifact classes are abstract and SHOULD NOT be instantiated, except for internally inside objectify
 * which needs to instantiate them to register subclasses.
 */

@Entity
public /*abstract*/ class Questioning
{
	@Id protected Long id;
	@Index String projectId;
	protected String text;
	protected String ownerId;
	protected String ownerHandle;
	protected List<String> votersId = new ArrayList<String>();
	protected List<String> removedVotersId = new ArrayList<String>();
	protected int points = 10;
	protected boolean isReported;
	protected List<String> reportersId = new ArrayList<String>();
	protected List<String> subsribersId = new ArrayList<String>();
	protected String firebasePath;
	protected long createdAt;
	protected long updatedAt;
	protected int score;


	// Default constructor for deserialization
	protected Questioning()
	{
	}

	// Constructor for initialization.
	protected Questioning(String text, String ownerId, String ownerHandle, String projectId)
	{
		this.text	     = text;
		this.ownerId     = ownerId;
		this.ownerHandle = ownerHandle;
		this.projectId   = projectId;
		this.isReported  = false;
		this.createdAt   = System.currentTimeMillis();
		this.updatedAt   = System.currentTimeMillis();
		this.score = 0;
	}

	public Key<? extends Questioning> getKey()
	{
		return Key.create(Questioning.class,id);
	}

	// Gets the corresponding key for an questioning based on its id
	public static Key<? extends Questioning> getKey(Long id)
	{
		return Key.create( Questioning.class, id );
	}


	public long getID()
	{
		return id;
	}

	public void addVote(String workerId)
	{
		//checks if the worker that is voting is not the owner of the artifact or already voted
		if( ! workerId.equals(ownerId) && ! votersId.contains(workerId))
		{
			votersId.add(workerId);
			//if the worker is in the reporters list remove from that list
			//because a worker can't at the same time vote + and -
			reportersId.remove(workerId);
			updateScore();
			ofy().save().entity(this).now();
			System.out.println("addVote");

			if(!removedVotersId.contains(workerId))
				WorkerCommand.awardPoints(ownerId, points);

			FirebaseService.updateQuestioningVoters(new VotersIdInFirebase(votersId), firebasePath, projectId);
			FirebaseService.updateQuestioningReporters(new ReportersIdInFirebase(reportersId), firebasePath, projectId);
		}

	}

	public void removeVote(String workerId)
	{
		if( ! workerId.equals(ownerId) && votersId.contains(workerId))
		{
			if(!removedVotersId.contains(workerId))
				removedVotersId.add(workerId);
			votersId.remove(workerId);
			updateScore();
			ofy().save().entity(this).now();
			FirebaseService.updateQuestioningVoters(new VotersIdInFirebase(votersId), firebasePath, projectId);
		}
	}


	public void addReport(String workerId)
	{
		if( ! workerId.equals(ownerId) && ! reportersId.contains(workerId))
		{
			votersId.remove(workerId);
			reportersId.add(workerId);
			updateScore();
			ofy().save().entity(this).now();

			System.out.println("addReport");
			FirebaseService.updateQuestioningVoters(new VotersIdInFirebase(votersId), firebasePath, projectId);
			FirebaseService.updateQuestioningReporters(new ReportersIdInFirebase(reportersId), firebasePath, projectId);
		}
	}

	public void removeReport(String workerId)
	{

		if( ! workerId.equals(ownerId) && reportersId.contains(workerId))
		{
			reportersId.remove(workerId);
			updateScore();
			ofy().save().entity(this).now();
			System.out.println("removeReport");
			FirebaseService.updateQuestioningReporters(new ReportersIdInFirebase(reportersId), firebasePath, projectId);

		}
	}

	private void updateScore()
	{
		this.score = votersId.size() - reportersId.size();
		FirebaseService.updateQuestioningScore(score, firebasePath, projectId);
	}

	public void notifySubscribers(NotificationInFirebase notification, String excludedWorkerId) {
		for(String subscriberId:this.subsribersId){
			if( ! subscriberId.equals(excludedWorkerId) ){
				FirebaseService.writeWorkerNotification( notification, subscriberId, projectId );
			}
		}
	}



}
