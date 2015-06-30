package com.crowdcoding.entities;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.crowdcoding.dto.firebase.NewsItemInFirebase;
import com.crowdcoding.dto.firebase.TestInFirebase;
import com.crowdcoding.dto.firebase.WorkerInFirebase;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.util.FirebaseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.appengine.api.users.User;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;
import com.googlecode.objectify.annotation.Parent;
import com.googlecode.objectify.cmd.Query;

/* Represents a crowd worker.
 *
 */

@Entity
public class Worker
{

	@Parent Key<Project> project;
	private String nickname;
	@Id private String userid;
	private List<String> submittedMicrotasks = new ArrayList<String>();
	private HashMap<String, Integer> microtaskHistory =  new HashMap<String, Integer>();
	private List<String> skippedMicrotasks = new ArrayList<String>();;
	public int score;
	public int level;

	// Default constructor for deserialization
	private Worker()
	{
	}

	// Initialization constructor
	private Worker(String userid, String nickname, Project project)
	{
		this.project = project.getKey();
		this.userid = userid;
		this.nickname = nickname;
		this.score = 0;
		this.level = 2;
		this.submittedMicrotasks = new ArrayList<String>();
		this.microtaskHistory = new HashMap<String, Integer>();
		this.skippedMicrotasks = new ArrayList<String>();
		ofy().save().entity(this).now();
		this.storeToFirebase(project.getID());
	}

	// Finds, or if it does not exist creates, a CrowdUser corresponding to user
	// Preconditions:
	//                user != null
	public static Worker Create(User user, Project project)
	{
		Worker worker = ofy().load().key(getKey(project.getKey(), user.getUserId())).now();
		if (worker == null){
			worker = new Worker(user.getUserId(), user.getNickname(), project);
			FirebaseService.setPoints( worker.userid, worker.nickname, worker.score, project.getID());
			FirebaseService.publish();
		}
		//worker.SubmittedMicrotasks = new ArrayList<String>();
		//worker.SkippedMicrotasks = new ArrayList<String>();
		return worker;
	}

	public String getUserid() {
		return userid;
	}

	public String getNickname() {
		return nickname;
	}

	// returns all workers in the specified project
	public static List<Worker> allWorkers(Project project)
	{
		return ofy().load().type(Worker.class).ancestor(project).list();
	}

	// Adds the specified number of points to the score.
	public void awardPoints(int points, String projectId)
	{
		score += points;		
		level = 2 + score/40;
		ofy().save().entity(this).now();
		this.storeToFirebase(projectId);
		FirebaseService.setPoints(userid, nickname, score, projectId);
	}

	// Update the stat label to the stat value.
	public void increaseStat(String label,int amount, String projectId)
	{
		int value = amount;
		if( microtaskHistory.get(label)!= null)
			value = microtaskHistory.get(label)+amount;
		microtaskHistory.put(label, value);
		ofy().save().entity(this).now();
		this.storeToFirebase(projectId);
	}

	public Key<Worker> getKey()
	{
		return getKey(project, userid);
	}

	public static Key<Worker> getKey(Key<Project> project, String userid)
	{
		return Key.create(project, Worker.class, userid);
	}
	
	
	public void storeToFirebase(String projectId)
	{
		FirebaseService.writeWorker(new WorkerInFirebase(this.userid, score , level, nickname,submittedMicrotasks, skippedMicrotasks, microtaskHistory), this.userid, projectId);
	}
	
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((userid == null) ? 0 : userid.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (!(obj instanceof Worker))
			return false;
		Worker other = (Worker) obj;
		if (userid == null) {
			if (other.userid != null)
				return false;
		} else if (!userid.equals(other.userid))
			return false;
		return true;
	}

	public void addSubmittedMicrotask(String microtaskKey, String projectId) {
		if(!submittedMicrotasks.contains(microtaskKey)){
			submittedMicrotasks.add(microtaskKey);	
		ofy().save().entity(this).now();
		this.storeToFirebase(projectId);
		}
	}
	
	public void addSkippedMicrotask(String microtaskKey, String projectId) {
		if(!skippedMicrotasks.contains(microtaskKey)){
			skippedMicrotasks.add(microtaskKey);	
		ofy().save().entity(this).now();
		this.storeToFirebase(projectId);
		}
	}

}