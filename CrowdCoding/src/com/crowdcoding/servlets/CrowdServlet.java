package com.crowdcoding.servlets;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

import javax.jdo.PersistenceManager;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.io.IOUtils;

import com.crowdcoding.commands.Command;
import com.crowdcoding.commands.ProjectCommand;
import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.Function;
import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.Test;
import com.crowdcoding.entities.UserPicture;
import com.crowdcoding.entities.Worker;
import com.crowdcoding.entities.microtasks.DebugTestFailure;
import com.crowdcoding.entities.microtasks.MachineUnitTest;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.entities.microtasks.ReuseSearch;
import com.crowdcoding.entities.microtasks.Review;
import com.crowdcoding.entities.microtasks.WriteCall;
import com.crowdcoding.entities.microtasks.WriteFunction;
import com.crowdcoding.entities.microtasks.WriteFunctionDescription;
import com.crowdcoding.entities.microtasks.WriteTest;
import com.crowdcoding.entities.microtasks.WriteTestCases;
import com.crowdcoding.util.Util;
import com.google.appengine.api.datastore.Blob;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.ObjectifyService;
import com.googlecode.objectify.Work;

@SuppressWarnings("serial")
public class CrowdServlet extends HttpServlet 
{
	private static HashMap<String, Class> microtaskTypes = new HashMap<String, Class>();
	
