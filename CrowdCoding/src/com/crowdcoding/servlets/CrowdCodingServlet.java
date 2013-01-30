package com.crowdcoding.servlets;
import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.crowdcoding.artifacts.Project;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

@SuppressWarnings("serial")
public class CrowdCodingServlet extends HttpServlet {
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException 
	{
        UserService userService = UserServiceFactory.getUserService();
        User user = userService.getCurrentUser();

        //Project project = Project.Create();
        
        if (user != null) 
        {
        	try {
				req.getRequestDispatcher("/html/mainpage.jsp").forward(req, resp);
			} catch (ServletException e) {
				e.printStackTrace();
			}      	
        } else {
            resp.sendRedirect(userService.createLoginURL(req.getRequestURI()));
        }
	}
}
