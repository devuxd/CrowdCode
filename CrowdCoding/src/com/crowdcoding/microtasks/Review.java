package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.Project;
import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.commands.MicrotaskCommand;
import com.crowdcoding.artifacts.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ReviewDTO;
import com.crowdcoding.dto.firebase.MicrotaskInFirebase;
import com.crowdcoding.dto.firebase.NewsItemInFirebase;
import com.crowdcoding.dto.history.MicrotaskSpawned;
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
		ReviewDTO reviewDTO = (ReviewDTO) dto;	
		Microtask submittedMicrotask = Microtask.find(microtaskIDUnderReview, project).getValue();
		
		// Write the review to firebase
		FirebaseService.writeReview(reviewDTO, submittedMicrotask.getID(), project);
		
		// If above thereshold, load the original microtask submit from firebase and ask it to be submitted
		if (reviewDTO.qualityScore > 2)		
		{
			MicrotaskCommand.submit(microtaskIDUnderReview, initiallySubmittedDTO, workerOfReviewedWork);
						
			// Award the worker of the reviewed work points, and give them feedback
			WorkerCommand.awardPoints(workerOfReviewedWork, submittedMicrotask.submitValue);
	    	FirebaseService.postToNewsfeed(workerOfReviewedWork, (new NewsItemInFirebase(submittedMicrotask.submitValue, 
					"Your work to " + submittedMicrotask.microtaskDescription() + " was reviewed and rated "
					+ reviewDTO.qualityScore + "/5." 
					+ " You have been awarded " + submittedMicrotask.submitValue + " points. (hover for review)",
					"WorkReviewed", submittedMicrotask.getID())).json(), project);
		}
		// Otherwise, reisuse a new microtask to do the original work again.
		else		
		{
			MicrotaskCommand.reissueMicrotask(microtaskIDUnderReview, workerOfReviewedWork);
			
			// Microtask rejected. Give the worker feedback, but no points.
			WorkerCommand.awardPoints(workerOfReviewedWork, 0);
	    	FirebaseService.postToNewsfeed(workerID, (new NewsItemInFirebase(0, 
					"Your work to " + submittedMicrotask.microtaskDescription() + " was reviewed and rejected, "
					+ "with a quality score of "
					+ reviewDTO.qualityScore + "/5. You have been awarded 0 points. (hover to see review)",
	    			"WorkReviewed", submittedMicrotask.getID()).json()), project);
		}
		
		// Award points to the reviewer for the review task
		WorkerCommand.awardPoints(workerID, this.submitValue);
    	FirebaseService.postToNewsfeed(workerID, (new NewsItemInFirebase(this.submitValue, 
    			"You reviewed a microtask and receieved " + this.submitValue + " points.", "SubmittedReview",
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
		return "/html/review.jsp";
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
