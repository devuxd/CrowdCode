package com.crowdcoding.servlets;
import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Project;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.googlecode.objectify.Work;

@SuppressWarnings("serial")
public class FetchMessagesServlet extends HttpServlet {
	public void doGet(final HttpServletRequest req, final HttpServletResponse resp) throws IOException 
	{
		// Since the transaction may fail and retry,
		// anything that mutates the values of req and resp MUST be outside the transaction so it only occurs once.
		// And anything inside the transaction MUST not mutate the values produced.
				
        UserService userService = UserServiceFactory.getUserService();
        final User user = userService.getCurrentUser(); 
        if (user != null) 
        {
        	resp.setContentType("application/json");
        	PrintWriter out = resp.getWriter();
            String messages = ofy().transact(new Work<String>() {
                public String run()
                {        		       
            		Project project = Project.Create(); 
		        	Worker crowdUser = Worker.Create(user, project);        	
		        	return crowdUser.fetchMessages();
                }
            });
                    
        	out.print(messages);
        	out.flush();        	
        } 
        else 
        {
            resp.sendRedirect(userService.createLoginURL(req.getRequestURI()));
        }
	}
}
