package com.crowdcoding.dto.firebase;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;
import com.googlecode.objectify.annotation.Id;

public class WorkerInFirebase extends DTO
{
	public String messageType = "WorkerInFirebase";

	private String nickname;
	private String userid;
	public List<String> SubmittedMicrotasks = new ArrayList<String>();
	public List<String> SkippedMicrotasks = new ArrayList<String>();
	public int score;
	public int level;
	// Default constructor (required by Jackson JSON library)
	public WorkerInFirebase()
	{
	}

	public WorkerInFirebase(String userID, int score, int level, String nickname, List<String> submittedMicrotasks, List<String> skippedMicrotasks)
	{
		this.userid = userID;
		this.nickname = nickname;
		this.score = score;
		this.level = level;
		this.SubmittedMicrotasks = submittedMicrotasks;
		this.SkippedMicrotasks = skippedMicrotasks;
	}
}
