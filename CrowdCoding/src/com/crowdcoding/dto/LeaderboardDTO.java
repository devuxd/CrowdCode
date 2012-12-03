package com.crowdcoding.dto;

import java.util.List;

/* Encapsulates the current state of the leaderboard, including the score of each
 * worker and their identifier.
 */
public class LeaderboardDTO extends DTO 
{
	public String messageType = "LeaderboardDTO";	
	public List<Leader> leaders;
	
	public static class Leader
	{
		public int score;
		public String name;
		
		// Default constructor for derserialization
		private Leader()
		{			
		}
		
		// Initialization constructor
		public Leader(int score, String name)
		{
			this.score = score;
			this.name = name;
		}
	}	
}
