package com.crowdcoding.commands;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.Worker;
import com.crowdcoding.servlets.ThreadContext;
import com.googlecode.objectify.VoidWork;

public abstract class WorkerCommand extends Command
{
	protected String workerID;

	public static WorkerCommand awardPoints(String workerID, int points)
	{ return new AwardPoints(workerID, points); }
	
	public static WorkerCommand addSubmittedMicrotask(String workerID, String microtaskKey)
	{ return new AddSubmittedMicrotask(workerID, microtaskKey); }
	
	public static WorkerCommand addSkippedMicrotask(String workerID, String microtaskKey)
	{ return new AddSkippedMicrotask(workerID, microtaskKey); }

	public static WorkerCommand increaseStat(String workerID,String label, int increaseAmount)
	{ return new IncreaseStat(workerID, label, increaseAmount); }


	private WorkerCommand(String workerID)
	{
		this.workerID = workerID;
		queueCommand(this);
	}

	// All constructors for WorkerCommand MUST call queueCommand by calling the super constructor
	private static void queueCommand(Command command)
	{
		ThreadContext threadContext = ThreadContext.get();
        threadContext.addCommand(command);
		// CommandContext.ctx.addCommand(command);
	}
	public void execute(String projectId)
	{
		final Project project = Project.Create(projectId);
		final Worker worker = find(workerID, project);
	       	if (worker == null)
	    			System.out.println("errore Cannot execute WorkerCommand. Could not find the worker for WorkerID "
	    						+ workerID+" ("+this.getClass()+")");
	    		else
	    		{
	    			execute(worker, project);
	    		}
	}

	public abstract void execute(Worker worker, Project project);

	// Finds the specified worker. Returns null if no such worker exists.
	// Preconditions:
	//                userid != null
	protected Worker find(String userid, Project project)
	{
		return ofy().load().key(Worker.getKey(project.getKey(), userid)).now();
	}

	protected static class AwardPoints extends WorkerCommand
	{
		private int points;

		public AwardPoints(String workerID, int points)
		{
			super(workerID);
			this.points = points;
		}

		public void execute(Worker worker, Project project)
		{

			worker.awardPoints(points, project.getID());
		}

	}
	
	protected static class AddSubmittedMicrotask extends WorkerCommand
	{
		private String microtaskKey;
		
		public AddSubmittedMicrotask(String workerID, String microtaskKey)
		{
			super(workerID);
			this.microtaskKey = microtaskKey;
		}

		public void execute(Worker worker, Project project)
		{

			worker.addSubmittedMicrotask(microtaskKey, project.getID());
		}

	}
	
	protected static class AddSkippedMicrotask extends WorkerCommand
	{
		private String microtaskKey;

		public AddSkippedMicrotask(String workerID, String microtaskKey)
		{
			super(workerID);
			this.microtaskKey = microtaskKey;
		}

		public void execute(Worker worker, Project project)
		{

			worker.addSkippedMicrotask(microtaskKey, project.getID());
		}

	}

	protected static class IncreaseStat extends WorkerCommand
	{
	//	private String label;
	//	private int increaseAmount;

		public IncreaseStat(String workerID, String label,int increaseAmount)
		{
			super(workerID);
	//		this.label = label;
	//		this.increaseAmount = increaseAmount;
		}

		public void execute(Worker worker, Project project)
		{

			//worker.increaseStat(label,increaseAmount, project);
		}

	}
}
