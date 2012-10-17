package com.crowdcoding.util;

import java.util.HashMap;

import com.googlecode.objectify.annotation.Embed;
import com.googlecode.objectify.annotation.Ignore;
import com.googlecode.objectify.annotation.Serialize;

/*
 * Generates unique IDs for instances of a class.
 * 
 */
@Embed
public class IDGenerator 
{
	@Ignore public static IDGenerator Instance;
	@Serialize private HashMap<Class, Long> nextIDs;

	// Default constructor for deserialization
	private IDGenerator()
	{		
		// Since this field is not persisted (statics are not persisted), manually rebuild it.
		Instance = this;
	}
	
	// Initialization constructor. Should be called exactly once per lifecycle of a project. Parameter is ignored.
	public IDGenerator(boolean flag)
	{
		nextIDs = new HashMap<Class, Long>();
		Instance = this;
	}
	
	// Generates a new ID for the object obj. Does not check if obj has already been allocated an id.
	public long generateID(Object obj)
	{
		Long id = nextIDs.get(obj.getClass());
		if (id == null)			
			id = (long) 1;		

		nextIDs.put(obj.getClass(), id + 1);
		return id;
	}	
}
