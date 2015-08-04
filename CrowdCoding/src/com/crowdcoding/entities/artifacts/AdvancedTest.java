package com.crowdcoding.entities.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.dto.ajax.microtask.submission.TestDTO;
import com.crowdcoding.dto.firebase.artifacts.AdvancedTestInFirebase;
import com.crowdcoding.history.ArtifactCreated;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Subclass;

@Subclass(index=true)
public class AdvancedTest extends Test
{
	private String code;


	/******************************************************************************************
	 * Constructor
	 *****************************************************************************************/

	// Constructor for deserialization
	protected AdvancedTest()
	{
	}

	public AdvancedTest(TestDTO test, long functionId, boolean isApiArtifact,boolean isReadOnly, String projectId)
	{
		super(test.description, test.isSimple, functionId, isApiArtifact,isReadOnly, projectId);


		this.code 		   = test.code;

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


	/******************************************************************************************
	 * Firebase methods
	 *****************************************************************************************/

	private void storeToFirebase()
	{
		int firebaseVersion = version + 1;

		FirebaseService.writeAdvancedTest(new AdvancedTestInFirebase(this.id,
													 firebaseVersion,
													 this.description,
													 this.code,
													 this.functionId,
													 this.creationTime,
													 this.isSimple,
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
	public static AdvancedTest load(Ref<AdvancedTest> ref)
	{
		return ofy().load().ref(ref).now();
	}

	// Given an id for a test, finds the corresponding test. Returns null if no such test exists.
	public static AdvancedTest find(long id)
	{
		return (AdvancedTest) ofy().load().key(Artifact.getKey(id)).now();
	}

}
