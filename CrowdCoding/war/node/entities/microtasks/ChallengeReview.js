package com.crowdcoding.entities.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;

import com.crowdcoding.commands.MicrotaskCommand;
import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.ChallengeDTO;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ajax.microtask.submission.ChallengeReviewDTO;
import com.crowdcoding.dto.ajax.microtask.submission.ReviewDTO;
import com.crowdcoding.dto.firebase.NewsItemInFirebase;
import com.crowdcoding.dto.firebase.microtasks.ChallengeReviewInFirebase;
import com.crowdcoding.dto.firebase.notification.ChallengeNotificationInFirebase;
import com.crowdcoding.dto.firebase.notification.NotificationInFirebase;
import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.artifacts.Artifact;
import com.crowdcoding.entities.artifacts.Function;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.history.MicrotaskAccepted;
import com.crowdcoding.history.MicrotaskReissued;
import com.crowdcoding.history.MicrotaskRejected;
import com.crowdcoding.history.MicrotaskSpawned;
import com.crowdcoding.util.FirebaseService;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Subclass;
import com.googlecode.objectify.annotation.Load;
import com.googlecode.objectify.annotation.Parent;

@Subclass(index=true)
class ChallengeReview extends Microtask
{

	@Parent @Load private Ref<Artifact> artifact;
	var microtaskKeyUnderChallenge;
	var challengeeWorkerId;
	var challengerWorkerId;
	var challengeText;
	var reviewKeyUnderChallenge;

	// Default constructor for deserialization
	constructor()
	{
	}

