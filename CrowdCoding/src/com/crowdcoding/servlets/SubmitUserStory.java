package com.crowdcoding.servlets;

import static com.googlecode.objectify.ObjectifyService.ofy;
import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Project;
import com.crowdcoding.dto.UserStoryDTO;
import com.crowdcoding.microtasks.Microtask;
import com.crowdcoding.microtasks.WriteUserStory;
import com.crowdcoding.util.Util;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

@SuppressWarnings("serial")
public class SubmitUserStory extends HttpServlet 
{
	// Notify the server that a microtask has been completed. 
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException 
	{
	    Project project = Project.Create();
		
		String payload = Util.convertStreamToString(req.getInputStream());
		System.out.println(payload);
				
		ObjectMapper mapper = new ObjectMapper(); 
		UserStoryDTO dto = mapper.readValue(payload, UserStoryDTO.class);
		System.out.println(dto);
						
		Worker worker = Worker.Create(UserServiceFactory.getUserService().getCurrentUser());
		
		WriteUserStory writeUserStory = ofy().load().type(WriteUserStory.class).id(dto.id).get();
		writeUserStory.submit(dto, worker);		
	}
}