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
import com.googlecode.objectify.cmd.Query;

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
	private Worker(String userid, String nickname)
	{
		this.userid = userid;
		this.nickname = nickname;
		this.score = 0;
		this.loggedIn = true;
		ofy().save().entity(this);		
	}
	
	// Finds, or if it does not exist creates, a CrowdUser corresponding to user
	// Preconditions: 
	//                user != null
	public static Worker Create(User user)
	{
		Worker crowdWorker = ofy().load().type(Worker.class).id(user.getUserId()).get();
		if (crowdWorker == null)		
		{
			crowdWorker = new Worker(user.getUserId(), user.getNickname());					
			ofy().save().entity(crowdWorker);
		}
			
		return crowdWorker;
	}
	
	// Finds the specified worker. Returns null if no such worker exists.
	// Preconditions: 
	//                userid != null
	public static Worker Find(String userid)
	{
		return ofy().load().type(Worker.class).id(userid).get();
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
		ofy().save().entity(this);
	}	
	
	public int getScore()
	{
		return score;
	}		
	
	// Adds the specified number of points to the score.
	public void awardPoints(final int points, final Project project)
	{
		final Worker worker = this;
		// Awarding points needs to be atomic. Other requests may be concurrently mutating messages, 
		// and the actions here should not interfere with those.
		
		ofy().transact(new VoidWork() {
			public void vrun() 
			{
				score += points;	
				PointEvent pointEvent = new PointEvent(points, "Empty description", project);
				pointEvents.add(Ref.create(pointEvent.getKey()));
				ofy().save().entity(worker).now();
				
				// Send score update over channel to client.
				ObjectMapper mapper = new ObjectMapper();
			    try {
			    	sendMessage(mapper.writeValueAsString(pointEvent.buildDTO()));
				} catch (IOException e) {
					e.printStackTrace();
				}
			}			
		}); 
			    
	    // Update the leaderboard, if necessary
	    project.getLeaderboard().update(worker, project);		    
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
	public void sendMessage(final String message)
	{
		final Worker worker = this;
		
		// TODO: this should check if the worker is logged in. But first need to reimplement
		// logic to determine when the worker is or is not logged in.
		
		//if (loggedIn)
		//{
		ofy().transact(new VoidWork() {
			public void vrun() 
			{
				messages.add(message);
				ofy().save().entity(worker).now();
			}
		});
		//}
	}
	
	// Sends the specified message to all currently logged in workers
	public static void MessageAll(String message)
	{
		Query<Worker> q = ofy().load().type(Worker.class).filter("loggedIn", true);   
		for (Worker worker : q)		
			worker.sendMessage(message);
	}
	
	// Gets a single JSON String describing all of the messages currently queued for delivery, and
	// deletes them from the queue.
	public String fetchMessages()
	{
		final Worker worker = this;
		
		return ofy().transact(new Work<String>() {
		    public String run() 
		    {
				System.out.println("Fetching messages. Current messages:");
				System.out.println(messages.toString());
				
				MessagesDTO dto = new MessagesDTO(messages);
				String wrappedMessages = "";
				ObjectMapper mapper = new ObjectMapper();
			    try {
			    	wrappedMessages = mapper.writeValueAsString(dto);
			    	messages.clear();
					ofy().save().entity(worker).now();
				} catch (IOException e) {
					e.printStackTrace();
				}
			    
			    return wrappedMessages;		
		    }
		});
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