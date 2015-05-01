package com.crowdcoding.entities.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.commands.MicrotaskCommand;
import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ReviewDTO;
import com.crowdcoding.dto.firebase.MicrotaskInFirebase;
import com.crowdcoding.dto.firebase.NewsItemInFirebase;
import com.crowdcoding.dto.firebase.NotificationInFirebase;
import com.crowdcoding.dto.firebase.ReviewInFirebase;
import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.Function;
import com.crowdcoding.entities.Project;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.history.MicrotaskAccepted;
import com.crowdcoding.history.MicrotaskReissued;
import com.crowdcoding.history.MicrotaskRejected;
import com.crowdcoding.history.MicrotaskSpawned;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Subclass;
import com.googlecode.objectify.annotation.Load;
import com.googlecode.objectify.annotation.Parent;

@Subclass(index=true)
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
			String projectId)
	{
		super(projectId);
		this.submitValue = 5;
		this.microtaskKeyUnderReview = microtaskKeyUnderReview;
		this.initiallySubmittedDTO = initiallySubmittedDTO;
		this.workerOfReviewedWork = workerOfReviewedWork;

		Microtask microtaskUnderReview = ofy().load().key(microtaskKeyUnderReview).now();
		this.artifact = (Ref<Artifact>) Ref.create((Key<Artifact>) microtaskUnderReview.getOwningArtifact().getKey());

		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new ReviewInFirebase(
				id,
				this.microtaskTitle(),
				this.microtaskName(),
				this.artifact.get().getName(),
				this.artifact.get().getID(),
				false,
				false,
				submitValue,
				 microtaskKeyUnderReview
				),
				Microtask.keyToString(this.getKey()),
				projectId);

		HistoryLog.Init(projectId).addEvent(new MicrotaskSpawned(this));
	}

    public Microtask copy(String projectId)
    {
    	return new Review(microtaskKeyUnderReview, this.initiallySubmittedDTO, this.workerOfReviewedWork, projectId);
    }

	protected void doSubmitWork(DTO dto, String workerID, String projectId)
	{

		ReviewDTO reviewDTO = (ReviewDTO) dto;

		Microtask submittedMicrotask = Microtask.find(microtaskKeyUnderReview).now();

		// Write the review to firebase
		FirebaseService.writeReview(reviewDTO, this.id, Microtask.keyToString(submittedMicrotask.getKey()) , projectId);

		// set default award points to 0
		int points = 0;


		int awardedPoints;
		String reviewResult;

		//reject not used any more for now...
        /*if( reviewDTO.qualityScore < 3 ) {

			// reissue microtask
        	System.out.println("--> REVIEW mtask "+Project.MicrotaskKeyToString( submittedMicrotask.getKey() )+" rejected");
			MicrotaskCommand.rejectAndReissueMicrotask(microtaskKeyUnderReview, workerOfReviewedWork);
			awardedPoint = 0;
			reviewResult = "rejected";


			project.historyLog().beginEvent(new MicrotaskRejected(submittedMicrotask,workerID));
			project.historyLog().endEvent();

		} else*/

		/*the awarded point is proportional to the square of the total points
			points : 10
			5 stars ->10
			4 stars ->6
			3 stars ->3
			2 stars ->1
			1 stars ->0
		*/
		awardedPoints = (int) Math.round( submittedMicrotask.submitValue * Math.pow((reviewDTO.qualityScore /5.0), 1.5));
		NotificationInFirebase notification = null;
		if ( reviewDTO.qualityScore < 4) {

			// reissue microtask
			System.out.println("--> REVIEW mtask "+submittedMicrotask.getKey().toString()+" reissued");
			reviewResult = "reissued";
			if(reviewDTO.fromDisputedMicrotask)
				MicrotaskCommand.rejectMicrotask(microtaskKeyUnderReview, workerOfReviewedWork, awardedPoints);
			else
				MicrotaskCommand.reviseMicrotask(microtaskKeyUnderReview, initiallySubmittedDTO, reviewDTO.reviewText, workerOfReviewedWork, awardedPoints);

			HistoryLog.Init(projectId).addEvent(new MicrotaskReissued(submittedMicrotask,workerID));

			notification = new NotificationInFirebase(
					"task.reissued",
					"{ \"microtaskId\": \""+submittedMicrotask.getID() + "\", \"microtaskType\": \""+submittedMicrotask.microtaskName() + "\", \"artifactName\": \""+submittedMicrotask.getOwningArtifact().getName() + "\"}"
			);

		} else {

			// accept microtask
        	System.out.println("--> REVIEW mtask "+submittedMicrotask.getKey().toString()+" accepted");
			reviewResult ="accepted";
			MicrotaskCommand.submit(microtaskKeyUnderReview, initiallySubmittedDTO, workerOfReviewedWork, awardedPoints);


			HistoryLog.Init(projectId).addEvent(new MicrotaskAccepted(submittedMicrotask,workerID));
			
			notification = new NotificationInFirebase(
					"task.accepted",
					"{ \"microtaskId\": \""+submittedMicrotask.getID() + "\", \"microtaskType\": \""+submittedMicrotask.microtaskName() + "\", \"artifactName\": \""+submittedMicrotask.getOwningArtifact().getName() + "\"}"
			);

		}


		// send feedback
    	FirebaseService.postToNewsfeed(workerOfReviewedWork, (
    		new NewsItemInFirebase(
    			awardedPoints,
    			submittedMicrotask.submitValue,
    			submittedMicrotask.microtaskName(),
				"WorkReviewed",
				Microtask.keyToString(submittedMicrotask.getKey()),
				reviewDTO.qualityScore)
	    	).json(),
	    	Microtask.keyToString(submittedMicrotask.getKey()),
    		projectId
	    );
    	// send notification
		FirebaseService.writeWorkerNotification(
				notification,
				workerOfReviewedWork, 
				projectId
		);



		//FirebaseService.setPoints(workerID, workerOfReviewedWork,  this.submitValue, project);
    	FirebaseService.postToNewsfeed(workerID, (
    		new NewsItemInFirebase(
    			this.submitValue,
    			this.submitValue,
    			this.microtaskName(),
    			"SubmittedReview",
    			Microtask.keyToString(this.getKey()),
    			-1 // differentiate the reviews from the 0 score tasks
	    	).json()),
	    	Microtask.keyToString(this.getKey()),
			projectId
		);

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
		Artifact owning;
		try {
			return artifact.safe();
		} catch ( Exception e ){
			ofy().load().ref(this.artifact);
			return artifact.get();
		}
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
