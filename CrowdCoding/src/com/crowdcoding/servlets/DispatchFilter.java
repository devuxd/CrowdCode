package com.crowdcoding.servlets;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class DispatchFilter implements Filter
{
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws ServletException, IOException 
	{
		HttpServletRequest req = (HttpServletRequest) request;
		String path = req.getRequestURI().substring(req.getContextPath().length());

		if (path.startsWith("/client/") || path.startsWith("/dist/") || path.startsWith("/img") ||path.startsWith("/include") || path.startsWith("/_ah")) {
		    System.out.println(path);
		    chain.doFilter(request, response); // Goes to default servlet.
		} else {
		    request.getRequestDispatcher("/servlet" + path).forward(request, response);
		}
	}

	public void destroy() {
	}

	public void init(FilterConfig arg0) throws ServletException {
	}
}
