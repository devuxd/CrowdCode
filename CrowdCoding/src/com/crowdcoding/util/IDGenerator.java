package com.crowdcoding.util;

import java.util.HashMap;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Ignore;
import com.googlecode.objectify.annotation.Serialize;

/*
 * Generates unique IDs for instances of a class.
 *
 */

public class IDGenerator
{
	@Serialize private HashMap<String, Long> nextIDs;

	// Default constructor for deserialization
	private IDGenerator()
	{
	}

	// Initialization constructor. Should be called exactly once per lifecycle of a project. Parameter is ignored.
	public IDGenerator(boolean flag)
	{
		nextIDs = new HashMap<String, Long>();
	}

	// Generates a new ID for the object obj. Does not check if obj has already been allocated an id.
	public long generateID(String tag)
	{
		Long id = nextIDs.get(tag);
		if (id == null)
			id = (long) 1;

		nextIDs.put(tag, id + 1);

		System.out.println(nextIDs);

		return id;
	}
}
