package com.crowdcoding.util;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.NoSuchElementException;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.locks.ReentrantReadWriteLock.WriteLock;
import java.util.logging.Logger;

import com.crowdcoding.commands.Command;
import com.crowdcoding.dto.ajax.microtask.submission.ReviewDTO;
import com.crowdcoding.dto.firebase.*;
import com.crowdcoding.dto.firebase.artifacts.*;
import com.crowdcoding.dto.firebase.microtasks.*;
import com.crowdcoding.dto.firebase.notification.NotificationInFirebase;
import com.crowdcoding.dto.firebase.questions.*;
import com.crowdcoding.history.HistoryEvent;
import com.crowdcoding.servlets.ThreadContext;
import com.google.appengine.api.urlfetch.HTTPMethod;
import com.google.appengine.api.urlfetch.HTTPRequest;
import com.google.appengine.api.urlfetch.HTTPResponse;
import com.google.appengine.api.urlfetch.URLFetchService;
import com.google.appengine.api.urlfetch.URLFetchServiceFactory;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;


/* Wrapper service that handles all interactions with Firebase, providing an API
 * for interacting with Firebase that hides all its implementation details.
 */
class FirebaseService
{

	// Writes the specified data using the URL, relative to the BaseURL.
	// Operation specifies the type of http request to make (e.g., PUT, POST, DELETE)
	function writeData(data, relativeURL, operation, projectId)
	{
		writeDataAbsolute(data, getBaseURL(projectId) + relativeURL, operation);
	}

	// Writes the specified data using specified absolute URL asyncrhonously (does not block waiting on write).
	// Operation specifies the type of http request to make (e.g., PUT, POST, DELETE)
	function writeDataAbsolute(data, absoluteURL, operation)
	{
		//firebase wrapper
		try
		{
			URLFetchService fetchService = URLFetchServiceFactory.getURLFetchService();
			HTTPRequest     request      = new HTTPRequest(new URL(absoluteURL), operation);
			request.setPayload(data.getBytes());
//			Future<HTTPResponse> fetchAsync = fetchService.fetchAsync(request);
			HTTPResponse    response     = fetchService.fetch(request);

			if( response.getResponseCode() != 200){
				Logger.getLogger("LOGGER").severe("FIREBASE WRITE FAILED: "+response.getResponseCode()+" - "+absoluteURL+" - "+data);
			}
		}
		catch (MalformedURLException e) {
			System.out.println("Malformed url: "+e);
		} catch (IOException e) {
			System.out.println("IOException url: "+e);
		}
	}

	// Reads a JSON string from the specified absolute URL synchronously (blocks waiting on read to return).
	// Uses the GET operation to read the data.
	function readDataAbsolute(absoluteURL)
	{
		try
		{
			URLFetchService fetchService = URLFetchServiceFactory.getURLFetchService();
			HTTPRequest request = new HTTPRequest(new URL(absoluteURL), HTTPMethod.GET);
			HTTPResponse response = fetchService.fetch(request);
			byte[] payload = response.getContent();
			if (payload != null)
				return new String(payload);
		}
		catch (MalformedURLException e) {
			// ...
		}
		catch (IOException e) {
			// ...
		}

		return "";
	}

	// Gets the base URL for the current deployment project
	function getBaseURL(String projectId)
	{
		return "https://crowdcode2.firebaseio.com/projects/" + projectId;
	}
	
	function enqueueWrite(data, relativeURL, operation, projectId){

		ThreadContext threadContext = ThreadContext.get();
        threadContext.addfirebaseWrite(new FirebaseWrite(data,relativeURL,operation,projectId));
	}

	function publish(){

		ConcurrentLinkedQueue<FirebaseWrite> firebaseWriteList = ThreadContext.get().getFirebaseWritesList();
		Iterator<FirebaseWrite> writeIterator = firebaseWriteList.iterator();
	    while(writeIterator.hasNext()) {
    		FirebaseWrite write = writeIterator.next();

    		if( write != null ){
    			write.publish();
    			writeIterator.remove();
    		}
	    }
	}

