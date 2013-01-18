package com.crowdcoding;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import com.crowdcoding.artifacts.Project;
import com.crowdcoding.dto.LeaderboardDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.VoidWork;
import com.googlecode.objectify.annotation.Embed;

@Embed
public class Leaderboard 
{
	private static final int SIZE = 10;	
	private int lowestScore;	// Lowest score of any member of the leaderboard
	private List<Ref<Worker>> leaders = new ArrayList<Ref<Worker>>();
	
	// Default constructor for deserialization
	private Leaderboard()
	{		
	}
	
	// Constructor for initialization
	public Leaderboard(Project project)
	{
		lowestScore = 0;
	}

	// Checks the worker against the leaderboard, adding them and/or updating the score
	// as required.
	public void update(final Worker worker, final Project project)
	{
		if (worker.getScore() > lowestScore)
		{
			// TODO: Since the conditional is not in the transaction, there is a small chance
			// it may no longer be true. Is this ok?
			
			ofy().transact(new VoidWork() {
				public void vrun() 
				{
					List<Worker> leadWorkers = loadLeaders();
					if (!leadWorkers.contains(worker))
						leadWorkers.add(worker);
					Collections.sort(leadWorkers, new Comparator<Worker>()
					{
						public int compare(Worker a, Worker b) 
						{ 
							return a.getScore() - b.getScore();
						}		
					});
					
					// If we exceed the max size, drop the lowest
					if (leadWorkers.size() > SIZE)			
						leadWorkers.remove(leadWorkers.size() - 1);
					
					// Update the lowest score to the last leader
					lowestScore = leadWorkers.get(leadWorkers.size() - 1).getScore();
		
					// Store the leaderboard back
					leaders.clear();
					for (Worker leadWorker : leadWorkers)
						leaders.add(Ref.create(leadWorker.getKey()));
					ofy().save().entity(project).now();
				}
			});
			
			// Build a leaderboard DTO message and send to all clients
			// This cannot be in the transaction, as it uses a query
			Worker.MessageAll(buildDTO());
		}		
	}
	
	// Builds a LeaderboardDTO message for this Leaderboard
	private String buildDTO(List<Worker> leadWorkers)
	{
		LeaderboardDTO dto = new LeaderboardDTO();
		dto.leaders = new ArrayList<LeaderboardDTO.Leader>();
		
		// TODO: should not have null workers here. This test should not be necessary.
		for (Worker worker : leadWorkers)
			if (worker != null)
				dto.leaders.add(new LeaderboardDTO.Leader(worker.getScore(), worker.getHandle()));
		
		ObjectMapper mapper = new ObjectMapper();
	    try {
	    	return mapper.writeValueAsString(dto);
		} catch (IOException e) {
			e.printStackTrace();
		}
	    
	    return "";
	}
	
	// Builds a LeaderboardDTO message for this Leaderboard
	public String buildDTO()
	{
		return buildDTO(loadLeaders());
	}
	
	private List<Worker> loadLeaders()
	{
		ArrayList<Worker> leadWorkers = new ArrayList<Worker>();
		for (Ref<Worker> ref : leaders)			
			leadWorkers.add(ofy().load().ref(ref).get());
		return leadWorkers;
	}
}
