package com.crowdcoding.dto.firebase;

import java.util.LinkedList;
import java.util.List;

import com.crowdcoding.dto.DTO;

public class QueueInFirebase extends DTO
{
	public String messageType = "QueueInFirebase";

	public List< String> queue;

	// Default constructor (required by Jackson JSON library)
	public QueueInFirebase()
	{
	}

	public QueueInFirebase(LinkedList< String> microtaskQueue)
	{
		this.queue = microtaskQueue;
	}

	public String toString()
	{
		return queue.toString();
	}
}
