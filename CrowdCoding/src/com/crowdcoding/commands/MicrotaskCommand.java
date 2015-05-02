package com.crowdcoding.commands;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.entities.microtasks.Review;
import com.crowdcoding.servlets.CommandContext;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.VoidWork;

public abstract class MicrotaskCommand extends Command
{
	private Key<Microtask> microtaskKey;

	public static MicrotaskCommand submit(Key<Microtask> microtaskKey, String jsonDTOData, String workerID, int awardedPoint)
		{ return new Submit(microtaskKey, jsonDTOData, workerID, awardedPoint); }

	public static MicrotaskCommand skip(Key<Microtask> microtaskKey, String workerID, boolean disablePoint)
		{ return new Skip(microtaskKey, workerID, disablePoint); }

	public static MicrotaskCommand createReview(Key<Microtask> microtaskKeyToReview, String excludedWorkerID,
			String initiallySubmittedDTO, String workerOfReviewedWork)
		{ return new CreateReview(microtaskKeyToReview, excludedWorkerID, initiallySubmittedDTO, workerOfReviewedWork); }

	// Creates a new copy of the specified microtask, reissuing the new microtask with specified
	// worker excluded from performing it and save the reference to the reissued microtask.
	public static MicrotaskCommand reviseMicrotask(Key<Microtask> microtaskKey, String jsonDTOData, String reissueMotivation, String excludedWorkerID, int awardedPoint)
		{ return new ReviseMicrotask(microtaskKey, jsonDTOData, reissueMotivation, excludedWorkerID, awardedPoint); }

	// Creates a new copy of the specified microtask, reissuing the new microtask with specified
	// worker excluded from performing it.
	public static MicrotaskCommand rejectMicrotask(Key<Microtask> microtaskKey, String excludedWorkerID, int awardedPoint)
		{ return new RejectMicrotask(microtaskKey, excludedWorkerID, awardedPoint); }


	public static MicrotaskCommand cancelMicrotask(Key<Microtask> microtaskKey) {
		return new CancelMicrotask(microtaskKey);

	}

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

	public void execute(final String projectId)
	{
		final Microtask microtask = find(microtaskKey);

	        	if (microtask == null)
	    			System.out.println("ERROR erroreCannot execute MicrotaskCommand. Could not find the microtask for microtaskID "
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
		return ofy().load().key(microtaskKey).now();
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

			microtask.submit(jsonDTOData, workerID, awardedPoint, projectId);
		}
	}

	protected static class Skip extends MicrotaskCommand
	{
		private String workerID;
		private boolean disablePoint;

		public Skip(Key<Microtask> microtaskKey, String workerID, boolean disablePoint)
		{
			super(microtaskKey);
			this.workerID = workerID;
			this.disablePoint=disablePoint;

		}

		public void execute(Microtask microtask, String projectId)
		{
			microtask.skip(workerID, disablePoint, projectId);
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

	protected static class RejectMicrotask extends MicrotaskCommand
	{
		private String excludedWorkerID;
		private int awardedPoint;

		public RejectMicrotask(Key<Microtask> microtaskKey, String excludedWorkerID, int awardedPoint)
		{
			super(microtaskKey);
			this.excludedWorkerID = excludedWorkerID;
			this.awardedPoint = awardedPoint;

		}

		// Overrides the default execute as no microtask is to be loaded.
		public void execute(Microtask microtask, String projectId)
		{
			Microtask newMicrotask = microtask.copy(projectId);

			WorkerCommand.awardPoints( excludedWorkerID ,awardedPoint );

			ProjectCommand.queueMicrotask(newMicrotask.getKey(), excludedWorkerID);
		}
	}
	protected static class ReviseMicrotask extends MicrotaskCommand
	{
		private String excludedWorkerID;
		private int awardedPoint;
		private String jsonDTOData;
		private String reissueMotivation;

		public ReviseMicrotask(Key<Microtask> microtaskKey, String jsonDTOData, String reissueMotivation, String excludedWorkerID, int awardedPoint)
		{
			super(microtaskKey);
			this.excludedWorkerID = excludedWorkerID;
			this.awardedPoint = awardedPoint;
			this.jsonDTOData = jsonDTOData;
			this.reissueMotivation = reissueMotivation;
		}

		// Overrides the default execute as no microtask is to be loaded.
		public void execute(Microtask microtask, String projectId)
		{
			microtask.revise(jsonDTOData, excludedWorkerID ,awardedPoint,reissueMotivation, projectId);
		}
	}
	protected static class CancelMicrotask extends MicrotaskCommand
	{

		public CancelMicrotask(Key<Microtask> microtaskKey)
		{
			super(microtaskKey);
		}

		// Overrides the default execute as no microtask is to be loaded.
		public void execute(Microtask microtask, String projectId)
		{
			microtask.setCanceled(true);
			FirebaseService.writeMicrotaskCanceled( Microtask.keyToString(microtask.getKey()), true, projectId );
			ofy().save().entity(microtask).now();
		}
	}
}
