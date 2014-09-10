package com.crowdcoding;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.firebase.NewsItemInFirebase;
import com.crowdcoding.microtasks.Microtask;
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
 * NOTE: parenting Worker in the project's entity group (like all other entities) was causing
 * a bug where data would be stored but not read out consistently. To fix this bug, worker is
 * not parented under project. It is unclear whether this was a logic bug in our codebase or in 
 * objectify itself. 
 */

@Entity
public class Worker 
{
	@Parent Key<Project> project;
	private String nickname;
	@Id private String userid;
	private int score;
	
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
		ofy().save().entity(this).now();	
		FirebaseService.writeWorker(userid, nickname, project);
	}
	
	// Finds, or if it does not exist creates, a CrowdUser corresponding to user
	// Preconditions: 
	//                user != null
	public static Worker Create(User user, Project project)
	{
		Worker crowdWorker = ofy().load().key(getKey(project.getKey(), user.getUserId())).get();
		if (crowdWorker == null)		
			crowdWorker = new Worker(user.getUserId(), user.getNickname(), project);							
			
		return crowdWorker;
	}
	
	// returns all workers in the specified project
	public static List<Worker> allWorkers(Project project)
	{
		return ofy().load().type(Worker.class).ancestor(project).list();	
	}
		
	// Adds the specified number of points to the score.
	public void awardPoints(int points, Project project)
	{
		score += points;	
		ofy().save().entity(this).now();
		
		FirebaseService.setPoints(userid, nickname, score, project);
	}
	
	public Key<Worker> getKey()
	{
		return getKey(project, userid);
	}
	
	public static Key<Worker> getKey(Key<Project> project, String userid)
	{
		return Key.create(project, Worker.class, userid);
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
	
}