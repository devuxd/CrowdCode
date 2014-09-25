package com.crowdcoding.commands;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.entities.microtasks.Review;
import com.crowdcoding.servlets.CommandContext;
import com.googlecode.objectify.Key;

public abstract class MicrotaskCommand extends Command 
{
	protected long microtaskID;
	
	public static MicrotaskCommand submit(long microtaskID, String jsonDTOData, String workerID) 
		{ return new Submit(microtaskID, jsonDTOData, workerID); }
	public static MicrotaskCommand skip(long microtaskID, String workerID) 
		{ return new Skip(microtaskID, workerID); }
	public static MicrotaskCommand createReview(long microtaskIDToReview, String excludedWorkerID,
			String initiallySubmittedDTO, String workerOfReviewedWork) 
		{ return new CreateReview(microtaskIDToReview, excludedWorkerID, initiallySubmittedDTO, workerOfReviewedWork); }
	// Creates a new copy of the specified microtask, reissuing the new microtask with specified
	// worker excluded from performing it.
	public static MicrotaskCommand reissueMicrotask(long microtaskID, String excludedWorkerID) 
		{ return new ReissueMicrotask(microtaskID, excludedWorkerID); }

	private MicrotaskCommand(long microtaskID)
	{
		this.microtaskID = microtaskID;
		queueCommand(this);
	}	
	
	// All constructors for WorkerCommand MUST call queueCommand by calling the super constructor
	private static void queueCommand(Command command)
	{
		CommandContext.ctx.addCommand(command);
	}
	
	public void execute(Project project)
	{
		Microtask microtask = find(microtaskID, project);
		if (microtask == null)		
			System.out.println("Cannot execute MicrotaskCommand. Could not find the microtask for microtaskID " 
						+ microtaskID);		
		else
		{
			execute(microtask, project);
		}
	}
	
	// Finds the specified microtask. Returns null if no such microtask exists.
	protected Microtask find(long microtaskID, Project project)
	{
		return ofy().load().key(Key.create(project.getKey(), Microtask.class, microtaskID)).get();
	}

	public abstract void execute(Microtask microtask, Project project);
		
	protected static class Submit extends MicrotaskCommand
	{
		private String jsonDTOData;
		private String workerID;
		
		public Submit(long microtaskID, String jsonDTOData, String workerID)
		{
			super(microtaskID);
			this.jsonDTOData = jsonDTOData;
			this.workerID = workerID;
		}
		
		public void execute(Microtask microtask, Project project)
		{
			microtask.submit(jsonDTOData, workerID, project);
		}		
	}
	
	protected static class Skip extends MicrotaskCommand
	{
		private String workerID;
		
		public Skip(long microtaskID, String workerID)
		{
			super(microtaskID);
			this.workerID = workerID;
		}
		
		public void execute(Microtask microtask, Project project)
		{
			microtask.skip(workerID, project);
		}		
	}
	
	protected static class CreateReview extends MicrotaskCommand
	{
		private long microtaskIDToReview;
		private String excludedWorkerID;
		private String initiallySubmittedDTO;
		private String workerOfReviewedWork;
		
		public CreateReview(long microtaskIDToReview, String excludedWorkerID, String initiallySubmittedDTO, 
				String workerOfReviewedWork)
		{
			super(0L);
			this.microtaskIDToReview = microtaskIDToReview;
			this.excludedWorkerID = excludedWorkerID;
			this.initiallySubmittedDTO = initiallySubmittedDTO;
			this.workerOfReviewedWork = workerOfReviewedWork;
		}
		
		// Overrides the default execute as no microtask is to be loaded.
		public void execute(Project project)
		{
			Review review = new Review(microtaskIDToReview, initiallySubmittedDTO, workerOfReviewedWork, project);
			ProjectCommand.queueReviewMicrotask(review.getID(), excludedWorkerID);
		}	
		
		public void execute(Microtask microtask, Project project)
		{
			throw new RuntimeException("This method is not applicable for this class");
			
		}
	}
	
	protected static class ReissueMicrotask extends MicrotaskCommand
	{
		private String excludedWorkerID;
		
		public ReissueMicrotask(long microtaskID, String excludedWorkerID)
		{
			super(microtaskID);
			this.excludedWorkerID = excludedWorkerID;
		}
		
		// Overrides the default execute as no microtask is to be loaded.
		public void execute(Microtask microtask, Project project)
		{
			Microtask newMicrotask = microtask.copy(project);
			ProjectCommand.queueMicrotask(newMicrotask.getID(), excludedWorkerID);
		}	
	}
}