	class FirebaseWrite
	{
		var data;
		var relativeURL;
		var operation;
		var projectId;

		constructor(data, relativeURL, operation, projectId){
			this.data = data;
			this.relativeURL = relativeURL;
			this.operation = operation;
			this.projectId = projectId;
		}

		function publish(){
			FirebaseService.writeData(data, relativeURL, operation, projectId);
		}
	}



	// Writes the specified microtask to firebase
	function writeMicrotaskCreated(dto, microtaskKey, projectId)
	{
		enqueueWrite(dto.json(), "/microtasks/" + microtaskKey + ".json", HTTPMethod.PATCH, projectId);

	}
	// Writes the specified microtask to firebase
	function writeMicrotaskSubmission(submissionDto, microtaskKey, projectId)
	{
		enqueueWrite("{\"submission\": " + submissionDto + "}", "/microtasks/" + microtaskKey + ".json", HTTPMethod.PATCH, projectId);

	}

	// Writes information about microtask assignment to Firebase
	function writeMicrotaskAssigned(microtaskKey,
			workerId, projectId, boolean assigned)
	{
		enqueueWrite("{\"assigned\": "+Boolean.toString(assigned)+", \"workerId\": \"" + workerId + "\"}", "/microtasks/" + microtaskKey + ".json", HTTPMethod.PATCH, projectId);
	}
	
	
	// Writes information about excluded workers to Firebase
	function writeMicrotaskExcludedWorkers(microtaskKey,
			projectId, workerIDs)
	{
		enqueueWrite("{\"excluded\": \"" +workerIDs+ "\"}", "/microtasks/" + microtaskKey + ".json", HTTPMethod.PATCH, projectId);
	}
	
	

	// Show if microtask is waiting for review
	function writeMicrotaskWaitingReview( microtaskKey,
			workerId, projectId, waiting)
	{
		enqueueWrite("{\"waitingReview\": " + waiting + "}", "/microtasks/" + microtaskKey + "/.json", HTTPMethod.PATCH, projectId);
	}

	
	// Writes information about microtask completition to Firebase
	function writeMicrotaskCompleted(microtaskKey, workerID, projectId, completed){
		enqueueWrite("{\"completed\": " + completed + "}", "/microtasks/" + microtaskKey + "/.json", HTTPMethod.PATCH, projectId);
		writeMicrotaskWaitingReview(microtaskKey,workerID, projectId, false);
	}
	// Writes information about microtask completition to Firebase
	function writeMicrotaskDeleted(microtaskKey, projectId){
		enqueueWrite("{\"deleted\": \"true\"}", "/microtasks/" + microtaskKey + "/.json", HTTPMethod.PATCH, projectId);
	}

	// Writes information about an old microtask to retrieve the information to Firebase
	function writeMicrotaskReissuedFrom(microtaskKey, reiussueInFirebase, reissuedSubmission, projectId)
	{

		enqueueWrite("{\"reissuedSubmission\": " + reissuedSubmission + "}", "/microtasks/" + microtaskKey+ ".json", HTTPMethod.PATCH, projectId);
		enqueueWrite(reiussueInFirebase.json(), "/microtasks/" + microtaskKey+ ".json", HTTPMethod.PATCH, projectId);
	}

	function writeMicrotaskCanceled(microtaskKey, canceled, projectId)
	{
		enqueueWrite( "{\"canceled\": \"" + canceled + "\"}", "/microtasks/" + microtaskKey + ".json", HTTPMethod.PATCH, projectId);
	}

	function writeTestJobQueue(functionID, functionVersion, testSuiteVersion, projectId)
	{
		console.log("ASKING FOR TEST RUN for function "+functionID);
		enqueueWrite("{\"functionId\": " + functionID + ", \"functionVersion\" : \"" +functionVersion +"\", \"testSuiteVersion\" : \"" +testSuiteVersion +"\", \"bounceCounter\" : \"0\"}", "/status/testJobQueue/"+functionID+".json", HTTPMethod.PUT, projectId);
	}


