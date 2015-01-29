package com.crowdcoding.dto;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
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
		return json(this);
	}

	// Gets JSON for the specified object
	protected static String json(Object obj)
	{
		ObjectMapper mapper = new ObjectMapper();
	    try {
	    	return mapper.writeValueAsString(obj);
		} catch (IOException e) {
			e.printStackTrace();
		}
	    return "";
	}

	// Reads a DTO of type dtoClass from the specified string
	public static DTO read(String jsonDTOData, Class dtoClass) throws JsonParseException, JsonMappingException, IOException
	{
		ObjectMapper mapper = new ObjectMapper();
		DTO dto = null;
		dto = (DTO) mapper.readValue(jsonDTOData, dtoClass);
//		try {
//			
//		} catch( JsonParseException e) {
//			e.printStackTrace();
//		} catch( JsonMappingException e) {
//			e.printStackTrace();
//		} catch (IOException e) {
//			e.printStackTrace();
//		}

		return dto;
	}
}
