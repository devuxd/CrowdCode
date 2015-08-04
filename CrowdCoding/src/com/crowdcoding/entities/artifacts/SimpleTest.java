package com.crowdcoding.entities.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.List;

import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.dto.ajax.microtask.submission.TestDTO;
import com.crowdcoding.dto.firebase.artifacts.SimpleTestInFirebase;
import com.crowdcoding.history.ArtifactCreated;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.history.PropertyChange;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Subclass;

@Subclass(index=true)
public class SimpleTest extends Test
{
	private List<String> inputs;
	private String output;


	/******************************************************************************************
	 * Constructor
	 *****************************************************************************************/

	// Constructor for deserialization
	protected SimpleTest()
	{
	}

	public SimpleTest(TestDTO test, long functionId, boolean isApiArtifact, boolean isReadOnly, String projectId)
	{
		super(test.description, test.isSimple, functionId, isApiArtifact,isReadOnly, projectId);


		this.inputs 	= test.inputs;
		this.output 	= test.output;

		ofy().save().entity(this).now();
		storeToFirebase();

		HistoryLog.Init(projectId).addEvent(new ArtifactCreated( this ));
		FunctionCommand.addTest(functionId, this.id);


	}

	/******************************************************************************************
	 * Accessors
	 *****************************************************************************************/

	public String getName(){

		return "stub";

	}
	/******************************************************************************************
	 * Commands
	 *****************************************************************************************/

	// Marks this test as deleted, removing it from the list of tests on its owning function.
	public void delete()
	{
		deleteArtifact();

		storeToFirebase();

	}

	public void update(String output)
	{
		this.output	= output;
		ofy().save().entities(this).now();
		storeToFirebase();

	}

	/******************************************************************************************
	 * Firebase methods
	 *****************************************************************************************/

	private void storeToFirebase()
	{
		int firebaseVersion = version + 1;

		FirebaseService.writeSimpleTest(new SimpleTestInFirebase(this.id,
													 firebaseVersion,
													 this.inputs,
													 this.output,
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
	public static SimpleTest load(Ref<SimpleTest> ref)
	{
		return ofy().load().ref(ref).now();
	}

	// Given an id for a test, finds the corresponding test. Returns null if no such test exists.
	public static SimpleTest find(long id)
	{
		return (SimpleTest) ofy().load().key(Artifact.getKey(id)).now();
	}

}

