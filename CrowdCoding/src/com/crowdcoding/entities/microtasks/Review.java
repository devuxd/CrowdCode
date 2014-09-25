package com.crowdcoding.entities.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.commands.MicrotaskCommand;
import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ReviewDTO;
import com.crowdcoding.dto.firebase.MicrotaskInFirebase;
import com.crowdcoding.dto.firebase.NewsItemInFirebase;
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
		FirebaseService.writeMicrotaskCreated(new MicrotaskInFirebase(id, this.microtaskName(), "", 
				false, submitValue), id, project);
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this, null));
		project.historyLog().endEvent();
	}
	
    public Microtask copy(Project project)
    {
    	return new Review(microtaskIDUnderReview, this.initiallySubmittedDTO, this.workerOfReviewedWork, project);
    } 
	
	protected void doSubmitWork(DTO dto, String workerID, Project project)
	{
		System.out.println("--- SUBMITTING REVIEW ---");
		
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
			WorkerCommand.awardPoints(workerOfReviewedWork, submittedMicrotask.submitValue);
			points = submittedMicrotask.submitValue;
		}
		// Otherwise, reisuse a new microtask to do the original work again.
		else		
			MicrotaskCommand.reissueMicrotask(microtaskIDUnderReview, workerOfReviewedWork);

		// send feedback
    	FirebaseService.postToNewsfeed(workerOfReviewedWork, (
    		new NewsItemInFirebase(
    			submittedMicrotask.submitValue, 
			    submittedMicrotask.microtaskDescription(),
				"WorkReviewed", 
				submittedMicrotask.getID(),
				reviewDTO.qualityScore)
	    	).json(), 
	    	project
	    );
		
		// Award points to the reviewer for the review task
		WorkerCommand.awardPoints(workerID, this.submitValue);
    	FirebaseService.postToNewsfeed(workerID, (new NewsItemInFirebase(this.submitValue, 
    			"You reviewed a microtask", "SubmittedReview",
    			this.id).json()), project);
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
