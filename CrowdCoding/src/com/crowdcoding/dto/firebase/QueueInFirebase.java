package com.crowdcoding.dto.firebase;

import java.util.List;

import com.crowdcoding.dto.DTO;

public class QueueInFirebase extends DTO 
{
	public String messageType = "QueueInFirebase";
	
	public List<Long> queue;	
	
	// Default constructor (required by Jackson JSON library)
	public QueueInFirebase()
	{		
	}

	public QueueInFirebase(List<Long> queue)
	{
		this.queue = queue;
	}
	
	public String toString()
	{
		return queue.toString();
	}
}
