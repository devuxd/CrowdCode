package com.crowdcoding.entities;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

import sun.security.acl.OwnerImpl;

import com.crowdcoding.commands.ProjectCommand;
import com.crowdcoding.commands.WorkerCommand;
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
	protected List<String> votersId = new ArrayList<String>();
	protected int points = 10;
	protected boolean isReported;
	protected List<String> reportersId = new ArrayList<String>();
	protected String firebasePath;



	// Default constructor for deserialization
	protected Questioning()
	{
	}

	// Constructor for initialization.
	protected Questioning(String text, String ownerId, String projectId)
	{
		this.text	 =text;
		this.ownerId = ownerId;
		this.projectId = projectId;
		this.isReported = false;
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
		if( workerId!=ownerId && ! votersId.contains(workerId))
		{
			votersId.add(workerId);
			ofy().save().entity(this).now();

			WorkerCommand.awardPoints(ownerId, points);
			FirebaseService.updateQuestioningVoters(votersId, firebasePath, workerId);

		}

	}

	public void removeVote(String workerId)
	{
		if( workerId!=ownerId && votersId.contains(workerId))
		{
			votersId.remove(workerId);
			ofy().save().entity(this).now();
			FirebaseService.updateQuestioningVoters(votersId, firebasePath, workerId);
		}
	}


	public void addReport(String workerId)
	{
		if( workerId!=ownerId && ! reportersId.contains(workerId))
		{
			reportersId.add(workerId);
			ofy().save().entity(this).now();

			WorkerCommand.awardPoints(ownerId, points);
			FirebaseService.updateQuestioningReporters(votersId, firebasePath, workerId);

		}

	}

	public void removeReport(String workerId)
	{
		if( workerId!=ownerId && reportersId.contains(workerId))
		{
			reportersId.remove(workerId);
			ofy().save().entity(this).now();
			FirebaseService.updateQuestioningReporters(votersId, firebasePath, workerId);
		}
	}



	// Writes the artifact out to Firebase, publishing the current state of the artifact to all clients.
	public void storeToFirebase(String projectId) { throw new RuntimeException("Must implement storeToFirebase().");  };



}
