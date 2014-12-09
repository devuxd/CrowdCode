package com.crowdcoding.commands;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.entities.microtasks.Review;
import com.crowdcoding.servlets.CommandContext;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Key;

public abstract class MicrotaskCommand extends Command
{
	private Key<Microtask> microtaskKey;

	public static MicrotaskCommand submit(Key<Microtask> microtaskKey, String jsonDTOData, String workerID)
		{ return new Submit(microtaskKey, jsonDTOData, workerID); }

	public static MicrotaskCommand skip(Key<Microtask> microtaskKey, String workerID)
		{ return new Skip(microtaskKey, workerID); }

	public static MicrotaskCommand createReview(Key<Microtask> microtaskKeyToReview, String excludedWorkerID,
			String initiallySubmittedDTO, String workerOfReviewedWork)
		{ return new CreateReview(microtaskKeyToReview, excludedWorkerID, initiallySubmittedDTO, workerOfReviewedWork); }

	// Creates a new copy of the specified microtask, reissuing the new microtask with specified
	// worker excluded from performing it and save the reference to the reissued microtask.
	public static MicrotaskCommand reissueMicrotask(Key<Microtask> microtaskKey, String excludedWorkerID)
		{ return new ReissueMicrotask(microtaskKey, excludedWorkerID); }

	// Creates a new copy of the specified microtask, reissuing the new microtask with specified
	// worker excluded from performing it.
	public static MicrotaskCommand rejectAndReissueMicrotask(Key<Microtask> microtaskKey, String excludedWorkerID)
		{ return new RejectAndReissueMicrotask(microtaskKey, excludedWorkerID); }

	private MicrotaskCommand( Key<Microtask> microtaskKey )
	{
		this.microtaskKey = microtaskKey;
		queueCommand(this);
	}

	// All constructors for WorkerCommand MUST call queueCommand by calling the super constructor
	private static void queueCommand(Command command)
	{
		CommandContext.ctx.addCommand(command);
	}

	public void execute(Project project)
	{
		Microtask microtask = find(microtaskKey);
		if (microtask == null)
			System.out.println("Cannot execute MicrotaskCommand. Could not find the microtask for microtaskID "
						+ microtaskKey);
		else
		{
			execute(microtask, project);
		}
	}

	// Finds the specified microtask. Returns null if no such microtask exists.
	protected Microtask find(Key<Microtask> microtaskKey)
	{
		return ofy().load().key(microtaskKey).get();
	}

	public abstract void execute(Microtask microtask, Project project);

	protected static class Submit extends MicrotaskCommand
	{
		private String jsonDTOData;
		private String workerID;

		public Submit(Key<Microtask> microtaskKey, String jsonDTOData, String workerID)
		{
			super(microtaskKey);
			this.jsonDTOData = jsonDTOData;
			this.workerID = workerID;
		}

		public void execute(Microtask microtask, Project project)
		{
			WorkerCommand.awardPoints(workerID, microtask.getSubmitValue() );
			
			microtask.submit(jsonDTOData, workerID, project);
		}
	}

	protected static class Skip extends MicrotaskCommand
	{
		private String workerID;

		public Skip(Key<Microtask> microtaskKey, String workerID)
		{
			super(microtaskKey);
			this.workerID = workerID;
		}

		public void execute(Microtask microtask, Project project)
		{
			microtask.skip(workerID, project);
		}
	}

	protected static class CreateReview extends MicrotaskCommand
	{
		private Key<Microtask> microtaskKeyToReview;
		private String excludedWorkerID;
		private String initiallySubmittedDTO;
		private String workerOfReviewedWork;

		public CreateReview(Key<Microtask> microtaskKeyToReview, String excludedWorkerID, String initiallySubmittedDTO, String workerOfReviewedWork)
		{
			super(microtaskKeyToReview);
			this.microtaskKeyToReview = microtaskKeyToReview;
			this.excludedWorkerID = excludedWorkerID;
			this.initiallySubmittedDTO = initiallySubmittedDTO;
			this.workerOfReviewedWork = workerOfReviewedWork;
		}

		// Overrides the default execute as no microtask is to be loaded.
		public void execute(Project project)
		{
			Review review = new Review(microtaskKeyToReview, initiallySubmittedDTO, workerOfReviewedWork, project);
			ProjectCommand.queueReviewMicrotask(review.getKey(), excludedWorkerID);
		}

		public void execute(Microtask microtask, Project project)
		{
			throw new RuntimeException("This method is not applicable for this class");

		}
	}

	protected static class RejectAndReissueMicrotask extends MicrotaskCommand
	{
		private String excludedWorkerID;

		public RejectAndReissueMicrotask(Key<Microtask> microtaskKey, String excludedWorkerID)
		{
			super(microtaskKey);
			this.excludedWorkerID = excludedWorkerID;
		}

		// Overrides the default execute as no microtask is to be loaded.
		public void execute(Microtask microtask, Project project)
		{
			Microtask newMicrotask = microtask.copy(project);

			ProjectCommand.queueMicrotask(newMicrotask.getKey(), excludedWorkerID);
		}
	}
	protected static class ReissueMicrotask extends MicrotaskCommand
	{
		private String excludedWorkerID;

		public ReissueMicrotask(Key<Microtask> microtaskKey, String excludedWorkerID)
		{
			super(microtaskKey);
			this.excludedWorkerID = excludedWorkerID;
		}

		// Overrides the default execute as no microtask is to be loaded.
		public void execute(Microtask microtask, Project project)
		{
			Microtask newMicrotask = microtask.copy(project);
			String microtaskKey = Project.MicrotaskKeyToString(newMicrotask.getKey());
			String reissuedFromMicrotaskKey = Project.MicrotaskKeyToString(microtask.getKey());

			//FirebaseService.

			FirebaseService.writeMicrotaskReissuedFrom(microtaskKey, project, reissuedFromMicrotaskKey);

			WorkerCommand.awardPoints( excludedWorkerID , microtask.getSubmitValue() / 2 );

			ProjectCommand.queueMicrotask(newMicrotask.getKey(), excludedWorkerID);
		}
	}
}
