package com.crowdcoding.commands;

import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.servlets.CommandContext;
import com.googlecode.objectify.Key;

public abstract class ProjectCommand extends Command 
{
	
	public static ProjectCommand enableReviews(boolean reviewsEnabled) 
		{ return new EnableReviews(reviewsEnabled); }
	
	// Queues the specified microtask onto the global microtask queue. Provides an optional
	// excludedWorkerID, which will permanently exlucde the worker from doing the microtask.
	// This parameter may be left null.
	public static ProjectCommand queueMicrotask(Key<Microtask> microtaskKey, String excludedWorkerID) 
		{ return new QueueMicrotask(microtaskKey, excludedWorkerID); }
	public static ProjectCommand queueReviewMicrotask(Key<Microtask> microtaskKey, String excludedWorkerID) 
		{ return new QueueReviewMicrotask(microtaskKey, excludedWorkerID); }
	public static ProjectCommand skipMicrotask( String microtaskKey, String workerID) 
		{ return new SkipMicrotask(microtaskKey, workerID); }
	public static ProjectCommand submitMicrotask(String microtaskKey, Class microtaskType, String jsonDTOData, 
			String workerID) 
		{ return new SubmitMicrotask(microtaskKey, microtaskType, jsonDTOData, workerID); }
	public static ProjectCommand logoutWorker(String workerID) 
		{ return new LogoutWorker(workerID); }
	
	public static ProjectCommand logoutInactiveWorkers() 
	{ return new LogoutInactiveWorkers(); }
	
	private ProjectCommand()
	{
		queueCommand(this);
	}	
	
	// All constructors for ProjectCommand MUST call queueCommand by calling the super constructor
	private static void queueCommand(Command command)
	{
		CommandContext.ctx.addCommand(command);
	}
	
	protected static class EnableReviews extends ProjectCommand
	{
		private boolean reviewsEnabled;
		
		public EnableReviews(boolean reviewsEnabled)
		{
			super();
			this.reviewsEnabled = reviewsEnabled;
		}
		
		public void execute(Project project)
		{
			project.enableReviews(reviewsEnabled);
		}		
	}
			
	protected static class QueueMicrotask extends ProjectCommand
	{
		private Key<Microtask> microtaskKey;
		private String excludedWorkerID;
		
		public QueueMicrotask(Key<Microtask> microtaskKey, String excludedWorkerID)
		{
			super();
			this.microtaskKey = microtaskKey;
			this.excludedWorkerID = excludedWorkerID;
		}
		
		public void execute(Project project)
		{
			project.queueMicrotask(microtaskKey, excludedWorkerID);
		}		
	}
	
	protected static class QueueReviewMicrotask extends ProjectCommand
	{
		private Key<Microtask> microtaskKey;
		private String excludedWorkerID;
		
		public QueueReviewMicrotask( Key<Microtask> microtaskKey, String excludedWorkerID)
		{
			super();
			this.microtaskKey = microtaskKey;
			this.excludedWorkerID = excludedWorkerID;
		}
		
		public void execute(Project project)
		{
			project.queueReviewMicrotask(microtaskKey, excludedWorkerID);
		}		
	}
	
	protected static class SkipMicrotask extends ProjectCommand
	{
		private Key<Microtask> microtaskKey;
		private String workerID;
		
		public SkipMicrotask(String microtaskKey, String workerID)
		{
			super();
			this.microtaskKey = Project.StringToMicrotaskKey( microtaskKey );
			this.workerID = workerID;
		}
		
		public void execute(Project project)
		{
			project.skipMicrotask(microtaskKey, workerID, project);
		}		
	}
	
	protected static class SubmitMicrotask extends ProjectCommand
	{
		private Key<Microtask> microtaskKey;
		private Class microtaskType;
		private String jsonDTOData;
		private String workerID;
		
		public SubmitMicrotask(String microtaskKey, Class microtaskType, String jsonDTOData, String workerID)
		{
			super();
			this.microtaskKey = Project.StringToMicrotaskKey( microtaskKey );
			this.microtaskType = microtaskType;
			this.jsonDTOData = jsonDTOData;
			this.workerID = workerID;
		}
		
		public void execute(Project project)
		{
			project.submitMicrotask(microtaskKey, microtaskType, jsonDTOData, workerID, project);
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
	

	protected static class LogoutInactiveWorkers extends ProjectCommand
	{
		private String workerID;
		
		public LogoutInactiveWorkers()
		{
			super();
		}
		
		public void execute(Project project)
		{
			project.logoutInactiveWorkers();
		}		
	}
}
