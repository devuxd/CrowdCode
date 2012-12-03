package com.crowdcoding.servlets;
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

@SuppressWarnings("serial")
public class FetchMessagesServlet extends HttpServlet {
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException 
	{
        UserService userService = UserServiceFactory.getUserService();
        User user = userService.getCurrentUser();
        Project project = Project.Create();     
        if (user != null) 
        {
        	Worker crowdUser = Worker.Create(user);        	
        	resp.setContentType("application/json");
        	PrintWriter out = resp.getWriter();
        	out.print(crowdUser.fetchMessages());
        	out.flush();        	
        } else {
            resp.sendRedirect(userService.createLoginURL(req.getRequestURI()));
        }
	}
}
