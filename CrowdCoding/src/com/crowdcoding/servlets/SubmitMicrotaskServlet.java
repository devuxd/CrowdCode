package com.crowdcoding.servlets;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.util.HashMap;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Project;
import com.crowdcoding.microtasks.DisputeUnitTestFunction;
import com.crowdcoding.microtasks.Microtask;
import com.crowdcoding.microtasks.ReuseSearch;
import com.crowdcoding.microtasks.SketchFunction;
import com.crowdcoding.microtasks.DebugTestFailure;
import com.crowdcoding.microtasks.WriteCall;
import com.crowdcoding.microtasks.WriteEntrypoint;
import com.crowdcoding.microtasks.WriteFunctionDescription;
import com.crowdcoding.microtasks.WriteTest;
import com.crowdcoding.microtasks.WriteTestCases;
import com.crowdcoding.microtasks.WriteUserStory;
import com.crowdcoding.util.Util;
import com.google.appengine.api.users.UserServiceFactory;

@SuppressWarnings("serial")
public class SubmitMicrotaskServlet extends HttpServlet 
{
	private static HashMap<String, Class> microtaskTypes = new HashMap<String, Class>();
	
	static
	{
		// Every microtask MUST be registered here, mapping its name to its class.
		// Microtasks are listed in alphabetical order.
		microtaskTypes.put("disputeunittestfunction", DisputeUnitTestFunction.class);
		microtaskTypes.put("ReuseSearch", ReuseSearch.class);
		microtaskTypes.put("sketchfunction", SketchFunction.class);
		microtaskTypes.put("DebugTestFailure", DebugTestFailure.class);
		microtaskTypes.put("WriteCall", WriteCall.class);
		microtaskTypes.put("writeentrypoint", WriteEntrypoint.class);
		microtaskTypes.put("WriteFunctionDescription", WriteFunctionDescription.class);
		microtaskTypes.put("writetest", WriteTest.class);
		microtaskTypes.put("writetestcases", WriteTestCases.class);
		microtaskTypes.put("writeuserstory", WriteUserStory.class);
	}	
	
	// Notify the server that a microtask has been completed. 
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException 
	{
	    Project project = Project.Create();
		
		String payload = Util.convertStreamToString(req.getInputStream());
		System.out.println(payload);
				
		long microtaskID = Long.parseLong(req.getParameter("id"));
		
		Worker worker = Worker.Create(UserServiceFactory.getUserService().getCurrentUser());
		
		String type = req.getParameter("type");
		Class microtaskType = microtaskTypes.get(type);
		if (microtaskType == null)
			throw new RuntimeException("Error - " + type + " is not registered as a microtask type.");
		
		Microtask microtask = (Microtask) ofy().load().type(microtaskType).id(microtaskID).get();
		microtask.submit(payload, worker, project);		
	}
}