	function getAllCode(projectId)
	{
		var absoluteUrl = getBaseURL( projectId ) + "/code.json";
		var result = readDataAbsolute( absoluteUrl );

		// check if exist the reference on firebase, if not returns false
		if ( result == null || result.equals("null") )
			return "";
		else{
			result= result.substring(1, result.length()-1);
			result= result.replaceAll("\\\\\"", "\"");
			result= result.replaceAll("debug\\.log", "console.log");
			result= result.replaceAll("\\\\n", "\n");
			result= result.replaceAll("\\\\t", "\t");
			return result;
		}
	}
	function isWorkerLoggedIn(workerID, projectId){
		var absoluteUrl = getBaseURL(projectId) + "/status/loggedInWorkers/" + workerID + ".json";
		var result = readDataAbsolute( absoluteUrl );
		// check if exist the reference on firebase, if not returns false
		if ( result == null || result.equals("null") )
			return false;

		//try to convert the object into json format
		try {
			JSONObject user  = new JSONObject(result);
			long lastUpdateLogin = user.getLong("time");
			// the user on client side will update the login time every 30 seconds,
			// so if has passed more than 30 seconds since the last update means that the user is logged out
			if( ( System.currentTimeMillis() - lastUpdateLogin ) < 30*1000)
				return true;
			else
				return false;

		} catch (JSONException e) {

			e.printStackTrace();
		}

		return false;
	}


	function writeWorkerLoggedIn(workerID, workerDisplayName, projectId){
		enqueueWrite("{\"workerHandle\": \"" + workerDisplayName + "\"}", "/status/loggedInWorkers/" + workerID + ".json", HTTPMethod.PUT, projectId);
	}

	function writeWorkerLoggedOut( workerID, projectId){
		enqueueWrite("", "/status/loggedInWorkers/" + workerID + ".json", HTTPMethod.DELETE, projectId);
	}

	function writeMicrotaskQueue(dto, projectId){
		enqueueWrite(dto.json(), "/status/microtaskQueue.json", HTTPMethod.PUT, projectId);
	}
    writeReviewQueue(dto, projectId){
		enqueueWrite(dto.json(), "/status/reviewQueue.json", HTTPMethod.PUT, projectId);
	}

	function incrementTestSuiteVersion(functionID, testSuiteVersion, projectId){
		enqueueWrite("{\"testSuiteVersion\" : \"" + testSuiteVersion +"\"}" , "/artifacts/functions/" + functionID + ".json", HTTPMethod.PATCH, projectId);
	}

	// Stores the specified function to Firebase
	function writeFunction(dto, functionID, version, projectId){
		enqueueWrite(dto.json(), "/artifacts/functions/" + functionID + ".json", HTTPMethod.PATCH, projectId);
		enqueueWrite(dto.json(), "/history/artifacts/functions/" + functionID + "/" + version + ".json", HTTPMethod.PUT, projectId);
	}


	// Stores the specified test to Firebase
	function writeAdvancedTest(dto, functionId, testID, version, projectId){
		enqueueWrite(dto.json(), "/artifacts/functions/"+functionId+"/tests/" + testID + ".json", HTTPMethod.PUT, projectId);
		enqueueWrite(dto.json(), "/history/artifacts/tests/" + testID + "/" + version + ".json", HTTPMethod.PUT, projectId);
	}

	// Stores the specified Stub to Firebase
	function writeSimpleTest(dto, functionId, stubId, version, projectId){
		enqueueWrite(dto.json(), "/artifacts/functions/" + functionId + "/tests/" + stubId + ".json", HTTPMethod.PUT, projectId);
		enqueueWrite(dto.json(), "/history/artifacts/tests/" + stubId + "/" + version + ".json", HTTPMethod.PUT, projectId);
	}

