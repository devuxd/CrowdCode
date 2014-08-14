package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.Project;
import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.commands.MicrotaskCommand;
import com.crowdcoding.artifacts.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ReviewDTO;
import com.crowdcoding.dto.history.MicrotaskSpawned;
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
        postToFirebase(project, null, true);
		
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
		
		// If above thereshold, load the original microtask submit from firebase and ask it to be submitted
		if (reviewDTO.qualityScore > 2)		
		{
			MicrotaskCommand.submit(microtaskIDUnderReview, initiallySubmittedDTO, workerOfReviewedWork);
						
			// Award the worker of the reviewed work points, and give them feedback
			WorkerCommand.awardPoints(workerOfReviewedWork, submittedMicrotask.submitValue, 
					"Your work to " + submittedMicrotask.microtaskDescription() + " was reviewed and given a quality score of "
					+ reviewDTO.qualityScore + "/5 and contribution level of " + reviewDTO.quantityScore + "/5."
					+ " You have been awarded " + submittedMicrotask.submitValue + " points. (hover to see review).");		
		}
		// Otherwise, reisuse a new microtask to do the original work again.
		else		
		{
			MicrotaskCommand.reissueMicrotask(microtaskIDUnderReview, workerOfReviewedWork);
			
			// Microtask rejected. Give the worker feedback, but no points.
			WorkerCommand.awardPoints(workerOfReviewedWork, 0, 
					"Your work to " + submittedMicrotask.microtaskDescription() + " was reviewed and rejected. You were "
					+ "given a quality score of "
					+ reviewDTO.qualityScore + "/5 and contribution level of " + reviewDTO.quantityScore + "/5."
					+ " You have been awarded 0 points. (hover to see review).");
		}
		
		// Award points to the reviewer for the review task
		WorkerCommand.awardPoints(workerID, this.submitValue, "You reviewed a microtask and receieved " + 
				this.submitValue + " points.");
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
