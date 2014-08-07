package com.crowdcoding.artifacts.commands;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.Project;
import com.crowdcoding.Worker;
import com.crowdcoding.servlets.CommandContext;

public abstract class WorkerCommand extends Command 
{
	protected String workerID;
	
	public static WorkerCommand awardPoints(String workerID, int points, String description) 
		{ return new AwardPoints(workerID, points, description); }


	private WorkerCommand(String workerID)
	{
		this.workerID = workerID;
		queueCommand(this);
	}	
	
	// All constructors for WorkerCommand MUST call queueCommand by calling the super constructor
	private static void queueCommand(Command command)
	{
		CommandContext.ctx.addCommand(command);
	}
	
	public void execute(Project project)
	{
		Worker worker = find(workerID, project);
		if (worker == null)		
			System.out.println("Cannot execute WorkerCommand. Could not find the worker for WorkerID " 
						+ workerID);		
		else
		{
			execute(worker, project);
		}
	}
	
	// Finds the specified worker. Returns null if no such worker exists.
	// Preconditions: 
	//                userid != null
	protected Worker find(String userid, Project project)
	{
		return ofy().load().key(Worker.getKey(project.getKey(), userid)).get();
	}

	public abstract void execute(Worker worker, Project project);
		
	protected static class AwardPoints extends WorkerCommand
	{
		private int points;
		private String description;
		
		public AwardPoints(String workerID, int points, String description)
		{
			super(workerID);
			this.workerID = workerID;
			this.points = points;
			this.description = description;
		}
		
		public void execute(Worker worker, Project project)
		{
			worker.awardPoints(points, description, project);
		}		
	}
}
