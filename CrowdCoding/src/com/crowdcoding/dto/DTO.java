package com.crowdcoding.dto;

import java.io.IOException;

import com.fasterxml.jackson.databind.ObjectMapper;

/*
 * A data transfer object for transferring data between the client and the server. Each of these
 * classes is intended to match the JSON format that a client expects. These objects may be used
 * for the client to submit data to the server or for the server to send data to the client.
 */
public abstract class DTO 
{
	// Gets the JSON for this DTO
	public String json()
	{
		ObjectMapper mapper = new ObjectMapper();
	    try {
	    	return mapper.writeValueAsString(this);
		} catch (IOException e) {
			e.printStackTrace();
		}	    
	    return "";	
	}
}