	static
	{
		// Every microtask MUST be registered here, mapping its name to its class.
		// Microtasks are listed in alphabetical order.
		microtaskTypes.put("ReuseSearch", ReuseSearch.class);
		microtaskTypes.put("Review", Review.class);
		microtaskTypes.put("WriteFunction", WriteFunction.class);
		microtaskTypes.put("DebugTestFailure", DebugTestFailure.class);
		microtaskTypes.put("MachineUnitTest", MachineUnitTest.class);
		microtaskTypes.put("WriteCall", WriteCall.class);
		microtaskTypes.put("WriteFunctionDescription", WriteFunctionDescription.class);
		microtaskTypes.put("WriteTest", WriteTest.class);
		microtaskTypes.put("WriteTestCases", WriteTestCases.class);
		

		microtaskTypes.put("WriteFunction", WriteFunction.class);
		
		// Must register ALL entities and entity subclasses here.
		// And embedded classes are also not registered.
		ObjectifyService.register(Worker.class);
		ObjectifyService.register(Artifact.class);
		ObjectifyService.register(Function.class);
		ObjectifyService.register(Project.class);
		ObjectifyService.register(Test.class);
		ObjectifyService.register(UserPicture.class);
		
		ObjectifyService.register(Microtask.class);
		ObjectifyService.register(ReuseSearch.class);
		ObjectifyService.register(Review.class);		
		ObjectifyService.register(WriteFunction.class);
		ObjectifyService.register(DebugTestFailure.class);
		ObjectifyService.register(MachineUnitTest.class);
		ObjectifyService.register(WriteCall.class);
		ObjectifyService.register(WriteFunctionDescription.class);
		ObjectifyService.register(WriteTest.class);
		ObjectifyService.register(WriteTestCases.class);
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
		 * Not using Chrome - browserCompat.html		 
		 * Not logged in - AppEngine login service
		 *  /user/picture/change - doChangePicture
		 *  /user/picture - doChangePicture
		 *  /<project> - mainpage.jsp
		 *  /<project>/admin - admin.jsp
		 *  /<project>/admin/* - doAdmin
		 *  /<project>/fetch - doFetch		   
		 *  /<project>/history - history.jsp
		 *  /<project>/logout/[workerID] - doLogout
		 *  /<project>/run - run.jsp
		 *  /<project>/submit - doSubmit
		 *  /<project>/welcome - welcome.jsp
		 *  /clientRequest - ClientRequestEditor.jsp
		 *  /welcome.jsp
		 *  /superadmin - SuperAdmin.jsp
		 */
        String[] path = req.getPathInfo().split("/");
				
		UserService userService = UserServiceFactory.getUserService();
        User user = userService.getCurrentUser();  
		
    	try 
    	{	        
    		
    		// First check the browser. If the browser is not Chrome, redirect to a browser
    		// compatability page.
//    		if (!req.getHeader("User-Agent").contains("Chrome"))
//    			req.getRequestDispatcher("/html/browserCompat.html").forward(req, resp);
//    		else
//    		{    	
    			// Next check if the user is logged in by checking if we have a user object for them.
		        if (user != null) 
		        {
		        		
					// First token will always be empty (portion before the first slash)
					if (path.length == 0)
						req.getRequestDispatcher("/html/welcome.jsp").forward(req, resp);
					else if(req.getPathInfo().equals("/user/picture/change")) 
						doChangePicture(user,req,resp);
					else if(req.getPathInfo().equals("/user/picture")) 
						getPicture(req,resp);
					else
					{

						req.setAttribute("project", path[1]);
						String projectID = path[1];
						
			    		

						// check first for non-project pages routing
						if (path[1].equals("clientRequest"))
						{	
							req.getRequestDispatcher("/html/ClientRequestEditor.jsp").forward(req, resp);	
						}					
						else if (path[1].equals("superadmin"))
						{	
							req.getRequestDispatcher("/html/SuperAdmin.jsp").forward(req, resp); 
						}					
						// now check for project pages (only if project exists)
						else if( ofy().load().filterKey(Key.create(Project.class, projectID)).keys().first() != null ){
							// if is requested the main page
							if(path.length==2) {
								
								// CREATE THE CROWD USER - IS NOT THE RIGHT POSITION TO DO THIS
								Worker crowdUser = Worker.Create(UserServiceFactory.getUserService().getCurrentUser(), Project.Create(projectID));
								
								if(req.getParameter("distributedJS")!=null)
									if(req.getParameter("distributedJS").equals("admin"))
										req.getRequestDispatcher("/html/distributedJSAdmin.jsp").forward(req, resp);
									else
										req.getRequestDispatcher("/html/distributedJSWorker.jsp").forward(req, resp);
								else if(req.getParameter("oldLayout")!=null)
									req.getRequestDispatcher("/html/newLayout.jsp").forward(req, resp);
								else
									req.getRequestDispatcher("/html/angular.jsp").forward(req, resp);
							
							
							} else {
								// if are requested secondary pages
								String action = path[2];
								if (action.equals("fetch"))					
									doFetch(req, resp, projectID, user);
								else if (action.equals("submit"))
									doSubmit(req, resp);
								else if (action.equals("testResult"))
									doSubmitTestResult(req, resp, projectID);
								else if (action.equals("logout"))					
									doLogout(projectID, path[3]);
								else if (action.equals("admin") && path.length == 3)
					        		req.getRequestDispatcher("/html/admin.jsp").forward(req, resp);
								else if (action.equals("history") && path.length == 3)
					        		req.getRequestDispatcher("/html/history.jsp").forward(req, resp);
								else if (action.equals("admin") && path.length > 3)
									doAdmin(req, resp, projectID, path);
								else if (action.equals("run"))
					        		req.getRequestDispatcher("/html/run.jsp").forward(req, resp);
								else if (action.equals("welcome"))
					        		req.getRequestDispatcher("/html/welcome.jsp").forward(req, resp);
							}
						} else {
							// not found
							req.getRequestDispatcher("/html/404.jsp").forward(req, resp);
						}
					}								
		        } 
		        else 
		        {
		        	// If not, either let them login if they have a project specified or else
		        	// send them to the welcome page if not.
		        	if (path.length > 1)	        	        	
		        		resp.sendRedirect(userService.createLoginURL("/" + path[1]));	        	
		        	else	        	
						req.getRequestDispatcher("/html/welcome.jsp").forward(req, resp);	        	
		        }
    		//}
		} catch (ServletException e) {
			e.printStackTrace();
		} catch (FileUploadException e) {
			// TODO Auto-generated catch block
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
		
	    final StringBuilder output = new StringBuilder();	
	    final Date currentTime = new Date();
	    
		if (command.equals("RESET"))
		{
			output.append("RESET executed at " + currentTime.toString() + "<BR>");
			Project.Clear(projectID);
			output.append("Project successfully reset to default state.<BR>");
			
			List<Command> commands = new ArrayList<Command>();
			commands.addAll(ofy().transact(new Work<List<Command>>() {
		        public List<Command> run()
		        {
	    			CommandContext context = new CommandContext();	
	    			Project.Construct(projectID);
	    			output.append("New project successfully constructed.<BR>"); 
		        	
					return context.commands(); 
		        }
		    }));
			
			executeCommands(commands, projectID);	
		}	
		else if (command.equals("REVIEWS ON"))
		{
			output.append("REVIEWS ON executed at " + currentTime.toString() + "<BR>");
			
			List<Command> commands = new ArrayList<Command>();
			commands.addAll(ofy().transact(new Work<List<Command>>() {
		        public List<Command> run()
		        {
	    			CommandContext context = new CommandContext();	
	    			ProjectCommand.enableReviews(true);
	    			output.append("Reviews successfully set to on.<BR>"); 
		        	
					return context.commands(); 
		        }
		    }));
			
			executeCommands(commands, projectID);	
		}
		else if (command.equals("REVIEWS OFF"))
		{
			output.append("REVIEWS OFF executed at " + currentTime.toString() + "<BR>");
			
			List<Command> commands = new ArrayList<Command>();
			commands.addAll(ofy().transact(new Work<List<Command>>() {
		        public List<Command> run()
		        {
	    			CommandContext context = new CommandContext();	
	    			ProjectCommand.enableReviews(false);
	    			output.append("Reviews successfully set to off.<BR>"); 
		        	
					return context.commands(); 
		        }
		    }));
			
			executeCommands(commands, projectID);	
		}
		else
		{
			output.append("Unrecognized command " + command);
		}
				
		output.append("<BR>");

	    writeResponseString(resp, output.toString());	    
	}	

	// changes user picture
	private void doChangePicture(User user, HttpServletRequest req, HttpServletResponse res) throws IOException, FileUploadException {
		// Get the image representation
	    ServletFileUpload upload = new ServletFileUpload();
	    FileItemIterator iter = upload.getItemIterator(req);
	    FileItemStream imageItem = iter.next();
	    InputStream imgStream = imageItem.openStream();


	    Blob imageBlob = new Blob(IOUtils.toByteArray(imgStream));
	    
	    // if image size > 0 bytes
	    if(imageBlob.getBytes().length>0){
	    	
		    //retrieve picture object if exists or instantiate a new one
		    UserPicture picture = ofy().load().key(Key.create(UserPicture.class, user.getUserId())).get();
		    if(picture == null) 
		    	picture = new UserPicture(user.getUserId());

		    picture.setImage(imageBlob);
		    
		    // persist image
		    ofy().save().entity(picture).now();
		    
		    // print success
		    res.setContentType("text/plain");
		    res.getWriter().append("success");
		    
	    } else {

		    // print fail
		    res.setContentType("text/plain");
		    res.getWriter().append("fail");
	    }
	    
	}
	
	// process test result submit
	private void doSubmitTestResult(final HttpServletRequest req, final HttpServletResponse resp, String projectID) throws IOException, FileUploadException {
		
		final boolean result  = Boolean.parseBoolean(req.getParameter("result"));
		final long functionID = Long.parseLong(req.getParameter("functionID"));
		//final long testID     = Long.parseLong(req.getParameter("testID"));

		/*
		// SEND 503 error if some of the parameter are null
		if( ){
			resp.sendError(503); 
		}
		*/
		
		List<Command> commands = new ArrayList<Command>();
		commands.addAll(ofy().transact(new Work<List<Command>>() {
	        public List<Command> run()
	        {
    			CommandContext context = new CommandContext();	
    			if(result)
    				FunctionCommand.passedTests(functionID);
    			else
    				FunctionCommand.failedTests(functionID);
    			
				return context.commands(); 
	        }
	    }));
		
		executeCommands(commands, projectID);	
	}
	
	// get user picture
	private void getPicture(HttpServletRequest req, HttpServletResponse res) throws IOException, ServletException {
		//retrieve request GET parameter userId and retrieve picture
		String userId = req.getParameter("userId");
		UserPicture picture = (userId==null)?null:ofy().load().key(Key.create(UserPicture.class, userId)).get();
		
		if(userId==null || picture ==null){
			req.getRequestDispatcher("/img/40x40.gif").forward(req, res);
		} else {
		    res.setContentType("image/jpeg");
		    res.getOutputStream().write(picture.getImage().getBytes());
		}

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
			final String workerID = UserServiceFactory.getUserService().getCurrentUser().getUserId();		
			final long microtaskID = Long.parseLong(req.getParameter("id"));
			final boolean skip = Boolean.parseBoolean(req.getParameter("skip"));			
			final String type = req.getParameter("type");
			final String payload = Util.convertStreamToString(req.getInputStream());
			
			Class microtaskType = microtaskTypes.get(type);
			if (microtaskType == null)
				throw new RuntimeException("Error - " + type + " is not registered as a microtask type.");
			
			// Create an initial context, then build a command to skip or submit
			CommandContext context = new CommandContext();	
			
			// Create the skip or submit commands
			if (skip)
				ProjectCommand.skipMicrotask(microtaskID, workerID);
			else			
				ProjectCommand.submitMicrotask(microtaskID, microtaskType, payload, workerID);
					
			// Copy the command back out the context to initially populate the command queue.
			executeCommands(context.commands(), projectID);			       
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
	    final Long microtaskID = ofy().transact(new Work<Long>() {
            public Long run()
            {                	
            	Project project = Project.Create(projectID); 
            	String workerID = user.getUserId();
            	String workerHandle = user.getNickname();
            	
            	// If the user does not have a microtask assigned, get them a microtask.
            	Long microtaskID = project.lookupMicrotaskAssignment(workerID);
            	if (microtaskID == null)
            	{
            		System.out.println("Assigning worker " + workerHandle + " a microtask");
            		microtaskID = project.assignMicrotask(workerID, workerHandle);
            	}
            	else
            	{
            		System.out.println("Worker " + workerHandle + " already has a microtask");
            	}
            		
            	return microtaskID;
            }
        });
	    
    	// Load the microtask
	    Microtask microtask = null;	    
	    if (microtaskID != null)
	    {
		    microtask = ofy().transact(new Work<Microtask>() {
	            public Microtask run()
	            {    
	            	Key<Microtask> microtaskKey = Key.create(Key.create(Project.class, projectID), 
	            			Microtask.class, microtaskID);
	        		return ofy().load().key(microtaskKey).get();	
	            }
		    });	    	
	    }	    
            
    	// If there are no microtasks available, send an empty response. Otherwise, redirect
    	// to microtask UI.
    	try
    	{
    		// IF IS AN AJAX REQUEST RETURN JSON {microtaskId:id}
    		if(req.getParameter("AJAX")!=null)
    		{
    			// prepare the json content type
    			resp.setContentType("application/json");
    			PrintWriter out = resp.getWriter();
    			
    			if (microtask == null) {
    				resp.sendError(404); 
    				
    			} 
    			else{
    				out.print(microtask.toJSON());
        			out.flush();
    			}
        
    			
    			
    		}
    		else
    			if (microtask == null)
	        	{
	        		req.getRequestDispatcher("/html/nomicrotask.jsp").forward(req, resp);
	        	}
	        	else
	        	{
	        		this.getServletContext().setAttribute("microtask", microtask);        		
	        		req.getRequestDispatcher(microtask.getUIURL()).forward(req,  resp);        		
	        	}        	
    	}
    	catch (ServletException e) {
			e.printStackTrace();
		}                      		        	
	}
	
	// Logs out the specified user from the service
	public void doLogout(final String projectID, final String userID) 
	{
		if (userID == null || userID.length() == 0)
			return;
			
		CommandContext context = new CommandContext();	    		
		ProjectCommand.logoutWorker(userID);    		
		executeCommands(context.commands(), projectID);   
		
		System.out.println("Logged out " + userID);
	}
	
	// Executes all of the specified commands and any commands that may subsequently be generated
	private void executeCommands(List<Command> commands, final String projectID)
	{
		Queue<Command> commandQueue = new LinkedList<Command>(commands);
				
		// Execute commands until done, adding commands as created.
        while(!commandQueue.isEmpty())
        {
        	final Command command = commandQueue.remove();
        	commandQueue.addAll(ofy().transact(new Work<List<Command>>() {
	            public List<Command> run()
	            {
            	    Project project = Project.Create(projectID);					
					CommandContext context = new CommandContext();							
					command.execute(project);					
											
					project.publishHistoryLog();						
					return context.commands(); 
	            }
	        }));
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