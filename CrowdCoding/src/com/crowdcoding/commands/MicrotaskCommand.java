package com.crowdcoding.commands;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.entities.microtasks.Review;
import com.crowdcoding.history.MicrotaskReissued;
import com.crowdcoding.history.MicrotaskSubmitted;
import com.crowdcoding.servlets.CommandContext;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Key;

public abstract class MicrotaskCommand extends Command
{
	private Key<Microtask> microtaskKey;

	public static MicrotaskCommand submit(Key<Microtask> microtaskKey, String jsonDTOData, String workerID, int awardedPoint)
		{ return new Submit(microtaskKey, jsonDTOData, workerID, awardedPoint); }

	public static MicrotaskCommand skip(Key<Microtask> microtaskKey, String workerID)
		{ return new Skip(microtaskKey, workerID); }

	public static MicrotaskCommand createReview(Key<Microtask> microtaskKeyToReview, String excludedWorkerID,
			String initiallySubmittedDTO, String workerOfReviewedWork)
		{ return new CreateReview(microtaskKeyToReview, excludedWorkerID, initiallySubmittedDTO, workerOfReviewedWork); }

	// Creates a new copy of the specified microtask, reissuing the new microtask with specified
	// worker excluded from performing it and save the reference to the reissued microtask.
	public static MicrotaskCommand reissueMicrotask(Key<Microtask> microtaskKey, String excludedWorkerID, int awardedPoint)
		{ return new ReissueMicrotask(microtaskKey, excludedWorkerID, awardedPoint); }

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

	public void execute(String projectId)
	{
		Project project = Project.Create(projectId);
		Microtask microtask = find(microtaskKey);
		if (microtask == null)
			System.out.println("Cannot execute MicrotaskCommand. Could not find the microtask for microtaskID "
						+ microtaskKey);
		else
		{
			execute(microtask, projectId);
		}
	}

	public abstract void execute(Microtask microtask, String projectId);
	
	// Finds the specified microtask. Returns null if no such microtask exists.
	protected Microtask find(Key<Microtask> microtaskKey)
	{
		return ofy().load().key(microtaskKey).get();
	}


	protected static class Submit extends MicrotaskCommand
	{
		private String jsonDTOData;
		private String workerID;
		private int awardedPoint;


		public Submit(Key<Microtask> microtaskKey, String jsonDTOData, String workerID, int awardedPoint)
		{
			super(microtaskKey);
			this.jsonDTOData = jsonDTOData;
			this.workerID = workerID;
			this.awardedPoint= awardedPoint;
		}

		public void execute(Microtask microtask, String projectId)
		{
			WorkerCommand.awardPoints(workerID, awardedPoint);

			microtask.submit(jsonDTOData, workerID, projectId);
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

		public void execute(Microtask microtask, String projectId)
		{
			microtask.skip(workerID, projectId);
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

		public void execute(Microtask microtask, String projectId)
		{
			Review review = new Review(microtaskKeyToReview, initiallySubmittedDTO, workerOfReviewedWork, projectId);
			ProjectCommand.queueReviewMicrotask(review.getKey(), excludedWorkerID);

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
		public void execute(Microtask microtask, String projectId)
		{
			Microtask newMicrotask = microtask.copy(projectId);

			ProjectCommand.queueMicrotask(newMicrotask.getKey(), excludedWorkerID);
		}
	}
	protected static class ReissueMicrotask extends MicrotaskCommand
	{
		private String excludedWorkerID;
		private int awardedPoint;

		public ReissueMicrotask(Key<Microtask> microtaskKey, String excludedWorkerID, int awardedPoint)
		{
			super(microtaskKey);
			this.excludedWorkerID = excludedWorkerID;
			this.awardedPoint = awardedPoint;
		}

		// Overrides the default execute as no microtask is to be loaded.
		public void execute(Microtask microtask, String projectId)
		{
			Microtask newMicrotask = microtask.copy(projectId);
			String microtaskKey = newMicrotask.getKey().toString();
			String reissuedFromMicrotaskKey = microtask.getKey().toString();

			//FirebaseService.

			FirebaseService.writeMicrotaskReissuedFrom(microtaskKey, projectId, reissuedFromMicrotaskKey);

			WorkerCommand.awardPoints( excludedWorkerID ,awardedPoint );

			ProjectCommand.queueMicrotask(newMicrotask.getKey(), excludedWorkerID);
		}
	}
}
