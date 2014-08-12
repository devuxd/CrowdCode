package com.crowdcoding.artifacts.commands;

import com.crowdcoding.Project;
import com.crowdcoding.servlets.CommandContext;

public abstract class ProjectCommand extends Command 
{
	// Queues the specified microtask onto the global microtask queue. Provides an optional
	// excludedWorkerID, which will permanently exlucde the worker from doing the microtask.
	// This parameter may be left null.
	public static ProjectCommand queueMicrotask(long microtaskID, String excludedWorkerID) 
		{ return new QueueMicrotask(microtaskID, excludedWorkerID); }
	public static ProjectCommand queueReviewMicrotask(long microtaskID, String excludedWorkerID) 
		{ return new QueueReviewMicrotask(microtaskID, excludedWorkerID); }
	public static ProjectCommand skipMicrotask(long microtaskID, String workerID) 
		{ return new SkipMicrotask(microtaskID, workerID); }
	public static ProjectCommand submitMicrotask(long microtaskID, Class microtaskType, String jsonDTOData, 
			String workerID) 
		{ return new SubmitMicrotask(microtaskID, microtaskType, jsonDTOData, workerID); }
	public static ProjectCommand logoutWorker(String workerID) 
		{ return new LogoutWorker(workerID); }
	
	private ProjectCommand()
	{
		queueCommand(this);
	}	
	
	// All constructors for ProjectCommand MUST call queueCommand by calling the super constructor
	private static void queueCommand(Command command)
	{
		CommandContext.ctx.addCommand(command);
	}
			
	protected static class QueueMicrotask extends ProjectCommand
	{
		private long microtaskID;
		private String excludedWorkerID;
		
		public QueueMicrotask(long microtaskID, String excludedWorkerID)
		{
			super();
			this.microtaskID = microtaskID;
			this.excludedWorkerID = excludedWorkerID;
		}
		
		public void execute(Project project)
		{
			project.queueMicrotask(microtaskID, excludedWorkerID);
		}		
	}
	
	protected static class QueueReviewMicrotask extends ProjectCommand
	{
		private long microtaskID;
		private String excludedWorkerID;
		
		public QueueReviewMicrotask(long microtaskID, String excludedWorkerID)
		{
			super();
			this.microtaskID = microtaskID;
			this.excludedWorkerID = excludedWorkerID;
		}
		
		public void execute(Project project)
		{
			project.queueReviewMicrotask(microtaskID, excludedWorkerID);
		}		
	}
	
	protected static class SkipMicrotask extends ProjectCommand
	{
		private long microtaskID;
		private String workerID;
		
		public SkipMicrotask(long microtaskID, String workerID)
		{
			super();
			this.microtaskID = microtaskID;
			this.workerID = workerID;
		}
		
		public void execute(Project project)
		{
			project.skipMicrotask(microtaskID, workerID, project);
		}		
	}
	
	protected static class SubmitMicrotask extends ProjectCommand
	{
		private long microtaskID;
		private Class microtaskType;
		private String jsonDTOData;
		private String workerID;
		
		public SubmitMicrotask(long microtaskID, Class microtaskType, String jsonDTOData, String workerID)
		{
			super();
			this.microtaskID = microtaskID;
			this.microtaskType = microtaskType;
			this.jsonDTOData = jsonDTOData;
			this.workerID = workerID;
		}
		
		public void execute(Project project)
		{
			project.submitMicrotask(microtaskID, microtaskType, jsonDTOData, workerID, project);
		}		
	}
	
	protected static class LogoutWorker extends ProjectCommand
	{
		private String workerID;
		
		public LogoutWorker(String workerID)
		{
			super();
			this.workerID = workerID;
		}
		
		public void execute(Project project)
		{
			project.logoutWorker(workerID);
		}		
	}
}
