package com.crowdcoding;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;

@Entity
public class WorkerParent 
{
	private static final long ID = 1L;
	
	@Id private long id = ID ;
	
	// Default constructor for deserialization only
	private WorkerParent()
	{
	}
	
	// Initial creation constructor
	public WorkerParent(boolean flag)
	{
		ofy().save().entity(this).now();
	}
	
	public static Key<WorkerParent> getKey()
	{
		return Key.create(WorkerParent.class, ID);
	}
}
