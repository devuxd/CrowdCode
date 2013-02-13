package com.crowdcoding.servlets;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Project;
import com.crowdcoding.artifacts.Test;
import com.crowdcoding.microtasks.Microtask;
import com.googlecode.objectify.Work;

public class AdminServlet extends HttpServlet 
{
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException 
	{	
		doAction(req, resp);	
	}
	
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException 
	{
		doAction(req, resp);
	}
	
	private void doAction(HttpServletRequest req, HttpServletResponse resp) throws IOException 
	{
		// The pathInfo contains commands to execute. Commands are case insensitve,
		// so set to upper case. And strip leading /
		String pathInfo = req.getPathInfo();
		if (pathInfo == null || pathInfo.length() <= 1)
			pathInfo = "";		
		else
			pathInfo = pathInfo.substring(1, pathInfo.length());		
		final String commandString = pathInfo.toUpperCase();

		// Setup the response
		resp.setContentType("text/html");
	    PrintWriter out = resp.getWriter();

	    out.println("<html>");
	    out.println("<head>");
	    out.println("<title>CrowdCoding</title>");
	    out.println("</head>");
	    out.println("<body>");
		
	    // Actions that touch the project need to be in a transaction to ensure that the project
	    // is seen in a consistent state. And transactions may be retried, so they cannot mutate
	    // state other than that which can be reset. 
	    String responseText = ofy().transact(new Work<String>() {
            public String run()
            {
        	    StringBuilder output = new StringBuilder();	
        	    Date currentTime = new Date();
        	    
        		if (commandString.equals("RESET"))
        		{
        			output.append("RESET executed at " + currentTime.toString() + "<BR>");
        			Project.Clear();
        			output.append("Project successfully reset to default state.");
        		}
        		else if (commandString.equals("STATUS"))
        		{
          			output.append("STATUS executed at " + currentTime.toString() + "<BR>");
        			Project project = Project.Create();
        			output.append(Worker.StatusReport(project).replace("\n", "<BR>")); 
        			output.append(Microtask.StatusReport(project).replace("\n", "<BR>"));    
        			output.append(Function.StatusReport(project).replace("\n", "<BR>"));   
        			output.append(Test.StatusReport(project).replace("\n", "<BR>"));   
        		}   
        		else
        		{
        			output.append("Unrecognized command " + commandString);
        		}
        		output.append("<BR>");
            	
            	return output.toString();
            }
        });

        out.println(responseText);        
	    out.println("</body>");
	    out.println("</html>");
    	out.flush();   
	}
}
