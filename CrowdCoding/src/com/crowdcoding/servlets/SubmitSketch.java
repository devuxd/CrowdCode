package com.crowdcoding.servlets;

import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.crowdcoding.model.Function;
import com.crowdcoding.util.Util;
import com.fasterxml.jackson.databind.ObjectMapper;

@SuppressWarnings("serial")
public class SubmitSketch extends HttpServlet 
{
	// Notify the server that a microtask has been completed. 
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException 
	{
		String payload = Util.convertStreamToString(req.getInputStream());
		System.out.println(payload);
				
		ObjectMapper mapper = new ObjectMapper(); 
		Function function = mapper.readValue(payload, Function.class);
		System.out.println(function);
	}
	

}