	// Constructor for initial construction
	constructor (challengeText, challengerWorkerId, challengeeWorkerId, microtaskKeyUnderChallenge, reviewKeyUnderChallenge, functionId, projectId)
	{
		super(projectId,functionId)
		this.submitValue = 3;

		this.challengeText = challengeText;
		this.challengerWorkerId = challengerWorkerId;
		this.challengeeWorkerId = challengeeWorkerId;
		this.microtaskKeyUnderChallenge = microtaskKeyUnderChallenge;
		this.reviewKeyUnderChallenge = reviewKeyUnderChallenge;

		/*Microtask microtaskUnderChallenge = ofy().load().key(microtaskKeyUnderChallenge).now();
		Microtask reviewUnderChallenge = ofy().load().key(reviewKeyUnderChallenge).now();
		this.artifact = (Ref<Artifact>) Ref.create((Key<Artifact>) microtaskUnderChallenge.getOwningArtifact().getKey());
		//console.log("micrtoask created");
		ofy().save().entity(this).now();

		FirebaseService.writeMicrotaskCreated(new ChallengeReviewInFirebase(
				id,
				this.microtaskTitle(),
				this.microtaskName(),
				this.artifact.get().getName(),
				this.artifact.get().getId(),
				functionId,
				submitValue,
				this.challengeText,
				microtaskKeyUnderChallenge
				),
				Microtask.keyToString(this.getKey()),
				projectId);

		// send feedback
		String udpatedData="{\"challengeStatus\": \"inProgress\", \"canBeChallenged\": false}";
    	FirebaseService.updateNewsfeed(challengeeWorkerId, udpatedData, Microtask.keyToString(reviewKeyUnderChallenge),projectId);
    	FirebaseService.updateNewsfeed(challengerWorkerId, udpatedData, Microtask.keyToString(microtaskKeyUnderChallenge),projectId);

		FirebaseService.writeWorkerNotification(
				new ChallengeNotificationInFirebase(
						"challenge.inProgress",
						Microtask.keyToString(reviewKeyUnderChallenge),
						microtaskUnderChallenge.microtaskName(),
						microtaskUnderChallenge.getOwningArtifact().getName()),
				challengeeWorkerId,
				projectId
		);

		HistoryLog.Init(projectId).addEvent(new MicrotaskSpawned(this));
	}*/

    function copy(projectId, functionId)
    {
    	return new ChallengeReview(this.challengeText, this.challengerWorkerId, this.challengeeWorkerId, this.microtaskKeyUnderChallenge, this.reviewKeyUnderChallenge, this.functionId, this.projectId);
    }

	function doSubmitWork(DTO dto, String workerID)
	{
		console.log("submitting");

		/*ChallengeReviewDTO challengeDTO = (ChallengeReviewDTO) dto;
		Microtask microtaskUnderChallenge = ofy().load().key(microtaskKeyUnderChallenge).now();
		Microtask reviewUnderChallenge = ofy().load().key(reviewKeyUnderChallenge).now();

		String challengerResult = challengeDTO.isChallengeWon ? "won" : "lost";
		String challengeeResult = challengeDTO.isChallengeWon ? "lost" : "won";
		*/

		// send feedback
    	/*FirebaseService.postToNewsfeed(workerID, (
    		new NewsItemInFirebase(
        		this.submitValue,
    			this.submitValue,
    			this.microtaskName(),
				"Challenge Reviewed",
				Microtask.keyToString(this.getKey()),
				-1,
				"none",
				false)
	    	).json(),
	    	Microtask.keyToString(reviewKeyUnderChallenge),
    		projectId
	    );*/
    	var challengeeUpdatedData;
		var challengerUpdatedData;
    	/*if(challengeDTO.isChallengeWon){
			challengeeUpdatedData="{\"challengeStatus\": \"lost\", \"awardedPoints\": \"0\"}";
			challengerUpdatedData="{\"challengeStatus\": \"won\", \"awardedPoints\": \""+microtaskUnderChallenge.submitValue+"\"}";
    	}
    	else
    	{
    		challengeeUpdatedData="{\"challengeStatus\": \"won\", \"awardedPoints\": \""+reviewUnderChallenge.getSubmitValue()+"\"}";
			challengerUpdatedData="{\"challengeStatus\": \"lost\", \"awardedPoints\": \"0\"}";
    	}

    	FirebaseService.updateNewsfeed(
    			challengeeWorkerId,
    			challengeeUpdatedData,
    			Microtask.keyToString(reviewKeyUnderChallenge),
    			projectId);
    	FirebaseService.updateNewsfeed(
    			challengerWorkerId,
    			challengerUpdatedData,
    			Microtask.keyToString(microtaskKeyUnderChallenge),
    			projectId);


    	// send notification
		FirebaseService.writeWorkerNotification(
				new ChallengeNotificationInFirebase(
						"challenge."+challengeeResult,
						Microtask.keyToString(reviewKeyUnderChallenge),
						reviewUnderChallenge.microtaskName(),
						reviewUnderChallenge.getOwningArtifact().getName()),
				challengeeWorkerId,
				projectId
		);
		FirebaseService.writeWorkerNotification(
				 new ChallengeNotificationInFirebase(
							"challenge."+challengerResult,
							Microtask.keyToString(microtaskKeyUnderChallenge),
							microtaskUnderChallenge.microtaskName(),
							microtaskUnderChallenge.getOwningArtifact().getName()),
				challengerWorkerId,
				projectId
		);

		// increase the stats counter
		//WorkerCommand.increaseStat(workerID, "reviews",1);
*/
	}
    function getKey()
	{
		return Key.create( artifact.getKey(), Microtask.class, this.id );
	}
	function getDTOClass()
	{
		return ChallengeReviewDTO.class;
	}
	function getMicrotaskUnderChallengeKey()
	{
		return microtaskKeyUnderChallenge;
	}
	function getOwningArtifact()
	{
		//Artifact owning;
		try {
			return artifact.safe();
		} catch ( Exception e ){
			ofy().load().ref(this.artifact);
			return artifact.get();
		}
	}
	function microtaskTitle()
	{
		return "Challenge Review";
	}
	function microtaskDescription()
	{
		return "challenge a submitted review";
	}

}
