package com.crowdcoding;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.PointEventDTO;
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
	private Ref<Microtask> microtask;
	private String nickname;
	@Id private String userid;
	private int score;
	@Index private boolean loggedIn;
	
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
		this.loggedIn = true;
		ofy().save().entity(this).now();		
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
	
	// Finds the specified worker. Returns null if no such worker exists.
	// Preconditions: 
	//                userid != null
	public static Worker Find(String userid, Project project)
	{
		return ofy().load().key(getKey(project.getKey(), userid)).get();
	}
		
	public static String StatusReport(Project project)
	{
		StringBuilder output = new StringBuilder();		
		output.append("**** ALL WORKERS ****\n");	
		for (Worker worker : allWorkers(project))
			output.append(worker.toString() + "\n");
		
		return output.toString();
	}
	
	// returns all workers in the specified project
	public static List<Worker> allWorkers(Project project)
	{
		return ofy().load().type(Worker.class).ancestor(project).list();	
	}
	
	public Microtask getMicrotask()
	{
		if (microtask == null)
			return null;
		else
			return ofy().load().ref(microtask).get();
	}
	
	// Sets the active microtask for the worker. May be null if there is no microtask.
	public void setMicrotask(Microtask microtask)
	{
		if (microtask == null)
			this.microtask = null;
		else
			this.microtask = Ref.create(microtask.getKey());
		
		ofy().save().entity(this).now();		
	}	
	
	public int getScore()
	{
		return score;
	}		
	
	// Adds the specified number of points to the score.
	public void awardPoints(int points, String description, Project project)
	{
		score += points;	
		ofy().save().entity(this).now();
		
		FirebaseService.setPoints(userid, score, project);
    	FirebaseService.postToNewsfeed(userid, (new PointEventDTO(points, description)).json(), 
    			project);
			    
	    // Update the leaderboard, if necessary
	    project.getLeaderboard().update(this, project);		    
	}
	
	// Gets the handle (i.e., publicly visible nickname) for the worker.
	public String getHandle()
	{
		return nickname;
	}
	
	public String getUserID()
	{
		return userid;
	}	
	
	public Key<Worker> getKey()
	{
		return getKey(project, userid);
	}
	
	private static Key<Worker> getKey(Key<Project> project, String userid)
	{
		return Key.create(project, Worker.class, userid);
	}
	
	public void login()
	{
		loggedIn = true;
		ofy().save().entity(this).now();
	}
	
	// Sets the worker to be logged out. This deletes all queued messages.
	public void logout(Project project)
	{
		loggedIn = false;
		Microtask microtaskObj = getMicrotask();
		if (microtaskObj != null)
			microtaskObj.skip(this, project);
		ofy().save().entity(this).now();
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
	
	public String toString()
	{
		return nickname + "(" + userid + "): { score: " + score + " loggedIn: " + loggedIn + "}"; 
	}	
}