package com.crowdcoding.entities.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.dto.firebase.artifacts.TestInFirebase;
import com.crowdcoding.history.ArtifactCreated;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Subclass;

@Subclass(index=true)
public class Test extends Artifact
{
	private long functionId;
	private String description;
	private String code;
	private double creationTime;
	private boolean hasEverPassed;	//flag to indicate that the test has passed at least once, doesn't say if in this moment is passing


	/******************************************************************************************
	 * Constructor
	 *****************************************************************************************/

	// Constructor for deserialization
	protected Test()
	{
	}

	public Test(String description, String code, long functionId, boolean isApiArtifact,boolean isReadOnly, String projectId)
	{
		super(isApiArtifact, isReadOnly, projectId);


		this.functionId    = functionId;
		this.description   = description;
		this.code 		   = code;
		this.creationTime  = System.currentTimeMillis();
		this.hasEverPassed = false;

		ofy().save().entity(this).now();

		HistoryLog.Init(projectId).addEvent(new ArtifactCreated( this ));

		storeToFirebase();

		FunctionCommand.addTest(functionId, this.id);
	}

	/******************************************************************************************
	 * Accessors
	 *****************************************************************************************/

	public String getTestCode()
	{
		if(code == null)
		{
			return "";
		}
		return code;
	}

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


	/******************************************************************************************
	 * Commands
	 *****************************************************************************************/

	/**updates this test if description and code differ from the old one */
	public void update(String newDescription, String newCode){
		if( ! ( this.description + this.code ).equals( newDescription + newCode ) )
		{
			this.description     = newDescription;
			this.code		     = newCode;
			ofy().save().entities(this).now();
			storeToFirebase();
			FunctionCommand.incrementTestSuite(this.functionId);
		}

	}

	/** Marks this test as deleted**/
	public void delete()
	{
		deleteArtifact();
		storeToFirebase();
		FunctionCommand.incrementTestSuite(this.functionId);
	}

	/** Sets the test has passed**/
	public void hasPassed()
	{
		this.hasEverPassed = true;
		ofy().save().entity(this).now();
		storeToFirebase();
		FunctionCommand.incrementTestSuite(this.functionId);
	}

	/******************************************************************************************
	 * Firebase methods
	 *****************************************************************************************/

	public void storeToFirebase()
	{
		int firebaseVersion = version + 1;

		FirebaseService.writeTest(new TestInFirebase(this.id,
													 firebaseVersion,
													 this.description,
													 this.code,
													 this.functionId,
													 this.hasEverPassed,
													 this.creationTime,
													 this.isReadOnly,
													 this.isAPIArtifact,
													 this.isDeleted),
									this.functionId,
									this.id,
									firebaseVersion,
									projectId);

		incrementVersion();
	}

	/******************************************************************************************
	 * Objectify Datastore methods
	 *****************************************************************************************/

	// Given a ref to a function that has not been loaded from the datastore,
	// load it and get the object
	public static Test load(Ref<Test> ref)
	{
		return ofy().load().ref(ref).now();
	}

	// Given an id for a test, finds the corresponding test. Returns null if no such test exists.
	public static Test find(long id)
	{
		return (Test) ofy().load().key(Artifact.getKey(id)).now();
	}

}
