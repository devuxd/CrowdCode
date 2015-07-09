package com.crowdcoding.history;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Stack;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.logging.Logger;

import com.crowdcoding.servlets.ThreadContext;
import com.crowdcoding.util.FirebaseService;
import com.crowdcoding.util.Pair;

/* HistoryLogs capture the events that occur during a session. As they only persist for the life
 * of a session, they are not stored in the DataStore. A HistoryLog consists of a tree of events.
 * Calling beginEvent begins a list of entries that are the child of the previously active entry.
 *
 * Note: there must be a single root event. All events may have multiple children.
 */
public class HistoryLog
{
	private static HistoryLog historyLog = null;
	private String projectId = "";

	public HistoryLog(){
	}

	public static HistoryLog Init(String projectId){
		if( historyLog == null || historyLog.projectId!=projectId ){
			historyLog = new HistoryLog(projectId);
		}
		return historyLog;
	}

	public HistoryLog(String projectId) {
		this.projectId = projectId;
	}

	public void addEvent(HistoryEvent event){
	    FirebaseService.writeHistoryEvent(event,projectId);
	}

	public class EventNode
	{
		public List<EventNode> children = new ArrayList<EventNode>();
		public HistoryEvent event;

		public EventNode(HistoryEvent event)
		{
			this.event = event;
		}
	}
}
