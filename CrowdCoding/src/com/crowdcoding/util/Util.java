package com.crowdcoding.util;

import java.io.InputStream;
import java.util.NoSuchElementException;
import java.util.Scanner;

public class Util 
{
	public static String convertStreamToString(InputStream is) {
	    try {
	        return new Scanner(is).useDelimiter("\\A").next();
	    } catch (NoSuchElementException e) {
	        return "";
	    }
	}	
}
