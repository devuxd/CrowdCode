package com.crowdcoding.dto.firebase.questions;

import java.util.LinkedList;
import java.util.List;

import com.crowdcoding.dto.DTO;

public class SubscribersInFirebase extends DTO
{
	public List<String> subscribersId;

	// Default constructor (required by Jackson JSON library)
	public SubscribersInFirebase()
	{
	}

	public SubscribersInFirebase(List< String> subscriberId)
	{
		this.subscribersId = subscriberId;
	}

	public String toString()
	{
		return subscribersId.toString();
	}
}
