package com.crowdcoding.servlets;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.googlecode.objectify.VoidWork;


// Calling this servlet resets the datastore and application to an empty, pristine state,
// deleting all state held by the system.
public class ResetServlet extends HttpServlet 
{
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException 
	{	
		reset();
	}
	
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException 
	{
		reset();
	}
	
	private void reset()
	{
        ofy().transact(new VoidWork() 
        {
            public void vrun()
            {        			
            	ofy().delete().keys(ofy().load().keys());		
            }
        });
	}
}
