package com.crowdcoding.history;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Queue;

import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.MockDTO;
import com.crowdcoding.entities.Artifact;

/* A HistoryEvent captures a CrowdCoding event that is logged into the history stream.
 */
public abstract class HistoryEventGroup extends DTO 
{
	public List<HistoryEvent> events = new ArrayList<HistoryEvent>();
	
	public HistoryEventGroup()
	{
	}			
			
	public void addEvent(HistoryEvent event){
		this.events.add(event);
	}
	
	public String toString()
	{
		String ret = "";
		Integer i = 0;
		for( HistoryEvent event:this.events ){
			ret += "\""+event.generateID()+"\":" + event.toString() ;
			if( ++i < this.events.size() )
				ret += ",";
		}
		System.out.println("Events obj = "+ret);
		return "{" + "}";
	}
	

}
