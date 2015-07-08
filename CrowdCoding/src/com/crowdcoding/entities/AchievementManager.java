package com.crowdcoding.entities;

//import static com.googlecode.objectify.ObjectifyService.ofy;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Random;
import java.util.Scanner;

import org.apache.tools.ant.Main;

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
public class AchievementManager
{

	private List<Achievement> availableAchievements = new ArrayList<Achievement>();;
	private static int id;
	// Default constructor for deserialization
	public AchievementManager()
	{
		id =  5 + (int)(Math.random()*100); 
		setAchievements();
		System.out.println("my id is "+id);
	}

	private void setAchievements() {	
		Scanner fileIn = null;
			
		try {
			fileIn = new Scanner(new File("WEB-INF/achievements.txt"));
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
		if(fileIn != null){
			int totalAchievements = fileIn.nextInt();
			for(int i = 0;i<totalAchievements;i++){
				Achievement newObjective = new Achievement(fileIn.next(), fileIn.nextInt(), fileIn.nextInt());
				System.out.println(newObjective.getCondition() + " " +  newObjective.getRequirement());
				availableAchievements.add(newObjective);
			}
			fileIn.close();
		}
	}
	
	public void printList(){
		for(int i = 0;i<availableAchievements.size();i++)
			System.out.println(availableAchievements.get(i).getCondition());
	}
	
	public void checkNewAchievement(String workerID, String projectId, HashMap<String,Integer> workerHistory){
		int value = 0;
		for(int i = 0;i<availableAchievements.size();i++){
			String label = availableAchievements.get(i).getCondition();
			if( workerHistory.get(label)!= null){
				value = 0;
				value = workerHistory.get(label);
				//if(value >= availableAchievements.get(i).getRequirement()){
					AwardAchievement(availableAchievements.get(i),workerID,projectId);
					availableAchievements.remove(i)	;
				//}
			}
		}		
	}

	private void AwardAchievement(Achievement workerAchievement, String workerID, String projectId) {
		FirebaseService.writeAchievementNotification(new NotificationInFirebase("new.achievement",workerAchievement.getMessage(), 
				workerAchievement.getCondition(), workerAchievement.getRequirement()), workerID, projectId);
	}

}