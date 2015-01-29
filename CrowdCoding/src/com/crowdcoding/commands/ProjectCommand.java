package com.crowdcoding.commands;

import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.Function;
import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.servlets.CommandContext;
import com.googlecode.objectify.Key;

public abstract class ProjectCommand extends Command
{

	/* PUBLIC METHODS */ 
	public static ProjectCommand enableReviews(boolean reviewsEnabled){ 
		return new EnableReviews(reviewsEnabled); 
	}

	public static ProjectCommand enableTutorials(boolean tutorialsEnabled){ 
		return new EnableTutorials(tutorialsEnabled); 
	}
	
	public static ProjectCommand queueMicrotask(Key<Microtask> microtaskKey, String excludedWorkerID) { 
		return new QueueMicrotask(microtaskKey, excludedWorkerID); 
	}
	
	public static ProjectCommand queueReviewMicrotask(Key<Microtask> microtaskKey, String excludedWorkerID) { 
		return new QueueReviewMicrotask(microtaskKey, excludedWorkerID); 
	}
	
	public static ProjectCommand skipMicrotask( String microtaskKey, String workerID) { 
		return new SkipMicrotask(microtaskKey, workerID); 
	}
	
	public static ProjectCommand submitMicrotask(String microtaskKey, Class microtaskType, String jsonDTOData, String workerID){ 
		return new SubmitMicrotask(microtaskKey, microtaskType, jsonDTOData, workerID); 
	}
	
	public static ProjectCommand logoutWorker(String workerID){ 
		return new LogoutWorker(workerID); 
	}
	
	public static ProjectCommand logoutInactiveWorkers(){ 
		return new LogoutInactiveWorkers(); 
	}
	
	
	/* PROTECTED METHODS */
	
	// create and queue the command
	private ProjectCommand(){
		queueCommand(this);
	}
	
	public void execute(String  projectId)
	{
		Project project = Project.Create(projectId);
		execute(project);
	}
	
	public abstract void execute(Project project);
	
	// all commands MUST call queueCommand
	private static void queueCommand(Command command){
		CommandContext.ctx.addCommand(command);
	}

	// enable the reviews 
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
	
	// enable the reviews 
	protected static class EnableTutorials extends ProjectCommand
	{
		private boolean tutorialsEnabled;

		public EnableTutorials(boolean tutorialsEnabled)
		{
			super();
			this.tutorialsEnabled = tutorialsEnabled;
		}

		public void execute(Project project)
		{
			project.enableTutorials(tutorialsEnabled);
		}
	}

	// queue a microtask in the project
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

	// queue a review microtask in the project
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

	// skip a microtask
	protected static class SkipMicrotask extends ProjectCommand
	{
		private Key<Microtask> microtaskKey;
		private String workerID;

		public SkipMicrotask(String microtaskKey, String workerID)
		{
			super();
			this.microtaskKey = Microtask.stringToKey(microtaskKey) ;
			this.workerID = workerID;
		}

		public void execute(Project project)
		{
			project.skipMicrotask(microtaskKey, workerID, project);
		}
	}

	// submit a microtask
	protected static class SubmitMicrotask extends ProjectCommand
	{
		private Key<Microtask> microtaskKey;
		private Class microtaskType;
		private String jsonDTOData;
		private String workerID;

		public SubmitMicrotask(String microtaskKey, Class microtaskType, String jsonDTOData, String workerID)
		{
			super();
			this.microtaskKey = Microtask.stringToKey( microtaskKey );
			this.microtaskType = microtaskType;
			this.jsonDTOData = jsonDTOData;
			this.workerID = workerID;
		}

		public void execute(Project project)
		{
			System.out.println("Executing submit with key "+microtaskKey);
			project.submitMicrotask(microtaskKey, microtaskType, jsonDTOData, workerID, project);
		}
	}

	// logout a worker
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

	// logout all inactive workers
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
