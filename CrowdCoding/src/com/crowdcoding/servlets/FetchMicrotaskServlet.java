package com.crowdcoding.servlets;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Project;
import com.crowdcoding.microtasks.Microtask;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.googlecode.objectify.Work;

@SuppressWarnings("serial")
public class FetchMicrotaskServlet extends HttpServlet {
	public void doGet(final HttpServletRequest req, final HttpServletResponse resp) throws IOException 
	{
		// Since the transaction may fail and retry,
		// anything that mutates the values of req and resp MUST be outside the transaction so it only occurs once.
		// And anything inside the transaction MUST not mutate the values produced.
		
        final UserService userService = UserServiceFactory.getUserService();
        final User user = userService.getCurrentUser();  
        if (user != null) 
        {
            Microtask microtask = ofy().transact(new Work<Microtask>() {
                public Microtask run()
                {                	
                	Project project = Project.Create();  
                	Worker crowdUser = Worker.Create(user, project);

                	System.out.println(crowdUser.toString());
                	
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
            		resp.sendRedirect("/html/nomicrotask.jsp");	
            	else        	
            		resp.sendRedirect(microtask.getUIURL());
        	}
        	catch (IOException e)
        	{
        		e.printStackTrace();
        	}                      		        	
        } else {
            resp.sendRedirect(userService.createLoginURL(req.getRequestURI()));
        }
	}
}
