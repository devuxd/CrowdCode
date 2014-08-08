package com.crowdcoding.util;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

import com.crowdcoding.Project;
import com.crowdcoding.dto.firebase.FunctionInFirebase;
import com.crowdcoding.dto.firebase.LeaderboardEntry;
import com.crowdcoding.dto.firebase.MicrotaskInFirebase;
import com.crowdcoding.dto.firebase.TestInFirebase;
import com.google.appengine.api.urlfetch.HTTPMethod;
import com.google.appengine.api.urlfetch.HTTPRequest;
import com.google.appengine.api.urlfetch.HTTPResponse;
import com.google.appengine.api.urlfetch.URLFetchService;
import com.google.appengine.api.urlfetch.URLFetchServiceFactory;

/* Wrapper service that handles all interactions with Firebase, providing an API
 * for interacting with Firebase that hides all its implementation details.
 */
public class FirebaseService 
{
	// Writes the specified microtask to firebase
	public static void writeMicrotask(MicrotaskInFirebase dto, long microtaskID, Project project)
	{
		writeData(dto.json(), "/microtasks/" + microtaskID + ".json", HTTPMethod.PUT, project); 
	}	
	
	// Writes information about microtask assignment to Firebase
	public static void writeMicrotaskAssigned(long microtaskID, String workerID, Project project, boolean assigned)
	{
		writeData(Boolean.toString(assigned), "/microtasks/" + microtaskID + "/assigned.json", HTTPMethod.PUT, project); 
		writeData(workerID, "/microtasks/" + microtaskID + "/workerID.json", HTTPMethod.PUT, project); 
	}
	
	// Marks a microtask as being ready in Firebase
	public static void writeMicrotaskReady(long microtaskID, Project project)
	{
		writeData("true", "/microtasks/" + microtaskID + "/ready.json", HTTPMethod.PUT, project); 
	}	
	
	// Stores the specified function to Firebase
	public static void writeFunction(FunctionInFirebase dto, long functionID, Project project)
	{
		writeData(dto.json(), "/artifacts/functions/" + functionID + ".json", HTTPMethod.PUT, project); 
	}
	
	// Stores the specified function to Firebase
	public static void writeTest(TestInFirebase dto, long testID, Project project)
	{
		writeData(dto.json(), "/artifacts/tests/" + testID + ".json", HTTPMethod.PUT, project); 
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
		writeData(Integer.toString(points), "/workers/" + workerID + "/score.json", HTTPMethod.PUT, project);
		LeaderboardEntry leader = new LeaderboardEntry(points, workerDisplayName);
		writeData(leader.json(), "/leaderboard/leaders/" + workerID + ".json", HTTPMethod.PUT, project);
	}
	
	public static void writeWorker(String workerID, String workerDisplayName, Project project)
	{
		writeData(workerID, "/workers/" + workerID + "/workerID.json", HTTPMethod.PUT, project);
		writeData(workerDisplayName, "/workers/" + workerID + "/displayName.json", HTTPMethod.PUT, project);
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
			fetchService.fetchAsync(request);
		} 
		catch (MalformedURLException e) {
		    // ...
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
