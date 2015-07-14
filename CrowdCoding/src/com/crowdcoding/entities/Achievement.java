package com.crowdcoding.entities;

//import static com.googlecode.objectify.ObjectifyService.ofy;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.crowdcoding.dto.firebase.NewsItemInFirebase;
import com.crowdcoding.dto.firebase.NotificationInFirebase;
import com.crowdcoding.dto.firebase.TestInFirebase;
import com.crowdcoding.dto.firebase.WorkerInFirebase;
import com.crowdcoding.entities.microtasks.Microtask;
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



//@Entity
public class Achievement
{
    
	//@Id private long id;
	private String condition, message;
	private int requirement;
	private List<String> workersAwarded = new ArrayList<String>();
	// Default constructor for deserialization
	private Achievement()
	{
	}

	// Initialization constructor
	public Achievement(String condition, int requirement)
	{
		this.condition = condition;
		this.requirement = requirement;
		this.message = "You completed "+ this.requirement + " " + this.condition +". Congratulations!!";
		//ofy().save().entity(this).now();
	}


	public String getMessage(){
		return this.message;
	}
	
	public void addWorker(String id){
		this.workersAwarded.add(id);
		//ofy().save().entity(this).now();
	}
	
	public List<String> getList(){
		return this.workersAwarded;
	}
	
	public String getCondition(){
		return this.condition;
	}


	public int getRequirement(){
		return this.requirement;
	}

}