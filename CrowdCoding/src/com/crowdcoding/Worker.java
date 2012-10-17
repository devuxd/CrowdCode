package com.crowdcoding;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.microtasks.Microtask;
import com.google.appengine.api.users.User;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Load;

@Entity
public class Worker 
{
	@Load private Ref<Microtask> microtask;
	private String nickname;
	@Id private String userid;
	
	// Default constructor for deserialization
	private Worker()
	{		
	}
	
	// Initialization constructor
	private Worker(String userid, String nickname)
	{
		this.userid = userid;
		this.nickname = nickname;
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
	
	public Microtask getMicrotask()
	{
		if (microtask == null)
			return null;
		else						
			return microtask.get();
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
}
