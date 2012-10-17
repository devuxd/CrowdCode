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

			resp.sendRedirect(microtask.getUIURL());	        	
        } else {
            resp.sendRedirect(userService.createLoginURL(req.getRequestURI()));
        }
	}
}



/*
PrintWriter out = response.getWriter();
CharResponseWrapper wrapper = new CharResponseWrapper(
   (HttpServletResponse)response);
chain.doFilter(request, wrapper);
if(wrapper.getContentType().equals("text/html")) {
   CharArrayWriter caw = new CharArrayWriter();
   caw.write(wrapper.toString().substring(0,
      wrapper.toString().indexOf("</body>")-1));
   caw.write("<p>\nYou are visitor number 
   <font color='red'>" + counter.getCounter() + "</font>");
   caw.write("\n</body></html>");
   response.setContentLength(caw.toString().length());
   out.write(caw.toString());
} else 
   out.write(wrapper.toString());
out.close();
  
                    
                    
public class CharResponseWrapper extends
   HttpServletResponseWrapper {
   private CharArrayWriter output;
   public String toString() {
      return output.toString();
   }
   public CharResponseWrapper(HttpServletResponse response){
      super(response);
      output = new CharArrayWriter();
   }
   public PrintWriter getWriter(){
      return new PrintWriter(output);
   }
}
  */