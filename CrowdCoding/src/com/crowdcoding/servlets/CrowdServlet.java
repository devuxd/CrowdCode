package com.crowdcoding.servlets;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.logging.Logger;
import java.util.regex.Pattern;

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
import com.crowdcoding.commands.QuestioningCommand;
import com.crowdcoding.entities.Answer;
import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.Comment;
import com.crowdcoding.entities.Function;
import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.Question;
import com.crowdcoding.entities.Questioning;
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
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.util.FirebaseService;
import com.crowdcoding.util.IDGenerator;
import com.crowdcoding.util.Util;
import com.google.appengine.api.datastore.Blob;
import com.google.appengine.api.images.Image;
import com.google.appengine.api.images.ImagesService;
import com.google.appengine.api.images.ImagesServiceFactory;
import com.google.appengine.api.images.Transform;
import com.google.appengine.api.log.LogService;
import com.google.appengine.api.log.LogServiceFactory;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.ObjectifyService;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.VoidWork;
import com.googlecode.objectify.Work;
import com.googlecode.objectify.cmd.Query;
import com.googlecode.objectify.cmd.QueryKeys;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskOptions;

import static com.google.appengine.api.taskqueue.TaskOptions.Builder.*;

@SuppressWarnings("serial")
public class CrowdServlet extends HttpServlet
{
	private static HashMap<String, Class> microtaskTypes = new HashMap<String, Class>();

