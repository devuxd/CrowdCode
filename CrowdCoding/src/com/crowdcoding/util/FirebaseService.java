package com.crowdcoding.util;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

import com.crowdcoding.Project;
import com.google.appengine.api.urlfetch.HTTPMethod;
import com.google.appengine.api.urlfetch.HTTPRequest;
import com.google.appengine.api.urlfetch.URLFetchService;
import com.google.appengine.api.urlfetch.URLFetchServiceFactory;

/* Wrapper service that handles all interactions with Firebase, providing an API
 * for interacting with Firebase that hides all its implementation details.
 */
public class FirebaseService 
{
	public static void updateLeaderboard(String message, Project project)	
	{
		writeData(message, "/leaderboard.json", HTTPMethod.PUT, project);
	}
	
	public static void setPoints(String workerID, int points, Project project)
	{
		writeData(Integer.toString(points), "/workers/" + workerID + "/score.json", HTTPMethod.PUT, project);
	}
	
	// Posts the specified JSON message to the specified workers newsfeed
	public static void postToNewsfeed(String workerID, String message, Project project)
	{
		writeData(message, "/workers/" + workerID + "/newsfeed.json", HTTPMethod.POST, project);		
	}
	
	// Publishes the specified statistics
	public static void publishStatistics(String message, Project project)
	{
		writeData(message, "/statistics.json", HTTPMethod.PUT, project); 
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
	
	public static void readSomeData()
	{
		 /*try 
		 {
			 URL url = new URL("http://www.example.com/atom.xml");
			 BufferedReader reader = new BufferedReader(new InputStreamReader(url.openStream()));
			 String output = reader.
		
			 while ((line = reader.readLine()) != null) 
			 {
				 	
			 }
		    reader.close();
		
		 } 
		 catch (MalformedURLException e) {
			 System.out.println(e.toString());
		 } catch (IOException e) {
			 System.out.println(e.toString());
		 }
		
		*/		
	}
	
	// Writes the specified data using the URL, relative to the BaseURL.
	// Operation specifies the type of http request to make (e.g., PUT, POST, DELETE)
	private static void writeData(String data, String relativeURL, HTTPMethod operation, Project project)
	{
		writeDataAbsolute(data, getBaseURL(project) + relativeURL, operation);
	}
			
	// Writes the specified data using specified absolute URL.
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
	
	// Gets the base URL for the current deployment project 
	private static String getBaseURL(Project project)
	{
		return "https://crowdcode.firebaseio.com/projects/" + project.getID();
	}
}
