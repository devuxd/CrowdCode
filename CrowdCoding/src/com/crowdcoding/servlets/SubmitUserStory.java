package com.crowdcoding.servlets;

import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;

@SuppressWarnings("serial")
public class SubmitUserStory extends HttpServlet 
{
	// Notify the server that a microtask has been completed. 
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException 
	{
		String string = req.getParameter("userStory");
		System.out.println(string);		
	
		ObjectMapper mapper = new ObjectMapper(); 
		String story = mapper.readValue(string, String.class);
		System.out.println(story);
	}
}