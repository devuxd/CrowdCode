package com.crowdcoding.servlets;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;
import java.util.HashMap;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.crowdcoding.Project;
import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Test;
import com.crowdcoding.microtasks.DebugTestFailure;
import com.crowdcoding.microtasks.DisputeUnitTestFunction;
import com.crowdcoding.microtasks.MachineUnitTest;
import com.crowdcoding.microtasks.Microtask;
import com.crowdcoding.microtasks.ReuseSearch;
import com.crowdcoding.microtasks.SketchFunction;
import com.crowdcoding.microtasks.WriteCall;
import com.crowdcoding.microtasks.WriteEntrypoint;
import com.crowdcoding.microtasks.WriteFunctionDescription;
import com.crowdcoding.microtasks.WriteTest;
import com.crowdcoding.microtasks.WriteTestCases;
import com.crowdcoding.microtasks.WriteUserStory;
import com.crowdcoding.util.Util;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.VoidWork;
import com.googlecode.objectify.Work;

@SuppressWarnings("serial")
public class CrowdServlet extends HttpServlet 
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
		microtaskTypes.put("MachineUnitTest", MachineUnitTest.class);
		microtaskTypes.put("WriteCall", WriteCall.class);
		microtaskTypes.put("writeentrypoint", WriteEntrypoint.class);
		microtaskTypes.put("WriteFunctionDescription", WriteFunctionDescription.class);
		microtaskTypes.put("writetest", WriteTest.class);
		microtaskTypes.put("writetestcases", WriteTestCases.class);
		microtaskTypes.put("writeuserstory", WriteUserStory.class);
	}	
	
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException 
	{
		doAction(req, resp);
	}
	
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException 
	{
		doAction(req, resp);
	}
	
	private void doAction(HttpServletRequest req, HttpServletResponse resp) throws IOException 
	{
		/* Dispatch requests as follows:
		 * Not logged in - AppEngine login service
		 *  /<project> - mainpage.jsp
		 *  /<project>/admin - admin.jsp
		 *  /<project>/admin/* - doAdmin
		 *  /<project>/fetch - doFetch		   
		 *  /<project>/history - history.jsp
		 *  /<project>/run - run.jsp
		 *  /<project/submit - doSubmit
		 *  /userStories - EditUserStories.jsp
		 *  /  - 404
		 */
        String[] path = req.getPathInfo().split("/");
				
		UserService userService = UserServiceFactory.getUserService();
        User user = userService.getCurrentUser();  
        
    	try 
    	{	        
	        if (user != null) 
	        {
				// First token will always be empty (portion before the first slash)
				if (path.length > 1)
				{
					req.setAttribute("project", path[1]);
					String projectID = path[1];
	
					if (path.length == 2)
					{
						if (path[1].equals("userStories"))
							req.getRequestDispatcher("/html/EditUserStories.jsp").forward(req, resp);						
						else
							req.getRequestDispatcher("/html/mainpage.jsp").forward(req, resp);
					}
					else
					{
						// Third token is action, fourth (or more) tokens are commands for action
						String action = path[2];
						if (action.equals("fetch"))					
							doFetch(req, resp, projectID, user);
						else if (action.equals("submit"))
							doSubmit(req, resp);
						else if (action.equals("admin") && path.length == 3)
			        		req.getRequestDispatcher("/html/admin.jsp").forward(req, resp);
						else if (action.equals("history") && path.length == 3)
			        		req.getRequestDispatcher("/html/history.jsp").forward(req, resp);
						else if (action.equals("admin") && path.length > 3)
							doAdmin(req, resp, projectID, path);
						else if (action.equals("run"))
			        		req.getRequestDispatcher("/html/run.jsp").forward(req, resp);
					}				
				}
				else				
					req.getRequestDispatcher("/html/welcome.html").forward(req, resp);					
	        } 
	        else 
	        {
	        	if (path.length > 1)	        	        	
	        		resp.sendRedirect(userService.createLoginURL("/" + path[1]));	        	
	        	else	        	
					req.getRequestDispatcher("/html/welcome.html").forward(req, resp);	        	
	        }
		} catch (ServletException e) {
			e.printStackTrace();
		}        
	}
	
	private void doAdmin(HttpServletRequest req, HttpServletResponse resp, 
			final String projectID, final String[] commandString) throws IOException 
	{
		// The command should be in the fourth position. If nothing exists there, 
		// use "" as the command.
		final String command;
		if (commandString.length >= 4)
			command = commandString[3].toUpperCase();
		else
			command = "";
		
	    // Actions that touch the project need to be in a transaction to ensure that the project
	    // is seen in a consistent state. And transactions may be retried, so they cannot mutate
	    // state other than that which can be reset. 
	    String responseText = ofy().transact(new Work<String>() {
	        public String run()
	        {
	    	    StringBuilder output = new StringBuilder();	
	    	    Date currentTime = new Date();
	    	    
	    		if (command.equals("RESET"))
	    		{
	    			output.append("RESET executed at " + currentTime.toString() + "<BR>");
	    			Project.Clear(projectID);
	    			output.append("Project successfully reset to default state.<BR>");
	    		}
	    		else if (command.equals("STATUS"))
	    		{
	      			output.append("STATUS executed at " + currentTime.toString() + "<BR>");
	    			Project project = Project.Create(projectID);
	    			output.append(Worker.StatusReport(project).replace("\n", "<BR>")); 
	    			output.append(Microtask.StatusReport(project).replace("\n", "<BR>"));    
	    			output.append(Function.StatusReport(project).replace("\n", "<BR>"));   
	    			output.append(Test.StatusReport(project).replace("\n", "<BR>"));   
	    		}   
	    		else
	    		{
	    			output.append("Unrecognized command " + command);
	    		}
	    		output.append("<BR>");
	        	
	        	return output.toString();
	        }
	    });
	
	    writeResponseString(resp, responseText);	    
	}	

	
	// Notify the server that a microtask has been completed. 
	public void doSubmit(final HttpServletRequest req, final HttpServletResponse resp) throws IOException 
	{
		// Collect information from the request parameter. Since the transaction may fail and retry,
		// anything that mutates the values of req and resp MUST be outside the transaction so it only occurs once.
		// And anything inside the transaction MUST not mutate the values produced.
    	try 
    	{		
    		final String projectID = (String) req.getAttribute("project");
			final long microtaskID = Long.parseLong(req.getParameter("id"));
			final boolean skip = Boolean.parseBoolean(req.getParameter("skip"));
			System.out.println("microtaskid: " + microtaskID);
			
			final String payload = Util.convertStreamToString(req.getInputStream());
			System.out.println("Submitted microtask: " + payload);
	
			final String type = req.getParameter("type");
				
	        ofy().transact(new VoidWork() {
	            public void vrun()
	            {
            	    Project project = Project.Create(projectID);					
					Worker worker = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), project);					
					Class microtaskType = microtaskTypes.get(type);
					if (microtaskType == null)
						throw new RuntimeException("Error - " + type + " is not registered as a microtask type.");
					
					Microtask microtask = ofy().load().key(Key.create(project.getKey(), Microtask.class, microtaskID)).get();
					if (skip)
						microtask.skip(worker, project);
					else
						microtask.submit(payload, worker, project);	
					project.publishStatistics();
					project.publishHistoryLog();
	            }            
	        });
    	}        
    	catch (IOException e)
    	{
    		e.printStackTrace();
    	}        
	}
	
	
	public void doFetch(final HttpServletRequest req, final HttpServletResponse resp, 
			final String projectID, final User user) throws IOException 
	{
		// Since the transaction may fail and retry,
		// anything that mutates the values of req and resp MUST be outside the transaction so it only occurs once.
		// And anything inside the transaction MUST not mutate the values produced.
	    Microtask microtask = ofy().transact(new Work<Microtask>() {
            public Microtask run()
            {                	
            	Project project = Project.Create(projectID);  
            	Worker crowdUser = Worker.Create(user, project);

            	// If the user does not have a microtask assigned, get them a microtask.
            	Microtask microtask = crowdUser.getMicrotask();
            	if (microtask == null)
            	{
            		System.out.println("Assigning worker " + crowdUser.getKey().toString() + " a microtask");
            		microtask = Microtask.Assign(crowdUser, project);
            	}
            	else
            	{
            		System.out.println("Worker " + crowdUser.getKey().toString() + " already has a microtask");
            	}
            		
            	return microtask;
            }
        });
            
    	// If there are no microtasks available, send an empty response. Otherwise, redirect
    	// to microtask UI.
    	try
    	{
        	if (microtask == null)
        		req.getRequestDispatcher("/html/nomicrotask.jsp").forward(req, resp);	
        	else        	
        		req.getRequestDispatcher(microtask.getUIURL()).forward(req,  resp);
    	}
    	catch (ServletException e) {
			e.printStackTrace();
		}                      		        	
	}
	
	
	// Writes the specified html message to resp, wrapping it in an html page
	private void writeResponseString(HttpServletResponse resp, String message) throws IOException
	{
		// Setup the response
		resp.setContentType("text/html");
	    PrintWriter out = resp.getWriter();
	    out.println("<html>");
	    out.println("<head>");
	    out.println("<title>CrowdCoding</title>");
	    out.println("</head>");
	    out.println("<body>");
	    out.println(message);        
	    out.println("</body>");
	    out.println("</html>");
		out.flush();  			
	}
}