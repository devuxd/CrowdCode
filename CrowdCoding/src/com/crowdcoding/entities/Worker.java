package com.crowdcoding.entities;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Scanner;

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

/* Represents a crowd worker.
 *
 */

@Entity
public class Worker
{

	@Parent Key<Project> project;
	private String nickname;
	@Id private String userid;
	private HashMap<String, Integer> microtaskHistory =  new HashMap<String, Integer>();
	private List<Achievement> listOfAchievements = new ArrayList<Achievement>();
	public int score;
	public int level;

	// Default constructor for deserialization
	private Worker()
	{
	}

	// Initialization constructor
	private Worker(String userid, String nickname, Project project)
	{
		this.project = project.getKey();
		this.userid = userid;
		this.nickname = nickname;
		this.score = 0;
		this.level = 1;
		this.listOfAchievements = setAchievements();
		ofy().save().entity(this).now();
		this.storeToFirebase(project.getID());
	}

	// Finds, or if it does not exist creates, a CrowdUser corresponding to user
	// Preconditions:
	//                user != null
	public static Worker Create(User user, Project project)
	{
		Worker worker = ofy().load().key(getKey(project.getKey(), user.getUserId())).now();
		if (worker == null){
			worker = new Worker(user.getUserId(), user.getNickname(), project);
			FirebaseService.setPoints( worker.userid, worker.nickname, worker.score, project.getID());
			FirebaseService.publish();
		}
		return worker;
	}

	public String getUserid() {
		return userid;
	}

	public String getNickname() {
		return nickname;
	}

	// returns all workers in the specified project
	public static List<Worker> allWorkers(Project project)
	{
		return ofy().load().type(Worker.class).ancestor(project).list();
	}

	// Adds the specified number of points to the score.
	public void awardPoints(int points, String projectId)
	{
		score += points;	
		ofy().save().entity(this).now();
		FirebaseService.setPoints(userid, nickname, score, projectId);
	}

	private List<Achievement> setAchievements() {	
		Scanner fileIn = null;
		List<Achievement> achievementList = new ArrayList<Achievement>();
		try {
			fileIn = new Scanner(new File("WEB-INF/achievements.txt"));
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
		if(fileIn != null){
			int totalAchievements = fileIn.nextInt();
			for(int i = 0;i<totalAchievements;i++){
				String condition = fileIn.next();
				int requirement = fileIn.nextInt();
				fileIn.nextLine();
				String title = fileIn.nextLine();
				String message = fileIn.nextLine();
				//fileIn.nextLine();
				Achievement newObjective = new Achievement(condition,requirement ,title, message );
				achievementList.add(newObjective);
			}
			fileIn.close();
		}
		return achievementList;
	}
	
	
	void checkNewAchievement(String label, String projectId){
		int value = 0;
		for(Achievement achievement : listOfAchievements){
			if(achievement.getCondition().equals(label) && !achievement.isUnlocked){
				value = 0;
				value = microtaskHistory.get(label);
				achievement.updateCurrent(value);
				if(value >= achievement.getRequirement() ){
					addAchievement(achievement, projectId);
				}
			}
		}
		if(level < 2){
			if(listOfAchievements.get(0).isUnlocked && listOfAchievements.get(1).isUnlocked){
				FirebaseService.writeLevelUpNotification(new NotificationInFirebase("dashboard",1,level), 
				this.getUserid(), projectId);
				level = 2;
			}				
		}
		ofy().save().entity(this).now();
		this.storeToFirebase(projectId);
	}
	// keep a list of microtasks done by the worker
	public void increaseStat(String label,int amount, String projectId)
	{
		int value = amount;
		if( microtaskHistory.get(label)!= null)
			value = microtaskHistory.get(label)+amount;
		microtaskHistory.put(label, value);
		ofy().save().entity(this).now();
		this.storeToFirebase(projectId);
		checkNewAchievement(label, projectId);
	}

	public Key<Worker> getKey()
	{
		return getKey(project, userid);
	}

	public static Key<Worker> getKey(Key<Project> project, String userid)
	{
		return Key.create(project, Worker.class, userid);
	}
	
	
	public void storeToFirebase(String projectId)
	{
		FirebaseService.writeWorker(new WorkerInFirebase(this.userid, score , level, nickname,listOfAchievements, microtaskHistory), this.userid, projectId);
	}
	
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((userid == null) ? 0 : userid.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (!(obj instanceof Worker))
			return false;
		Worker other = (Worker) obj;
		if (userid == null) {
			if (other.userid != null)
				return false;
		} else if (!userid.equals(other.userid))
			return false;
		return true;
	}
	
	public HashMap<String, Integer> getHistory(){
		return microtaskHistory;
	}
	
	public List<Achievement> getAchievements(){
		return listOfAchievements;
	}
		
	public void addAchievement(Achievement achievement, String projectId) {
		achievement.isUnlocked = true;
		FirebaseService.writeAchievementNotification(new NotificationInFirebase("new.achievement",achievement.getMessage(), 
				achievement.getCondition(), achievement.getRequirement()), this.userid, projectId);	
	}
	


}