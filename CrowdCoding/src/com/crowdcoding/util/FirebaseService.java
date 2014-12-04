package com.crowdcoding.util;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Date;
import java.util.List;
import java.util.concurrent.Future;

import com.crowdcoding.dto.ReviewDTO;
import com.crowdcoding.dto.firebase.FunctionInFirebase;
import com.crowdcoding.dto.firebase.LeaderboardEntry;
import com.crowdcoding.dto.firebase.MicrotaskInFirebase;
import com.crowdcoding.dto.firebase.QueueInFirebase;
import com.crowdcoding.dto.firebase.TestInFirebase;
import com.crowdcoding.entities.Function;
import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.microtasks.Microtask;
import com.google.appengine.api.urlfetch.HTTPMethod;
import com.google.appengine.api.urlfetch.HTTPRequest;
import com.google.appengine.api.urlfetch.HTTPResponse;
import com.google.appengine.api.urlfetch.URLFetchService;
import com.google.appengine.api.urlfetch.URLFetchServiceFactory;
import com.googlecode.objectify.Key;

/* Wrapper service that handles all interactions with Firebase, providing an API
 * for interacting with Firebase that hides all its implementation details.
 */
public class FirebaseService
{
	// Writes the specified microtask to firebase
	public static void writeMicrotaskCreated(MicrotaskInFirebase dto, String microtaskKey, Project project)
	{
		writeData(dto.json(), "/microtasks/" + microtaskKey + ".json", HTTPMethod.PUT, project);

		// Since microtaskIDs increase consequentively and start at 1, we can update the total number of microtasks
		// to be microtaskID.
		// the microtask key is in the format "artifactNumber-microtask count"
		String microtakCount = microtaskKey.split("-")[1];
		writeData( microtakCount, "/status/microtaskCount.json", HTTPMethod.PUT, project);
		System.out.println("write microtask");
	}

	// Writes information about microtask assignment to Firebase
	public static void writeMicrotaskAssigned( String microtaskKey, String workerID,
			String workerHandle, Project project, boolean assigned)
	{
		writeData(Boolean.toString(assigned), "/microtasks/" + microtaskKey + "/assigned.json", HTTPMethod.PUT, project);
		writeData("{\"workerHandle\": \"" + workerHandle + "\"}", "/microtasks/" + microtaskKey + ".json", HTTPMethod.PATCH, project);
	}
	// Writes information about an old microtask to retrieve the information to Firebase
	public static void writeMicrotaskReissuedFrom( String microtaskKey, Project project, String reissuedFromMicrotaskKey)
	{

		writeData("{\"reissuedFrom\": \"" + reissuedFromMicrotaskKey + "\"}", "/microtasks/" + microtaskKey + ".json", HTTPMethod.PATCH, project);

	}

	public static void writeTestJobQueue(long functionID, Project project)
	{
		Date date = new Date();
		System.out.println("appending test job for function "+functionID);
		writeData("{\"functionId\": \"" + functionID + "\"}", "/status/testJobQueue/"+date.getTime()+".json", HTTPMethod.PUT, project);
	}

	public static boolean isWorkerLoggedIn(String workerID,Project project){
		String absoluteUrl = getBaseURL(project) + "/status/loggedInWorkers/" + workerID + ".json";
		String result = readDataAbsolute( absoluteUrl );

		if (result == null || result.equals("null"))
			return false;

		return true;
	}

	public static void writeWorkerLoggedIn(String workerID, String workerDisplayName, Project project)
	{
		writeData("{\"workerHandle\": \"" + workerDisplayName + "\"}", "/status/loggedInWorkers/" + workerID + ".json", HTTPMethod.PUT, project);
	}

	public static void writeWorkerLoggedOut(String workerID, Project project)
	{
		writeData("", "/status/loggedInWorkers/" + workerID + ".json", HTTPMethod.DELETE, project);
	}

	public static void writeMicrotaskQueue(QueueInFirebase dto, Project project)
	{
		writeData(dto.json(), "/status/microtaskQueue.json", HTTPMethod.PUT, project);
	}

	public static void writeReviewQueue(QueueInFirebase dto, Project project)
	{
		System.out.println("Current review queue: " + dto.json());
		writeData(dto.json(), "/status/reviewQueue.json", HTTPMethod.PUT, project);
	}

	// Stores the specified function to Firebase
	public static void writeFunction(FunctionInFirebase dto, long functionID, int version, Project project)
	{
		writeData(dto.json(), "/artifacts/functions/" + functionID + ".json", HTTPMethod.PUT, project);
		writeData(dto.json(), "/history/artifacts/functions/" + functionID + "/" + version + ".json", HTTPMethod.PUT, project);
	}

	// Stores the specified test to Firebase
	public static void writeTest(TestInFirebase dto, long testID, int version, Project project)
	{
		writeData(dto.json(), "/artifacts/tests/" + testID + ".json", HTTPMethod.PUT, project);
		writeData(dto.json(), "/history/artifacts/tests/" + testID + "/" + version + ".json", HTTPMethod.PUT, project);
	}

	// Deletes the specified test in Firebase
	public static void deleteTest(long testID, Project project)
	{
		writeData("", "/artifacts/tests/" + testID + ".json", HTTPMethod.DELETE, project);
	}

	// Stores the specified review to firebase
	public static void writeReview(ReviewDTO dto, String microtaskKey , Project project)
	{
		writeData(dto.json(), "/microtasks/" + microtaskKey + "/review.json", HTTPMethod.PUT, project);
	}

