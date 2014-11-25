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
import com.crowdcoding.entities.Function;
import com.crowdcoding.entities.Project;
import com.crowdcoding.history.MicrotaskSpawned;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;
import com.googlecode.objectify.annotation.Parent;

@EntitySubclass(index=true)
public class Review extends Microtask
{
	@Parent @Load private Ref<Artifact> artifact;
	private Key<Microtask> microtaskKeyUnderReview;
	private String workerOfReviewedWork;
	private String initiallySubmittedDTO;	// initially submitted DTO in string format

	// Default constructor for deserialization
	private Review()
	{
	}

	// Constructor for initial construction
	public Review(Key<Microtask> microtaskKeyUnderReview, String initiallySubmittedDTO, String workerOfReviewedWork,
			Project project)
	{
		super(project);
		this.submitValue = 4;
		this.microtaskKeyUnderReview = microtaskKeyUnderReview;
		this.initiallySubmittedDTO = initiallySubmittedDTO;
		this.workerOfReviewedWork = workerOfReviewedWork;
		
		Microtask microtaskUnderReview = ofy().load().key(microtaskKeyUnderReview).get();
		this.artifact = (Ref<Artifact>) Ref.create( microtaskUnderReview.getOwningArtifact().getKey() );
		
		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new ReviewInFirebase(id,this.microtaskTitle(), this.microtaskName(), "",
				false, submitValue, microtaskKeyUnderReview), 
				Project.MicrotaskKeyToString(this.getKey()),
				project);

		project.historyLog().beginEvent(new MicrotaskSpawned(this, null));
		project.historyLog().endEvent();
		System.out.println("instantiating new review for microtask: "+microtaskKeyUnderReview);
	}

    public Microtask copy(Project project)
    {
    	return new Review(microtaskKeyUnderReview, this.initiallySubmittedDTO, this.workerOfReviewedWork, project);
    }

	protected void doSubmitWork(DTO dto, String workerID, Project project)
	{

		ReviewDTO reviewDTO = (ReviewDTO) dto;
		System.out.println("REVIEW DTO "+reviewDTO.toString());
		Microtask submittedMicrotask = Microtask.find(microtaskKeyUnderReview,project).getValue();

		// Write the review to firebase
		FirebaseService.writeReview(reviewDTO, Project.MicrotaskKeyToString( submittedMicrotask.getKey() ), project);

		// set default award points to 0
		int points = 0;

		// If above thereshold, submit the original microtask, award worker with submitValue
		if (reviewDTO.qualityScore > 2)
		{
			MicrotaskCommand.submit(microtaskKeyUnderReview, initiallySubmittedDTO, workerOfReviewedWork);
			//FirebaseService.setPoints(workerID, workerOfReviewedWork, submittedMicrotask.submitValue, project);
		}
		// Otherwise, reisuse a new microtask to do the original work again.
		else
			MicrotaskCommand.reissueMicrotask(microtaskKeyUnderReview, workerOfReviewedWork);

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

    public Key<Microtask> getKey()
	{
		return Key.create( artifact.getKey(), Microtask.class, this.id );
	}
    
	protected Class getDTOClass()
	{
		return ReviewDTO.class;
	}

	public Key<Microtask> getMicrotaskIDUnderReview()
	{
		return microtaskKeyUnderReview;
	}

	public String getUIURL()
	{
		return "/html/microtasks/review.jsp";
	}

	public Artifact getOwningArtifact()
	{
		return artifact.get();
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
