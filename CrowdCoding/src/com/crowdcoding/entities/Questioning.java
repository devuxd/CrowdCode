package com.crowdcoding.entities;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.sql.Date;
import java.sql.Time;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

import sun.security.acl.OwnerImpl;

import com.crowdcoding.commands.ProjectCommand;
import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.firebase.NotificationInFirebase;
import com.crowdcoding.dto.firebase.ReportersIdInFirebase;
import com.crowdcoding.dto.firebase.VotersIdInFirebase;
import com.crowdcoding.dto.firebase.QueueInFirebase;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
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
	protected long time;
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
		this.time  = System.currentTimeMillis();
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
			//if the worker is in the reporteres list remove from that list
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
			System.out.println("removeVote");
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
		System.out.println("updatre score");
		this.score=votersId.size()-reportersId.size();
		FirebaseService.updateQuestioningScore(score, firebasePath, projectId);
	}


	// Writes the artifact out to Firebase, publishing the current state of the artifact to all clients.
	public void storeToFirebase(String projectId) { throw new RuntimeException("Must implement storeToFirebase().");  }

	public void notifySubscribers(String message, String excludedWorkerId) {
		for(String subscriberId:this.subsribersId){
			if( ! subscriberId.equals(excludedWorkerId) ){
				NotificationInFirebase notification = new NotificationInFirebase(
						"",
						message,
						System.currentTimeMillis()
				);
				// send notification
				FirebaseService.writeNotification(
						notification,
						subscriberId, 
						projectId
				);
			}
		}
	};



}
