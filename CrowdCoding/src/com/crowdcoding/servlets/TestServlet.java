package com.crowdcoding;
import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.crowdcoding.model.UserStory;
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
		//System.out.println(req.getParameter("name"));
		
        /*UserService userService = UserServiceFactory.getUserService();
        User user = userService.getCurrentUser();
        ChannelService channelService = ChannelServiceFactory.getChannelService();
        channelService.sendMessage(new ChannelMessage(user.toString(), "Hello world"));*/
		
		
		ObjectMapper mapper = new ObjectMapper(); // can reuse, share globally
		UserStory test = mapper.readValue("{ \"userStory\" : \"This is a user story\" }", UserStory.class);
		System.out.println(test.toString());		
	}
}
