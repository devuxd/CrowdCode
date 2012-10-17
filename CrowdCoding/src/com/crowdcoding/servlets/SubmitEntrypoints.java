package com.crowdcoding.servlets;

import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.crowdcoding.artifacts.Project;
import com.crowdcoding.dto.EntrypointDTO;
import com.crowdcoding.util.Util;
import com.fasterxml.jackson.databind.ObjectMapper;

@SuppressWarnings("serial")
public class SubmitEntrypoints extends HttpServlet 
{
	// Notify the server that a microtask has been completed. 
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException 
	{
		Project project = Project.Create();
		
		String payload = Util.convertStreamToString(req.getInputStream());
		System.out.println(payload);
				
		ObjectMapper mapper = new ObjectMapper(); 
		EntrypointDTO entrypoints = mapper.readValue(payload, EntrypointDTO.class);
		System.out.println(entrypoints);
	}
}
