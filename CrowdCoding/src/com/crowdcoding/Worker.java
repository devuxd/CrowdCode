package com.crowdcoding;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.artifacts.Project;
import com.crowdcoding.dto.MessagesDTO;
import com.crowdcoding.microtasks.Microtask;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.appengine.api.users.User;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.VoidWork;
import com.googlecode.objectify.Work;
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
	private Ref<Microtask> microtask;
	private String nickname;
	@Id private String userid;
	private int score;
	@Index private boolean loggedIn;
	private List<Ref<PointEvent>> pointEvents = new ArrayList<Ref<PointEvent>>();
	private List<String> messages = new ArrayList<String>();
	
	// Default constructor for deserialization
	private Worker()
	{		
	}
	
	// Initialization constructor
	private Worker(String userid, String nickname, Project project)
	{
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
		Worker crowdWorker = ofy().load().key(Key.create(Worker.class, user.getUserId())).get();
		if (crowdWorker == null)		
			crowdWorker = new Worker(user.getUserId(), user.getNickname(), project);							
			
		return crowdWorker;
	}
	
	// Finds the specified worker. Returns null if no such worker exists.
	// Preconditions: 
	//                userid != null
	public static Worker Find(String userid, Project project)
	{
		return ofy().load().key(Key.create(Worker.class, userid)).get();
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
	public void awardPoints(final int points, final Project project)
	{
		score += points;	
		PointEvent pointEvent = new PointEvent(points, "Empty description", project);
		pointEvents.add(Ref.create(pointEvent.getKey()));
		ofy().save().entity(this).now();
		
		// Send score update over channel to client.
		ObjectMapper mapper = new ObjectMapper();
	    try {
	    	sendMessage(mapper.writeValueAsString(pointEvent.buildDTO()));
		} catch (IOException e) {
			e.printStackTrace();
		}
			    
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
		return Key.create(Worker.class, userid);
	}
	
	public void login()
	{
		loggedIn = true;
		ofy().save().entity(this).now();
	}
	
	// Sets the worker to be logged out. This deletes all queued messages.
	public void logout()
	{
		loggedIn = false;
		messages.clear();
		Microtask microtaskObj = getMicrotask();
		if (microtaskObj != null)
			microtaskObj.unassign(this);
		ofy().save().entity(this).now();
	}
	
	// Sends the worker's client a message if their client is logged in. If the worker is not logged
	// in, the message is dropped (nothing is done)
	public void sendMessage(String message)
	{
		// TODO: this should check if the worker is logged in. But first need to reimplement
		// logic to determine when the worker is or is not logged in.
		
		//if (loggedIn)
		//{

		messages.add(message);
		ofy().save().entity(this).now();
		//}
	}
	
	// Sends the specified message to all currently logged in workers
	public static void MessageAll(String message, Project project)
	{
		// TODO: this might eventually need to be in a transaction. But cannot be at the moment,
		// as each worker is in their own entity group and thus there is no way to get all
		// workers through a query.
		// Other way to design this would be to have the worker poll for messages centrally rather than 
		// pushed (e.g., a central message queue everyone sees).
		
		/*Query<Worker> q = ofy().load().type(Worker.class).ancestor(WorkerParent.getKey()).filter("loggedIn", true);   
		for (Worker worker : q)		
		{
			worker.sendMessage(message);
		}*/
	}
	
	// Gets a single JSON String describing all of the messages currently queued for delivery, and
	// deletes them from the queue.
	public String fetchMessages()
	{
		System.out.println("Fetching messages. Current messages:");
		System.out.println(messages.toString());
		
		MessagesDTO dto = new MessagesDTO(messages);
		String wrappedMessages = "";
		ObjectMapper mapper = new ObjectMapper();
	    try {
	    	wrappedMessages = mapper.writeValueAsString(dto);
	    	messages.clear();
			ofy().save().entity(this).now();
		} catch (IOException e) {
			e.printStackTrace();
		}
	    
	    return wrappedMessages;		
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
		return userid + ": { score: " + score + " loggedIn: " + loggedIn + "}"; 
	}
	
}