	// Stores the specified adt to Firebase
	function writeADT(dto, ADTId, version, projectId){
		enqueueWrite(dto.json(), "/artifacts/ADTs/" + ADTId + ".json", HTTPMethod.PUT, projectId);
		enqueueWrite("{ \".priority\": \""+System.currentTimeMillis()+"\" }", "/artifacts/ADTs/" + ADTId + ".json", HTTPMethod.PATCH, projectId);
		enqueueWrite(dto.json(), "/history/artifacts/ADTs/" + ADTId + "/" + version + ".json", HTTPMethod.PUT, projectId);
	}


	// Deletes the specified test in Firebase
	function deleteTest(long testID, String projectId){
		enqueueWrite("", "/artifacts/tests/" + testID + ".json", HTTPMethod.DELETE, projectId);
	}
	
	
	//stores worker information
	function writeWorker(dto,
			userid, projectId) {
		enqueueWrite(dto.json(), "/workers/" + userid + ".json", HTTPMethod.PATCH, projectId);		
	}

	// Stores the specified review to firebase
	function writeReview(reviewSubmission, microtaskKey , projectId){
		console.log(reviewSubmission.json());
		enqueueWrite(reviewSubmission.json(), "/microtasks/" + microtaskKey + "/review.json", HTTPMethod.PUT, projectId);
		}

	function writeSetting(name, value, projectId){
		enqueueWrite(value, "/status/settings/"+name+".json", HTTPMethod.PUT, projectId);
	}

	// Reads the ADTs for the specified project. If there are no ADTs, returns an empty string.
	function readADTs(projectId){
		result = readDataAbsolute("https://crowdcode2.firebaseio.com/clientRequests/" + projectId + "/ADTs.json");
		if (result == null || result.equals("null"))
			result = "";
		return result;
	}

	// Copies the specified ADTs from the client request into the project
	public static void copyADTs(String projectId){
		var adts = readDataAbsolute("https://crowdcode2.firebaseio.com/clientRequests/" + projectId + "/ADTs.json");
		if (adts == null || adts.equals("null"))
			adts = "";
		else
			enqueueWrite(adts, "/ADTs.json", HTTPMethod.PUT, projectId);
	}

	// Reads the functions for the specified project. If there are no functions, returns an empty string.
	function readClientRequest(projectId){
		var result = readDataAbsolute("https://crowdcode2.firebaseio.com/clientRequests/" + projectId + ".json");
		if (result == null || result.equals("null"))
			result = "";
		System.out.println(result);
		return result;
	}

	function setPoints(workerID, workerDisplayName, points, projectId){
		console.log("SETTING POINTS TO WORKER " + workerDisplayName);
		enqueueWrite(Integer.toString(points), "/workers/" + workerID + "/score.json", HTTPMethod.PUT, projectId);
		LeaderboardEntry leader = new LeaderboardEntry(points, workerDisplayName);
		enqueueWrite(leader.json(), "/leaderboard/leaders/" + workerID + ".json", HTTPMethod.PUT, projectId);
	}

	function writeWorkerNotification( notification, workerID, projectId){
		enqueueWrite(notification.json(), "/notifications/" + workerID + ".json", HTTPMethod.POST, projectId);
	}
	
	function writeLevelUpNotification(notification, workerID, projectId){
		enqueueWrite(notification.json(), "/notifications/" + workerID + ".json", HTTPMethod.POST, projectId);
	}
	
	function writeAchievementNotification( notification, workerID, projectId){
		enqueueWrite(notification.json(), "/notifications/" + workerID + ".json", HTTPMethod.POST, projectId);
	}

	function microtaskAssigned( workerID, projectId) {
		enqueueWrite("{\"fetchTime\" : \"" +System.currentTimeMillis() +"\"}", "/workers/" + workerID + ".json", HTTPMethod.PATCH, projectId);
	}


