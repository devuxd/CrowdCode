package com.crowdcoding.entities.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.history.ArtifactCreated;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Subclass;

@Subclass(index=true)
public class Test extends Artifact
{
	protected long functionId;
	protected String description;
	protected boolean isSimple;
	protected double creationTime;


	/******************************************************************************************
	 * Constructor
	 *****************************************************************************************/

	// Constructor for deserialization
	protected Test()
	{
	}

	public Test(String description, boolean isSimple, long functionId, boolean isApiArtifact,boolean isReadOnly, String projectId)
	{
		super(isApiArtifact, isReadOnly, projectId);

		this.functionId    = functionId;
		this.description   = description;
		this.isSimple 	   = isSimple;
		this.creationTime  = System.currentTimeMillis();
	}

	/******************************************************************************************
	 * Accessors
	 *****************************************************************************************/
	public String getDescription()
	{
		return description;
	}


		public String getName()
	{
		return description;
	}

	public long getFunctionId()
	{
		return functionId;
	}

}