	static
	{
		// Must register ALL entities and entity subclasses here.
		// And embedded classes are also not registered.
		ObjectifyService.register(Project.class);
		ObjectifyService.register(Worker.class);
		ObjectifyService.register(Artifact.class);
		ObjectifyService.register(Function.class);
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

		ObjectifyService.register(Questioning.class);
		ObjectifyService.register(Question.class);
		ObjectifyService.register(Answer.class);
		ObjectifyService.register(Comment.class);


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
        
        if( req.getParameter("workerId") != null ){
			User dummyUser = new User(req.getParameter("workerId")+"@dummy.dm","dummy",req.getParameter("workerId"));
			user = dummyUser;
        }
        

//		Logger log =  Logger.getLogger("LOGGER");
//		log.warning("ACTION BLA BLA BLA "+user);
        
		// retrieve the path and split by separator '/'
		String   path    = req.getPathInfo();
		String[] pathSeg = path.split("/");

		//System.out.println("Path Requested: "+path);

		try {
			// -- PATHS WITHOUT USER AUTHENTICATION
			 if( Pattern.matches("/",path) || Pattern.matches("/welcome",path)){
				 System.out.println("DISPATCHING WELCOME PAGE");
				req.getRequestDispatcher("/welcome.jsp").forward(req, resp);
			 } else if(Pattern.matches("/user/info",path)){
				req.getRequestDispatcher("/userInfo.jsp").forward(req, resp);
			 } else if(Pattern.matches("/worker",path)){
				doExecuteSubmit(req,resp);
			 }

			// PATHS WITH USER AUTHENTICATION
			 else if ( user != null ) { // if the user is authenticated


				// USERS URLS
				if(Pattern.matches("/user/[\\w]*",path)){
					doUser(req,resp,user,pathSeg);
				}
				// client request
				else if(Pattern.matches("/clientRequest",path)){
					req.getRequestDispatcher("/clientReq/client_request.html").forward(req, resp);
				}
				// SUPERADMIN URLS
				else if(Pattern.matches("/_admin/[\\w]*",path)){
					if( userService.isUserAdmin() ){
						req.getRequestDispatcher("/SuperAdmin.jsp").forward(req, resp);
					} else
						req.getRequestDispatcher("/404.jsp").forward(req, resp);
				}
				// PROJECT URLS match /word/ or /word/(word)*
				else if(Pattern.matches("/[\\w]+(/[\\w]*)*",path)){
					String projectId = pathSeg[1];

					req.setAttribute("project", projectId);
					Key<Project> projectKey = Key.create(Project.class, projectId);
					boolean projectExists =  (ObjectifyService.ofy().load().filterKey(projectKey).count() != 0 );

					if(!projectExists){
						if( FirebaseService.existsClientRequest(projectId) || FirebaseService.existsProject(projectId) ){
							Project.Construct(projectId);
						} else {
							req.getRequestDispatcher("/404.jsp").forward(req, resp);
						}
					}

					if ( pathSeg.length <= 2 ){
						req.getRequestDispatcher("/clientDist/client.jsp").forward(req, resp);
					} else if( pathSeg[2].equals("admin")){
						if( userService.isUserAdmin() ){
							doAdmin(req, resp, projectId, pathSeg);
						} else
							req.getRequestDispatcher("/404.jsp").forward(req, resp);
					} else if( pathSeg[2].equals("statistics")){
						req.getRequestDispatcher("/statistics/index.jsp").forward(req, resp);
					} else if (pathSeg[2].equals("ajax")){
						doAjax(req, resp, projectId, user, pathSeg);
					}  else if (pathSeg[2].equals("questions")){
						doQuestioning(req, resp, projectId, user, pathSeg);
					}  else if (pathSeg[2].equals("code")){
						renderCode(resp, projectId);
					}else if (pathSeg[2].equals("logout")){
						doLogout(req,resp, projectId);
					}

				// NOT FOUND 404 PAGE
				} else {
					req.getRequestDispatcher("/404.jsp").forward(req, resp);
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

//		} else if (pathSeg[3].equals("submit")){
//			doSubmitMicrotask(req, resp);
		} else if (pathSeg[3].equals("testResult")){
			doSubmitTestResult(req, resp);
		} else if (pathSeg[3].equals("enqueue")){
			doEnqueueSubmit(req, resp,user);
		}
	}

	private void doQuestioning(HttpServletRequest req, HttpServletResponse resp,
			final String projectID, User user, final String[] pathSeg) throws IOException, FileUploadException
	{
		try {
			if (pathSeg[3].equals("insert")){
				doInsertQuestioning(req, resp, user);
			} else if (pathSeg[3].equals("vote")){
				doVoteQuestioning(req, resp, user);
			} else if (pathSeg[3].equals("report")){
				doReportQuestioning(req, resp, user);
			} else if (pathSeg[3].equals("subscribe")){
				doSubscribeQuestioning(req, resp, user);
			} else if (pathSeg[3].equals("link")){
				doLinkQuestioning(req, resp, user);
			} else if (pathSeg[3].equals("close")){
				doCloseQuestioning(req, resp, user);
			}
		} catch( Exception e ) {
			e.printStackTrace();
			resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
		}
	}

	private void doAdmin(HttpServletRequest req, HttpServletResponse resp,
			final String projectID, final String[] pathSeg) throws IOException, ServletException
	{
		//System.out.println("doing admin");
		if(pathSeg.length <=3 ){
			req.getRequestDispatcher("/admin/index.jsp").forward(req, resp);
		} else {
			// The command should be in the fourth position. If nothing exists there,
			// use "" as the command.
			String command = pathSeg[3].toUpperCase();

			//System.out.println("command="+command);
		    final StringBuilder output = new StringBuilder();
		    final Date currentTime = new Date();


			CommandContext context = new CommandContext();

			//System.out.println("EXECUTING COMMAND : "+command);
			if (command.equals("RESET"))
			{
				output.append("PROJECT RESET executed at " + currentTime.toString() + "\n");

				Project.Clear(projectID);
				Project.Construct(projectID);
			}
			else if (command.equals("CLEAR"))
			{
				output.append("PROJECT CLEAR executed at " + currentTime.toString() + "\n");

				Project.Clear(projectID);
			}
			else if (command.equals("REVIEWSON"))
			{
				output.append("REVIEWS ON executed at " + currentTime.toString() + "\n");

		    	ProjectCommand.enableReviews(true);

			}
			else if (command.equals("REVIEWSOFF"))
			{
				output.append("REVIEWS OFF executed at " + currentTime.toString() + "\n");

				ProjectCommand.enableReviews(false);

			}
			else if (command.equals("TUTORIALSON"))
			{
				output.append("TUTORIALS ON executed at " + currentTime.toString() + "\n");
		    	ProjectCommand.enableTutorials(true);

			}
			else if (command.equals("TUTORIALSOFF"))
			{
				output.append("TUTORIALS OFF executed at " + currentTime.toString() + "\n");
		    	ProjectCommand.enableTutorials(false);

			}
			else
			{
				output.append("Unrecognized command " + command);
			}


			executeCommands(context.commands(), projectID);

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
		UserPicture picture = (userId==null)?null:ofy().load().key(Key.create(UserPicture.class, userId)).now();

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


	    ImagesService imagesService = ImagesServiceFactory.getImagesService();
        Image oldImage = ImagesServiceFactory.makeImage(IOUtils.toByteArray(imgStream));
        Transform resize = ImagesServiceFactory.makeResize(200,200);
        Image newImage = imagesService.applyTransform(resize, oldImage);

        Blob imageBlob = new Blob( newImage.getImageData() );



	    // if image size > 0 bytes
	    if(imageBlob.getBytes().length>0){

		    //retrieve picture object if exists or instantiate a new one
		    UserPicture picture = ofy().load().key(Key.create(UserPicture.class, user.getUserId())).now();
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

		//System.out.println("--> SERVLET: submitted test result for function "+functionID+" is "+result);

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

	public void doInsertQuestioning (final HttpServletRequest req, final HttpServletResponse resp, final User user) throws IOException
	{
		// Collect information from the request parameter. Since the transaction may fail and retry,
		// anything that mutates the values of req and resp MUST be outside the transaction so it only occurs once.
		// And anything inside the transaction MUST not mutate the values produced.
		final String projectId = (String) req.getAttribute("project");
		final String type      = (String) req.getParameter("type");
		final String payload   = Util.convertStreamToString(req.getInputStream());

		final String workerId     = user.getUserId();
		final String workerHandle = user.getNickname();
		
		// Create an initial context, then build a command to insert the value
		CommandContext context = new CommandContext();

		if(type.equals("question"))
			QuestioningCommand.createQuestion( payload, workerId, workerHandle);
		else if(type.equals("answer"))
			QuestioningCommand.createAnswer(payload, workerId, workerHandle);
		else if(type.equals("comment"))
			QuestioningCommand.createComment(payload, workerId, workerHandle);
		else
			throw new RuntimeException("Error - " + type + " is not registered as a questioning type.");


		// Copy the command back out the context to initially populate the command queue.
		executeCommands(context.commands(), projectId);
	}
	
	public void doReportQuestioning (final HttpServletRequest req, final HttpServletResponse resp, final User user) throws IOException
	{
		// Collect information from the request parameter. Since the transaction may fail and retry,
		// anything that mutates the values of req and resp MUST be outside the transaction so it only occurs once.
		// And anything inside the transaction MUST not mutate the values produced.

		final String projectID    = (String) req.getAttribute("project");
		final long questioningId    = Long.parseLong((String) req.getParameter("id"));
		final boolean remove      = Boolean.parseBoolean((String)req.getParameter("remove"));


		final String workerID     = user.getUserId();

		// Create an initial context, then build a command to insert the value
		CommandContext context = new CommandContext();
		QuestioningCommand.report(questioningId, workerID, remove);


		// Copy the command back out the context to initially populate the command queue.
		executeCommands(context.commands(), projectID);
	}

	public void doSubscribeQuestioning (final HttpServletRequest req, final HttpServletResponse resp, final User user) throws IOException
	{
		// Collect information from the request parameter. Since the transaction may fail and retry,
		// anything that mutates the values of req and resp MUST be outside the transaction so it only occurs once.
		// And anything inside the transaction MUST not mutate the values produced.

		final String projectID  	= (String) req.getAttribute("project");
		final long questioningId    = Long.parseLong((String) req.getParameter("id"));
		final boolean remove	    = Boolean.parseBoolean((String)req.getParameter("remove"));

		final String workerID     = user.getUserId();

		// Create an initial context, then build a command to insert the value
		CommandContext context = new CommandContext();

		QuestioningCommand.subscribeWorker(questioningId, workerID, remove);


		// Copy the command back out the context to initially populate the command queue.
		executeCommands(context.commands(), projectID);
	}

	public void doLinkQuestioning (final HttpServletRequest req, final HttpServletResponse resp, final User user) throws IOException
	{
		// Collect information from the request parameter. Since the transaction may fail and retry,
		// anything that mutates the values of req and resp MUST be outside the transaction so it only occurs once.
		// And anything inside the transaction MUST not mutate the values produced.

		final String projectID  	= (String) req.getAttribute("project");
		final long questioningId    = Long.parseLong((String) req.getParameter("id"));
		final String artifactId	    = req.getParameter("artifactId");
		final boolean remove	    = Boolean.parseBoolean((String)req.getParameter("remove"));

		final String workerId     = user.getUserId();

		// Create an initial context, then build a command to insert the value
		CommandContext context = new CommandContext();
		QuestioningCommand.linkArtifact(questioningId, artifactId, remove, workerId);


		// Copy the command back out the context to initially populate the command queue.
		executeCommands(context.commands(), projectID);
	}

	public void doCloseQuestioning (final HttpServletRequest req, final HttpServletResponse resp, final User user) throws IOException
	{
		// Collect information from the request parameter. Since the transaction may fail and retry,
		// anything that mutates the values of req and resp MUST be outside the transaction so it only occurs once.
		// And anything inside the transaction MUST not mutate the values produced.

		final String projectID  	= (String) req.getAttribute("project");
		final long questioningId    = Long.parseLong((String) req.getParameter("id"));
		final boolean closed 	    = Boolean.parseBoolean((String)req.getParameter("closed"));

		final String workerId     = user.getUserId();

		// Create an initial context, then build a command to insert the value
		CommandContext context = new CommandContext();

		QuestioningCommand.setClosed(questioningId, closed, workerId);


		// Copy the command back out the context to initially populate the command queue.
		executeCommands(context.commands(), projectID);
	}
	
	public void doVoteQuestioning (final HttpServletRequest req, final HttpServletResponse resp, final User user) throws IOException
	{
		// Collect information from the request parameter. Since the transaction may fail and retry,
		// anything that mutates the values of req and resp MUST be outside the transaction so it only occurs once.
		// And anything inside the transaction MUST not mutate the values produced.

		final String projectID    = (String) req.getAttribute("project");
		final long questioningId    = Long.parseLong((String) req.getParameter("id"));
		final boolean remove    = Boolean.parseBoolean((String)req.getParameter("remove"));


		final String workerID     = user.getUserId();

		// Create an initial context, then build a command to insert the value
		CommandContext context = new CommandContext();
		QuestioningCommand.vote(questioningId, workerID, remove);


		// Copy the command back out the context to initially populate the command queue.
		executeCommands(context.commands(), projectID);
	}


	// Notify the server that a microtask has been completed.
//	public void doSubmitMicrotask(final HttpServletRequest req, final HttpServletResponse resp) throws IOException
//	{
//		// Collect information from the request parameter. Since the transaction may fail and retry,
//		// anything that mutates the values of req and resp MUST be outside the transaction so it only occurs once.
//		// And anything inside the transaction MUST not mutate the values produced.
//
//		try
//    	{
//    		final String projectID    = (String) req.getAttribute("project");
//
//			final String workerID     = UserServiceFactory.getUserService().getCurrentUser().getUserId();
//			final String microtaskKey = req.getParameter("key") ;
//			final String type         = req.getParameter("type");
//			final String payload      = Util.convertStreamToString(req.getInputStream());
//			final boolean skip		  = Boolean.parseBoolean(req.getParameter("skip"));
//			final boolean disablePoint = Boolean.parseBoolean( req.getParameter("disablepoint"));
//
//
//			System.out.println("--> SERVLET: submitted mtask key = "+microtaskKey);
//
//			// Create an initial context, then build a command to skip or submit
//			CommandContext context = new CommandContext();
//
//			// Create the skip or submit commands
//			if (skip)
//				ProjectCommand.skipMicrotask( microtaskKey, workerID, disablePoint);
//			else{
//				ProjectCommand.submitMicrotask( microtaskKey, payload, workerID);
//			}
//
//			// Copy the command back out the context to initially populate the command queue.
//			executeCommands(context.commands(), projectID);
//    	}
//    	catch (IOException e)
//    	{
//    		e.printStackTrace();
//    	}
//	}

	public void doFetchMicrotask(final HttpServletRequest req, final HttpServletResponse resp,final User user) throws IOException{
		doFetchMicrotask(req,resp,user,false);
	}

	public void doFetchMicrotask(final HttpServletRequest req, final HttpServletResponse resp,final User user, final boolean unassign) throws IOException
	{
		// Since the transaction may fail and retry,
		// anything that mutates the values of req and resp MUST be outside the transaction so it only occurs once.
		// And anything inside the transaction MUST not mutate the values produced.
		final String projectID = (String) req.getAttribute("project");

    	final Project project = Project.Create(projectID);
		final Worker worker   = Worker.Create(user, project);

    	String jsonResponse = "{}";
    	try {
    		jsonResponse = ofy().transactNew( new Work<String>(){

    			public String run() {
    				Key<Microtask> microtaskKey = null;
    		    	int firstFetch=0;
    				if( unassign ){
    		    		project.unassignMicrotask( worker.getUserid() );
    		    	} else {
    		    		microtaskKey = project.lookupMicrotaskAssignment( worker.getUserid() );
    		    	}
    		    	
    		    	if( microtaskKey == null ){
    		    		microtaskKey = project.assignMicrotask( worker.getUserid() , worker.getNickname() ) ;	
    		    		firstFetch = 1;
    		    	}
    		    	
    		    	if (microtaskKey == null) {
    					return "{}";
    				} else{
    					return "{\"microtaskKey\": \""+Microtask.keyToString(microtaskKey)+"\", \"firstFetch\": \""+ firstFetch+"\"}";
    				}
    			}
        		
        	});
    	} catch ( IllegalArgumentException e ){
    		e.printStackTrace();
    		System.out.println("WORKER ID "+worker.getUserid()+" - nickname "+worker.getNickname());
    	}
    	
    	
		renderJson(resp,jsonResponse);
		

        HistoryLog.Init(projectID).publish();
        FirebaseService.publish();
	}

	/**
	 * Enqueue a submit task into the default task queue
	 * and fetch a queued microtask for the user
	 *
	 * @param req
	 * @param resp
	 * @throws IOException
	 */
	public void doEnqueueSubmit(final HttpServletRequest req, final HttpServletResponse resp,final User user) throws IOException{

		// restrieve the submit data
		final String projectId     = (String) req.getAttribute("project");
		final String workerId      = user.getUserId();
		final String microtaskKey  = req.getParameter("key") ;
		final String JsonDTO       = Util.convertStreamToString(req.getInputStream());
		final String skip          = req.getParameter("skip");
		final String disablePoint  = req.getParameter("disablepoint");

		// fetch the new microtask
        doFetchMicrotask(req,resp,user,true);
        
		// create the submit task
		TaskOptions task = withUrl("/worker");
		task.param("projectId", projectId);
		task.param("workerId", workerId);
		task.param("microtaskKey", microtaskKey);
		task.param("JsonDTO", JsonDTO);
		task.param("skip", skip.toString());
		task.param("disablepoint", disablePoint.toString());

		// add the task to the default task queue
        Queue queue = QueueFactory.getDefaultQueue();
        queue.add(task);

//        String time = new SimpleDateFormat("HH:mm:ss").format(new Date());
//		System.out.println(time + " - ADD: "+microtaskKey+" by "+workerId);
	}

	public void doExecuteSubmit(final HttpServletRequest req, final HttpServletResponse resp){

		final String projectID    = req.getParameter("projectId") ;
		final String workerID     = req.getParameter("workerId") ;
		final String microtaskKey = req.getParameter("microtaskKey") ;
		final String JsonDTO      = req.getParameter("JsonDTO");
		final Boolean skip        = Boolean.parseBoolean(req.getParameter("skip"));
		final Boolean disablePoint=Boolean.parseBoolean(req.getParameter("disablepoint"));

		// Create an initial context, then build a command to skip or submit
		CommandContext context = new CommandContext();

		// Create the skip or submit commands
		if (skip)
			ProjectCommand.skipMicrotask( microtaskKey, workerID, disablePoint);
		else{
			ProjectCommand.submitMicrotask( microtaskKey, JsonDTO, workerID);
		}

		// Copy the command back out the context to initially populate the command queue.
		executeCommands(context.commands(), projectID);
		resp.setStatus(HttpServletResponse.SC_OK);

//		time = new SimpleDateFormat("HH:mm:ss").format(new Date());
//		System.out.println(time + " - END: "+microtaskKey+" by "+workerID);
	}

	private void renderJson(final HttpServletResponse resp,String json) throws IOException{
		resp.setContentType("json;charset=utf-8");
		PrintWriter out = resp.getWriter();
		out.print(json);
		out.flush();
	}
	
	private void renderCode(final HttpServletResponse resp, String projectId) throws IOException{
		resp.setContentType("text/javascript;charset=utf-8");
		Project project=  Project.Create(projectId);
		String allCode= FirebaseService.getAllCode(project.getID());
		PrintWriter out = resp.getWriter();
		out.print(allCode);
		out.flush();
	}


	// Notify the server that a microtask has been completed.
		public void doLogout(final HttpServletRequest req, final HttpServletResponse resp, final String projectID) throws IOException
		{
			final String logoutWorkerID     = req.getParameter("workerid");
			doUserLogout(projectID,logoutWorkerID);
		}




	// Logs out the specified user from the service
	public void doUserLogout(final String projectID, final String userID)
	{
		if (userID == null || userID.length() == 0)
			return;
		System.out.println(userID);
		System.out.println(projectID);

		CommandContext context = new CommandContext();
		ProjectCommand.logoutWorker(userID);
		executeCommands(context.commands(), projectID);

		//System.out.println("Logged out " + userID);
	}

	// Executes all of the specified commands and any commands that may subsequently be generated
	private void executeCommands(List<Command> commands, final String projectId)
	{

		LinkedList<Command> commandQueue    = new LinkedList<Command>(commands);
		Iterator<Command>   commandIterator = commandQueue.iterator();
		// Execute commands until done, adding commands as created.
	    while(commandIterator.hasNext()) {
        	Command command = commandQueue.remove();
        	CommandContext context = new CommandContext();
        	command.execute(projectId);
        	commandQueue.addAll(context.commands());

            // history log writes and the other
            // firebase writes are done
            // outside of the transactions
            HistoryLog.Init(projectId).publish();
            FirebaseService.publish();
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