	// Writes information about microtask assignment to Firebase
	function writeMicrotaskPoints( microtaskKey,  points, projectId){
		enqueueWrite("{\"points\": " + points + "}", "/microtasks/" + microtaskKey + ".json", HTTPMethod.PATCH, projectId);
	}

	// Posts the specified JSON message to the specified workers newsfeed
	function postToNewsfeed( workerID, message, microtaskKey, projectId){
		enqueueWrite(message, "/workers/" + workerID + "/newsfeed/"+ microtaskKey +".json", HTTPMethod.PATCH, projectId);
	}
	// change the status of a challenge to the specified workers newsfeed
	function updateNewsfeed( workerID, data, microtaskKey, projectId){
		enqueueWrite(data, "/workers/" + workerID + "/newsfeed/"+ microtaskKey +".json", HTTPMethod.PATCH, projectId);
	}

	// Writes the specified question to firebase
	function writeQuestion( dto,  projectId){
		enqueueWrite(dto.json(), "/questions/"+dto.id+".json", HTTPMethod.PATCH, projectId);
	}

	function writeQuestionVersion( dto,  projectId){
		enqueueWrite(dto.json(), "/history/questions/" + dto.id + "/" + dto.version + ".json", HTTPMethod.PUT, projectId);
	}

	// Writes the specified question to firebase
	function writeAnswerCreated( dto, path, projectId){
		enqueueWrite(dto.json(), path +".json", HTTPMethod.PATCH, projectId);
	}

	// Writes the specified question to firebase
	function writeCommentCreated( dto,  path,  projectId){
		enqueueWrite(dto.json(), path +".json", HTTPMethod.PATCH, projectId);
	}


	function updateQuestioningVoters( votersId,  path,  projectId)	{
		enqueueWrite(votersId.json(), path +".json", HTTPMethod.PATCH, projectId);
	}

	function updateQuestioningReporters( reportersId, path,  projectId){
		enqueueWrite(reportersId.json(), path +".json", HTTPMethod.PATCH, projectId);
	}

	 function updateQuestioningScore( score,path, projectId){
		enqueueWrite("{\"score\": " + score + "}", path +".json", HTTPMethod.PATCH, projectId);
	}

	function updateQuestioningSubscribers(subscribersId, path, projectId){
		enqueueWrite(subscribersId.json(), path +".json", HTTPMethod.PATCH, projectId);
	}

	function updateQuestioningLinkedArtifacts(artifactsId, path,  projectId){
		enqueueWrite(artifactsId.json(), path +".json", HTTPMethod.PATCH, projectId);
	}

	function updateQuestioningClosed( closed, path, projectId){
		enqueueWrite("{ \"closed\": "+closed+" }", path +".json", HTTPMethod.PATCH, projectId);
	}

	function writeHistoryEvent( event,  projectId){
		//enqueueWrite( event.json() , "/history/events/"+event.generateID()+".json", HTTPMethod.PATCH, projectId);
	
		//the following is to replace all enqueueWrite functions
		var ref = new Firebase('https://crowdcode2.firebaseio.com');
		var userRef = ref.child(projectId);
		usersRef.set("/history/events/"+events.generateID()+".json");
	}

	// Clears all data in the current project, reseting it to an empty, initial state
	function clear( projectID){
		writeDataAbsolute("{ \"" + projectID + "\" : null }","https://crowdcode2.firebaseio.com/projects/" + projectID + ".json", HTTPMethod.PUT);
	}

	// check if a project exists in firebase
	function existsProject(projectID){
		var payload = readDataAbsolute("https://crowdcode2.firebaseio.com/clientRequests/" + projectID + ".json");
		return !payload.equals("null");
	}

	// check if the client request for a given projectId exists in firebase
	function existsClientRequest(projectID){
		var payload = readDataAbsolute("https://crowdcode2.firebaseio.com/clientRequests/" + projectID + ".json");
		return !payload.equals("null");
	}

	




}