	// Reads the ADTs for the specified project. If there are no ADTs, returns an empty string.
	public static String readADTs(Project project)
	{
		String result = readDataAbsolute("https://crowdcode.firebaseio.com/clientRequests/" + project.getID()
				+ "/ADTs.json");
		if (result == null || result.equals("null"))
			result = "";
		return result;
	}

	// Copies the specified ADTs from the client request into the project
	public static void copyADTs(Project project)
	{
		String adts = readDataAbsolute("https://crowdcode.firebaseio.com/clientRequests/" + project.getID()
				+ "/ADTs.json");
		if (adts == null || adts.equals("null"))
			adts = "";

		System.out.println("ADTs for copy:" + adts);
		writeData(adts, "/ADTs.json", HTTPMethod.PUT, project);
	}

	// Reads the functions for the specified project. If there are no functions, returns an empty string.
	public static String readClientRequestFunctions(Project project)
	{
		String result = readDataAbsolute("https://crowdcode.firebaseio.com/clientRequests/" + project.getID()
				+ "/functions.json");
		if (result == null || result.equals("null"))
			result = "";
		return result;
	}

	public static void setPoints(String workerID, String workerDisplayName, int points, Project project)
	{
		System.out.println("SETTING POINTS TO "+workerID);
		writeData(Integer.toString(points), "/workers/" + workerID + "/score.json", HTTPMethod.PUT, project);
		LeaderboardEntry leader = new LeaderboardEntry(points, workerDisplayName);
		writeData(leader.json(), "/leaderboard/leaders/" + workerID + ".json", HTTPMethod.PUT, project);
	}

	public static String readStat(String workerID, String label, Project project){
//		String result = readDataAbsolute(getBaseURL(project)  + "/workers/" + workerID + "/stats/"+label+".json");
//
//		System.out.println("Stat absolute url="+getBaseURL(project) + "/workers/" + workerID + "/stats/"+label+".json");
//		if (result == null || result.equals("null")){
//			System.out.println("result of read stat is null ");
//			result = "0";
//		}
//		return result;
		return "0";
	}

	public static void setStat(String workerID, String label, String value, Project project)
	{
//		writeData(value, "/workers/" + workerID + "/stats/"+label+".json", HTTPMethod.PUT, project);
	}

	public static void increaseStatBy(String workerID, String label, int increaseAmount, Project project){
//		String stringValue = readStat(workerID,label,project);
//		Integer actualValue = Integer.parseInt(stringValue);
//		Integer value = actualValue + increaseAmount ;
//		System.out.println("Increase stat '"+label+"' from "+actualValue+" to "+value+" for "+workerID);
//		setStat(workerID,label,value.toString(),project);
	}


	// Posts the specified JSON message to the specified workers newsfeed
	public static void postToNewsfeed(String workerID, String message, Project project)
	{
		writeData(message, "/workers/" + workerID + "/newsfeed.json", HTTPMethod.POST, project);
	}

	// Publishes the history log
	public static void publishHistoryLog(List<Pair<String, String>> list, Project project)
	{
		for (Pair<String, String> idAndMessage : list)
			writeData(idAndMessage.b, "/history/events/" + idAndMessage.a + ".json", HTTPMethod.PUT, project);
	}

	// Clears all data in the current project, reseting it to an empty, initial state
	public static void clear(String projectID)
	{
		// set the root of the project to null.
		writeDataAbsolute("{ \"" + projectID + "\" : null }",
				"https://crowdcode.firebaseio.com/projects/" + projectID + ".json", HTTPMethod.PUT);
	}
	// check if a project exists in firebase
	public static boolean existsProject(String projectID)
	{
		// set the root of the project to null.
		String payload = readDataAbsolute("https://crowdcode.firebaseio.com/clientRequests/" + projectID + ".json");
		//System.out.println(payload);
		return !payload.equals("null");
	}

	// check if a project exists in firebase
	public static boolean existsClientRequest(String projectID)
	{
		// set the root of the project to null.
		String payload = readDataAbsolute("https://crowdcode.firebaseio.com/clientRequests/" + projectID + ".json");
		//System.out.println(payload);
		return !payload.equals("null");
	}

	// Writes the specified data using the URL, relative to the BaseURL.
	// Operation specifies the type of http request to make (e.g., PUT, POST, DELETE)
	private static void writeData(String data, String relativeURL, HTTPMethod operation, Project project)
	{
		writeDataAbsolute(data, getBaseURL(project) + relativeURL, operation);
	}

	// Writes the specified data using specified absolute URL asyncrhonously (does not block waiting on write).
	// Operation specifies the type of http request to make (e.g., PUT, POST, DELETE)
	private static void writeDataAbsolute(String data, String absoluteURL, HTTPMethod operation)
	{
		try
		{
			URLFetchService fetchService = URLFetchServiceFactory.getURLFetchService();
			HTTPRequest request = new HTTPRequest(new URL(absoluteURL), operation);
			request.setPayload(data.getBytes());
			Future<HTTPResponse> fetchAsync = fetchService.fetchAsync(request);

			// wait while fetchAsync is done
			//while( ! fetchAsync.isDone() );

		}
		catch (MalformedURLException e) {
			System.out.println("Malformed url: "+e);
		}
	}

	// Reads a JSON string from the specified absolute URL synchronously (blocks waiting on read to return).
	// Uses the GET operation to read the data.
	private static String readDataAbsolute(String absoluteURL)
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
	private static String getBaseURL(Project project)
	{
		return "https://crowdcode.firebaseio.com/projects/" + project.getID();
	}

}
