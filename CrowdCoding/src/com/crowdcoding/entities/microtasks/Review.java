package com.crowdcoding.entities.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.commands.MicrotaskCommand;
import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ReviewDTO;
import com.crowdcoding.dto.firebase.MicrotaskInFirebase;
import com.crowdcoding.dto.firebase.NewsItemInFirebase;
import com.crowdcoding.dto.firebase.ReviewInFirebase;
import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.Project;
import com.crowdcoding.history.MicrotaskSpawned;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.annotation.EntitySubclass;

@EntitySubclass(index=true)
public class Review extends Microtask
{
	private long microtaskIDUnderReview;
	private String workerOfReviewedWork;
	private String initiallySubmittedDTO;	// initially submitted DTO in string format

	// Default constructor for deserialization
	private Review()
	{
	}

	// Constructor for initial construction
	public Review(long microtaskIDUnderReview, String initiallySubmittedDTO, String workerOfReviewedWork,
			Project project)
	{
		super(project);
		this.submitValue = 4;
		this.microtaskIDUnderReview = microtaskIDUnderReview;
		this.initiallySubmittedDTO = initiallySubmittedDTO;
		this.workerOfReviewedWork = workerOfReviewedWork;
		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new ReviewInFirebase(id,this.microtaskTitle(), this.microtaskName(), "",
				false, submitValue, microtaskIDUnderReview), id, project);

		project.historyLog().beginEvent(new MicrotaskSpawned(this, null));
		project.historyLog().endEvent();
		System.out.println("instantiating new review for microtask: "+microtaskIDUnderReview);
	}

    public Microtask copy(Project project)
    {
    	return new Review(microtaskIDUnderReview, this.initiallySubmittedDTO, this.workerOfReviewedWork, project);
    }

	protected void doSubmitWork(DTO dto, String workerID, Project project)
	{

		ReviewDTO reviewDTO = (ReviewDTO) dto;
		Microtask submittedMicrotask = Microtask.find(microtaskIDUnderReview, project).getValue();

		// Write the review to firebase
		FirebaseService.writeReview(reviewDTO, submittedMicrotask.getID(), project);

		// set default award points to 0
		int points = 0;

		// If above thereshold, submit the original microtask, award worker with submitValue
		if (reviewDTO.qualityScore > 2)
		{
			MicrotaskCommand.submit(microtaskIDUnderReview, initiallySubmittedDTO, workerOfReviewedWork);
			//FirebaseService.setPoints(workerID, workerOfReviewedWork, submittedMicrotask.submitValue, project);
		}
		// Otherwise, reisuse a new microtask to do the original work again.
		else
			MicrotaskCommand.reissueMicrotask(microtaskIDUnderReview, workerOfReviewedWork);

		// send feedback
    	FirebaseService.postToNewsfeed(workerOfReviewedWork, (
    		new NewsItemInFirebase(
    			(reviewDTO.qualityScore > 2) ? submittedMicrotask.submitValue : 0,
    			"Your work on " + submittedMicrotask.microtaskName() + " has been " + ( (reviewDTO.qualityScore>2) ? "approved" : "rejected") ,
				"WorkReviewed",
				submittedMicrotask.getID(),
				(reviewDTO.qualityScore > 2) ? true : false )
	    	).json(),
	    	project
	    );

		// Award points to the reviewer for the review task
		WorkerCommand.awardPoints(workerID, this.submitValue);
		//FirebaseService.setPoints(workerID, workerOfReviewedWork,  this.submitValue, project);
    	FirebaseService.postToNewsfeed(workerID, (new NewsItemInFirebase(
    			this.submitValue,
    			"You reviewed a microtask",
    			"SubmittedReview",
    			this.id
    	).json()), project);

    	System.out.println("reviewer id="+workerID);
    	System.out.println("reviewed  id="+workerOfReviewedWork);


		// increase the stats counter
		WorkerCommand.increaseStat(workerID, "reviews",1);

	}

	protected Class getDTOClass()
	{
		return ReviewDTO.class;
	}

	public long getMicrotaskIDUnderReview()
	{
		return microtaskIDUnderReview;
	}

	public String getUIURL()
	{
		return "/html/microtasks/review.jsp";
	}

	public Artifact getOwningArtifact()
	{
		return null;
	}

	public String microtaskTitle()
	{
		return "Review work";
	}

	public String microtaskDescription()
	{
		return "review a submitted microtask";
	}
}