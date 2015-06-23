package com.crowdcoding.commands;


import static com.googlecode.objectify.ObjectifyService.ofy;



import java.util.HashSet;

import com.crowdcoding.dto.firebase.notification.NotificationInFirebase;
import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.servlets.ThreadContext;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Key;

public abstract class ProjectCommand extends Command
{

	/* PUBLIC METHODS */
	public static ProjectCommand reset(String projectId){
		return new Reset(projectId);
	}
	public static ProjectCommand clear(String projectId){
		return new Clear(projectId);
	}
	public static ProjectCommand construct(String projectId){
		return new Construct(projectId);
	}

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
	public static ProjectCommand queueChallengeReviewMicrotask(Key<Microtask> microtaskKey, String firstExcludedWorkerID, String secondExcludedWorkerID) {
		return new QueueChallengeReviewMicrotask(microtaskKey, firstExcludedWorkerID, secondExcludedWorkerID);
	}

	public static ProjectCommand skipMicrotask( String microtaskKey, String workerID , Boolean disablePoint) {
		return new SkipMicrotask(microtaskKey, workerID, disablePoint);
	}


	public static ProjectCommand submitMicrotask(String microtaskKey, String jsonDTOData, String workerID){
		return new SubmitMicrotask(microtaskKey, jsonDTOData, workerID);
	}

	public static ProjectCommand logoutWorker(String workerID){
		return new LogoutWorker(workerID);
	}

	public static ProjectCommand logoutInactiveWorkers(){
		return new LogoutInactiveWorkers();
	}


	public static ProjectCommand notifyLoggedInWorkers( NotificationInFirebase notification ) {
		return new NotifyLoggedInWorkers( notification );
	}


	/* PROTECTED METHODS */

	// create and queue the command
	private ProjectCommand(){
		queueCommand(this);
	}

	public void execute(final String  projectId)
	{
		Project project = Project.Create(projectId);
	    execute(project);
	}

	public abstract void execute(Project project);

	// all commands MUST call queueCommand
	private static void queueCommand(Command command){
		//ThreadContext threadContext = ThreadContext.get();

       // System.out.println("---->"+threadContext.getUserId());
		ThreadContext threadContext = ThreadContext.get();
        threadContext.addCommand(command);
		//CommandContext.ctx.addCommand(command);
	}
	//reset the project
	protected static class Reset extends ProjectCommand
	{
		private String projectID;
		public Reset(String projectID)
		{
			super();
			this.projectID = projectID;
		}

		public void execute(Project project)
		{
			ProjectCommand.clear(projectID);
			ProjectCommand.construct(projectID);

		}
	}
	//reset the project
	protected static class Clear extends ProjectCommand
	{
		private String projectID;
		public Clear(String projectID)
		{
			super();
			this.projectID = projectID;
		}

		public void execute(Project project)
		{
			Project.Clear(projectID);
		}
	}
	//reset the project
	protected static class Construct extends ProjectCommand
	{
		private String projectID;
		public Construct(String projectID)
		{
			super();
			this.projectID = projectID;
		}

		public void execute(Project project)
		{
			Project.Construct(projectID);
		}
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

	// queue a challenge review microtask in the project
	protected static class QueueChallengeReviewMicrotask extends ProjectCommand
	{
		private Key<Microtask> microtaskKey;
		private String firstExcludedWorkerID;
		private String secondExcludedWorkerID;


		public QueueChallengeReviewMicrotask( Key<Microtask> microtaskKey, String firstExcludedWorkerID, String secondExcludedWorkerID)
		{
			super();
			this.microtaskKey = microtaskKey;
			this.firstExcludedWorkerID = firstExcludedWorkerID;
			this.secondExcludedWorkerID = secondExcludedWorkerID;

		}

		public void execute(Project project)
		{
			project.queueChellengeReviewMicrotask(microtaskKey, firstExcludedWorkerID, secondExcludedWorkerID);
		}
	}

	// skip a microtask
	protected static class SkipMicrotask extends ProjectCommand
	{
		private Key<Microtask> microtaskKey;
		private String workerID;
		private Boolean disablePoint;

		public SkipMicrotask(String microtaskKey, String workerID, Boolean disablePoint)
		{
			super();
			this.microtaskKey = Microtask.stringToKey(microtaskKey) ;
			this.workerID = workerID;
			this.disablePoint = disablePoint;
		}

		public void execute(Project project)
		{
			project.skipMicrotask(microtaskKey, workerID, disablePoint);
		}
	}

	// submit a microtask
	protected static class SubmitMicrotask extends ProjectCommand
	{
		private Key<Microtask> microtaskKey;
		private String jsonDTOData;
		private String workerID;

		public SubmitMicrotask(String microtaskKey, String jsonDTOData, String workerID)
		{
			super();
			this.microtaskKey = Microtask.stringToKey( microtaskKey );
			this.jsonDTOData = jsonDTOData;
			this.workerID = workerID;
		}

		public void execute(Project project)
		{
			project.submitMicrotask(microtaskKey, jsonDTOData, workerID, project);
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
		public LogoutInactiveWorkers()
		{
			super();
		}

		public void execute(Project project)
		{
			project.logoutInactiveWorkers();
		}
	}

	// logout all inactive workers
	protected static class NotifyLoggedInWorkers extends ProjectCommand
	{
		NotificationInFirebase notification;
		public NotifyLoggedInWorkers(NotificationInFirebase notification)
		{
			super();
			this.notification = notification;
		}

		public void execute(Project project)
		{
			HashSet<String> workersId = project.getLoggedInWorkers();
			for( String workerId:workersId ){
				FirebaseService.writeWorkerNotification(notification, workerId, project.getID());
			}
		}
	}
}
