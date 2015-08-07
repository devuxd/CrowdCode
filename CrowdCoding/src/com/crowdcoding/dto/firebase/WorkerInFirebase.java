package com.crowdcoding.dto.firebase;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.crowdcoding.dto.DTO;
import com.crowdcoding.entities.Achievement;
import com.googlecode.objectify.annotation.Id;

public class WorkerInFirebase extends DTO
{
	public String messageType = "WorkerInFirebase";

	private String nickname;
	private String userid;	
	public List<Achievement> listOfAchievements = new ArrayList<Achievement>();
	public HashMap<String,Integer> microtaskHistory = new HashMap<String,Integer>();
	public int score;
	public int level;
	// Default constructor (required by Jackson JSON library)
	public WorkerInFirebase()
	{
	}

	public WorkerInFirebase(String userID, int score, int level, String nickname, List<Achievement> listOfAchievements, HashMap<String,Integer> microtaskHistory )
	{
		this.userid = userID;
		this.nickname = nickname;
		this.score = score;
		this.level = level;
		this.listOfAchievements = listOfAchievements;
		this.microtaskHistory = microtaskHistory;
	}
}
