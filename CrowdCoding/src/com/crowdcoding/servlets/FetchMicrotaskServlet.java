package com.crowdcoding.servlets;
import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Project;
import com.crowdcoding.microtasks.Microtask;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

@SuppressWarnings("serial")
public class FetchMicrotaskServlet extends HttpServlet {
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException 
	{
        UserService userService = UserServiceFactory.getUserService();
        User user = userService.getCurrentUser();
        Project project = Project.Create();     
        if (user != null) 
        {
        	Worker crowdUser = Worker.Create(user);
        	// If the user does not have a microtask assigned, get them a microtask.
        	Microtask microtask = crowdUser.getMicrotask();
        	if (microtask == null)
        		microtask = Microtask.Assign(crowdUser);

        	// If there are no microtasks available, send an empty response. Otherwise, redirect
        	// to microtask UI.
        	if (microtask == null)
        		resp.sendRedirect("/html/nomicrotask.jsp");	
        	else        	
        		resp.sendRedirect(microtask.getUIURL());	        	
        } else {
            resp.sendRedirect(userService.createLoginURL(req.getRequestURI()));
        }
	}
}
