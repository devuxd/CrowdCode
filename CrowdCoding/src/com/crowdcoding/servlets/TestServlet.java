package com.crowdcoding.servlets;
import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.crowdcoding.artifacts.Project;
import com.crowdcoding.dto.UserStoryDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.appengine.api.channel.ChannelMessage;
import com.google.appengine.api.channel.ChannelService;
import com.google.appengine.api.channel.ChannelServiceFactory;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

@SuppressWarnings("serial")
public class TestServlet extends HttpServlet {
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException 
	{
		Project project = Project.Create();
		
		//System.out.println(req.getParameter("name"));
		
        /*UserService userService = UserServiceFactory.getUserService();
        User user = userService.getCurrentUser();
        ChannelService channelService = ChannelServiceFactory.getChannelService();
        channelService.sendMessage(new ChannelMessage(user.toString(), "Hello world"));*/
		
		
		ObjectMapper mapper = new ObjectMapper(); // can reuse, share globally
		UserStoryDTO test = mapper.readValue("{ \"userStory\" : \"This is a user story\" }", UserStoryDTO.class);
		System.out.println(test.toString());		
	}
}
