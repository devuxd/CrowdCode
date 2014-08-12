package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.Project;
import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.commands.MicrotaskCommand;
import com.crowdcoding.artifacts.commands.ProjectCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ReusedFunctionDTO;
import com.crowdcoding.dto.ReviewDTO;
import com.crowdcoding.dto.history.MicrotaskSpawned;
import com.googlecode.objectify.annotation.EntitySubclass;

@EntitySubclass(index=true)
public class Review extends Microtask 
{
	private long microtaskIDUnderReview;
	private String workerOfReviewedWork;
		
	// Default constructor for deserialization
	private Review() 
	{				
	}
	
	// Constructor for initial construction
	public Review(long microtaskIDUnderReview, Project project)
	{
		super(project);
		this.submitValue = 4;
		this.microtaskIDUnderReview = microtaskIDUnderReview;				
		ofy().save().entity(this).now();
        postToFirebase(project, null, true);
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this, null));
		project.historyLog().endEvent();
	}
	
    public Microtask copy(Project project)
    {
    	return new Review(microtaskIDUnderReview, project);
    } 
	
	protected void doSubmitWork(DTO dto, Project project)
	{
		ReviewDTO reviewDTO = (ReviewDTO) dto;		
		
		// If above thereshold, load the original microtask submit from firebase and ask it to be submitted
		if (reviewDTO.qualityScore > 2)		
			MicrotaskCommand.submit(microtaskIDUnderReview, reviewDTO.initialSubmittedDTO, workerOfReviewedWork);				
		
		// Otherwise, reisuse a new microtask to do the original work again.
		else		
			MicrotaskCommand.reissueMicrotask(microtaskIDUnderReview, workerOfReviewedWork);		
	}
	
	protected Class getDTOClass()
	{
		return ReviewDTO.class;
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
