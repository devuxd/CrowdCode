package com.crowdcoding.dto;


// Contains statistics about the current status of a project
public class CurrentStatisticsDTO extends DTO 
{
	public String messageType = "CurrentStatisticsDTO";
	
	public int microtasksCompleted;
	public int linesOfCode;
	public int functionsImplemented;
	
	// Default constructor (required by Jackson JSON library)
	public CurrentStatisticsDTO()
	{		
	}	
	
	// Initialization constructor
	public CurrentStatisticsDTO(int microtasksCompleted, int linesOfCode,
			int functionsImplemented) 
	{
		this.microtasksCompleted = microtasksCompleted;
		this.linesOfCode = linesOfCode;
		this.functionsImplemented = functionsImplemented;
	}

	public String toString()
	{
		return "microtasks completed: " + microtasksCompleted + " lines of code: " + linesOfCode +
				" functions implemented: " + functionsImplemented;
	}
}
