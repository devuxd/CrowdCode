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
import java.util.regex.Pattern;

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
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.entities.microtasks.ReuseSearch;
import com.crowdcoding.entities.microtasks.Review;
import com.crowdcoding.entities.microtasks.WriteCall;
import com.crowdcoding.entities.microtasks.WriteFunction;
import com.crowdcoding.entities.microtasks.WriteFunctionDescription;
import com.crowdcoding.entities.microtasks.WriteTest;
import com.crowdcoding.entities.microtasks.WriteTestCases;
import com.crowdcoding.util.FirebaseService;
import com.crowdcoding.util.Util;
import com.google.appengine.api.datastore.Blob;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.ObjectifyService;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.Work;
import com.googlecode.objectify.cmd.Query;
import com.googlecode.objectify.cmd.QueryKeys;

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
		// retrieve the current user
		UserService userService = UserServiceFactory.getUserService();
        User user = userService.getCurrentUser();

		// retrieve the path and split by separator '/'
		String   path    = req.getPathInfo();
		String[] pathSeg = path.split("/");
		try {
			// -- PATHS WITHOUT USER AUTHENTICATION
			 if(Pattern.matches("/welcome",path)){
				req.getRequestDispatcher("/html/welcome.jsp").forward(req, resp);
			 } else if(Pattern.matches("/user/info",path)){
				req.getRequestDispatcher("/html/userInfo.jsp").forward(req, resp);
			 }

			// PATHS WITH USER AUTHENTICATION
			 else if ( user != null ) { // if the user is authenticated

				// PAGES URLS
				if(Pattern.matches("/clientRequest",path)){
					req.getRequestDispatcher("/html/client_request.html").forward(req, resp);
				}
				// USERS URLS
				else if(Pattern.matches("/user/[\\w]*",path)){
					doUser(req,resp,user,pathSeg);
				}
				// SUPERADMIN URLS
				else if(Pattern.matches("/_admin/[\\w]*",path)){
					req.getRequestDispatcher("/html/SuperAdmin.jsp").forward(req, resp);
				}
				// PROJECT URLS match /word/ or /word/(word)*
				else if(Pattern.matches("/[\\w]+(/[\\w]*)*",path)){
					String projectId = pathSeg[1];

					req.setAttribute("project", projectId);
					Key<Project> projectKey = Key.create(Project.class, projectId);
					boolean projectExists =  (ofy().load().filterKey(projectKey).count() != 0 );

					if(!projectExists){
						System.out.println("project doesn't exists in appengine");
						System.out.println("projects: "+FirebaseService.existsProject(projectId));
						System.out.println("clientRequest: "+FirebaseService.existsClientRequest(projectId));
						if( FirebaseService.existsClientRequest(projectId) || FirebaseService.existsProject(projectId) ){
							Project.Construct(projectId);
						} else {
							//
							System.out.println("project doesn't exists in firebase");
							System.out.println("Project not found ("+projectId+")!");
							req.getRequestDispatcher("/html/404.jsp").forward(req, resp);
						}
					}



					if ( pathSeg.length <= 2 ){
						req.getRequestDispatcher("/html/angular_2_col.jsp").forward(req, resp);
					} else if( pathSeg[2].equals("admin")){
						doAdmin(req, resp, projectId, pathSeg);
					} else if (pathSeg[2].equals("ajax")){
						doAjax(req, resp, projectId, user, pathSeg);
					}
				// NOT FOUND 404 PAGE
				} else {
					req.getRequestDispatcher("/html/404.jsp").forward(req, resp);
				}
			// LOGIN PAGE
			} else {
				resp.sendRedirect(userService.createLoginURL(path));
			}
		} catch (ServletException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (FileUploadException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	private void doUser(HttpServletRequest req, HttpServletResponse resp, User user,
			final String[] pathSeg) throws IOException, ServletException, FileUploadException
	{


        if( pathSeg.length >= 3 ){
        	if (pathSeg[2].equals("picture")){
    			getUserPicture(req,resp);

    		} else if (pathSeg[2].equals("pictureChange")){
    			changeUserPicture(user,req,resp);

    		} else if (pathSeg[2].equals("info")){
    			renderJson(resp,"{userId:"+user.getUserId()+",userHandle:"+user.getNickname()+"}");
    		}
        }


	}

	private void doAjax(HttpServletRequest req, HttpServletResponse resp,
			final String projectID, User user, final String[] pathSeg) throws IOException, FileUploadException
	{
		if (pathSeg[3].equals("fetch")){
			doFetchMicrotask(req, resp, user);

		} else if (pathSeg[3].equals("submit")){
			doSubmitMicrotask(req, resp);
		} else if (pathSeg[3].equals("testResult")){
			doSubmitTestResult(req, resp);
		}
	}

	private void doAdmin(HttpServletRequest req, HttpServletResponse resp,
			final String projectID, final String[] pathSeg) throws IOException, ServletException
	{
		//System.out.println("doing admin");
		if(pathSeg.length <=3 ){
			req.getRequestDispatcher("/html/admin.jsp").forward(req, resp);
		} else {
			// The command should be in the fourth position. If nothing exists there,
			// use "" as the command.
			String command = pathSeg[3].toUpperCase();

			//System.out.println("command="+command);
		    final StringBuilder output = new StringBuilder();
		    final Date currentTime = new Date();

			if (command.equals("RESET"))
			{
				output.append("RESET executed at " + currentTime.toString() + "\n");
				Project.Clear(projectID);

				output.append("Project successfully reset to default state.\n");

//				System.out.println(" PROJECTS BEFORE CREATION ");
//				List<Project> projects = ofy().load().type(Project.class).list();
//				for(Project project: projects){
//					System.out.println("PROJECT = "+project.getID());
//
//					ofy().transactionless().delete().key(project.getKey());
//				}

				List<Command> commands = new ArrayList<Command>();
				commands.addAll(ofy().transact(new Work<List<Command>>() {
			        public List<Command> run()
			        {
		    			CommandContext context = new CommandContext();
		    			Project.Construct(projectID);
		    			output.append("New project successfully constructed.\n");

						return context.commands();
			        }
			    }));

				executeCommands(commands, projectID);

//				System.out.println(" PROJECTS AFTER CREATION ");
//				projects = ofy().load().type(Project.class).list();
//				for(Project project: projects){
//					System.out.println("PROJECT = "+project.getID());
//				}
			}
			else if (command.equals("REVIEWSON"))
			{
				output.append("REVIEWS ON executed at " + currentTime.toString() + "\n");

				List<Command> commands = new ArrayList<Command>();
				commands.addAll(ofy().transact(new Work<List<Command>>() {
			        public List<Command> run()
			        {
		    			CommandContext context = new CommandContext();
		    			ProjectCommand.enableReviews(true);
		    			output.append("Reviews successfully set to on.\n");

						return context.commands();
			        }
			    }));

				executeCommands(commands, projectID);
			}
			else if (command.equals("REVIEWSOFF"))
			{
				output.append("REVIEWS OFF executed at " + currentTime.toString() + "\n");

				List<Command> commands = new ArrayList<Command>();
				commands.addAll(ofy().transact(new Work<List<Command>>() {
			        public List<Command> run()
			        {
		    			CommandContext context = new CommandContext();
		    			ProjectCommand.enableReviews(false);
		    			output.append("Reviews successfully set to off.\n");

						return context.commands();
			        }
			    }));

				executeCommands(commands, projectID);
			}
			else
			{
				output.append("Unrecognized command " + command);
			}

			output.append("\n");

			JSONObject jsonObj = new JSONObject();
			try {
				jsonObj.put("message",output.toString());
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

		    renderJson(resp,jsonObj.toString());
		}
	}


	// get user picture
	private void getUserPicture(HttpServletRequest req, HttpServletResponse res) throws IOException, ServletException {
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
	// changes user picture
	private void changeUserPicture(User user, HttpServletRequest req, HttpServletResponse res) throws IOException, FileUploadException {
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

		    //System.out.println("SUCCESS UPLOAD");

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
	private void doSubmitTestResult(final HttpServletRequest req, final HttpServletResponse resp) throws IOException, FileUploadException {

		final String projectID = (String) req.getAttribute("project");
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


	// Notify the server that a microtask has been completed.
	public void doSubmitMicrotask(final HttpServletRequest req, final HttpServletResponse resp) throws IOException
	{
		// Collect information from the request parameter. Since the transaction may fail and retry,
		// anything that mutates the values of req and resp MUST be outside the transaction so it only occurs once.
		// And anything inside the transaction MUST not mutate the values produced.
    	try
    	{
    		final String projectID    = (String) req.getAttribute("project");
			final String workerID     = UserServiceFactory.getUserService().getCurrentUser().getUserId();
			final String microtaskKey = req.getParameter("key") ;
			final String type         = req.getParameter("type");
			final String payload      = Util.convertStreamToString(req.getInputStream());
			final boolean skip = Boolean.parseBoolean(req.getParameter("skip"));

			System.out.println("SKIPPED MTASK KEY = "+microtaskKey);

			// Create an initial context, then build a command to skip or submit
			CommandContext context = new CommandContext();

			// Create the skip or submit commands
			if (skip)
				ProjectCommand.skipMicrotask( microtaskKey, workerID);
			else{
				Class microtaskType = microtaskTypes.get(type);
				if (microtaskType == null)
					throw new RuntimeException("Error - " + type + " is not registered as a microtask type.");

				ProjectCommand.submitMicrotask( microtaskKey, microtaskType, payload, workerID);

			}

			// Copy the command back out the context to initially populate the command queue.
			executeCommands(context.commands(), projectID);
    	}
    	catch (IOException e)
    	{
    		e.printStackTrace();
    	}
	}


	public void doFetchMicrotask(final HttpServletRequest req, final HttpServletResponse resp,final User user) throws IOException
	{
		// Since the transaction may fail and retry,
		// anything that mutates the values of req and resp MUST be outside the transaction so it only occurs once.
		// And anything inside the transaction MUST not mutate the values produced.
		final String projectID = (String) req.getAttribute("project");
    	final Key<Microtask> microtaskKey = ofy().transact(new Work<Key<Microtask>>() {
            public Key<Microtask> run()
            {
            	Project project = Project.Create(projectID);
            	String workerID = user.getUserId();
            	String workerHandle = user.getNickname();


            	// logout inactive workers
            	//project.logoutInactiveWorkers();

            	// If the user does not have a microtask assigned, get them a microtask.
            	Key<Microtask> microtaskKey = project.lookupMicrotaskAssignment(workerID);
            	if (microtaskKey == null)
            	{
            		microtaskKey = project.assignMicrotask(workerID, workerHandle);
            		//System.out.println("Worker " + workerHandle + " assign micro "+microtaskKey);
            	}
            	else
            	{
            		//System.out.println("Worker " + workerHandle + " has micro "+microtaskKey);
            	}
            	return microtaskKey;
            }
        });

/*
	    try{
//	    	List<Key<Microtask>> keys = ofy().load().type(Microtask.class).keys().list();
//	    	ofy().delete().keys(keys).now();
	    	List<Microtask> list = ofy().load().type(Microtask.class).list();
		    for(Microtask task: list){
		    	System.out.println("Microtask key is: "+task.getKey());
		    }

	    } catch(Exception e ){

	    }*/

    	// Load the microtask
	    Microtask microtask = null;
	    if (microtaskKey != null)
	    {
		    microtask = ofy().transact(new Work<Microtask>() {
	            public Microtask run()
	            {
	        		return ofy().load().key(microtaskKey).get();
	            }
		    });
	    }


    	// If there are no microtasks available, send an empty response.
	    // Otherwise, send the json with microtask info.
		if (microtask == null) {
			resp.sendError(404);
		}
		else{
			renderJson(resp,microtask.toJSON());
		}


	}

	private void renderJson(final HttpServletResponse resp,String json) throws IOException{
		resp.setContentType("json;charset=utf-8");
		PrintWriter out = resp.getWriter();
		out.print(json);
		out.flush();
	}

	// Logs out the specified user from the service
	public void doUserLogout(final String projectID, final String userID)
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