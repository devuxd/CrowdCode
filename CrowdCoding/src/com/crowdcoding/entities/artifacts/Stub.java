package com.crowdcoding.entities.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.List;

import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.dto.firebase.artifacts.StubInFirebase;
import com.crowdcoding.history.ArtifactCreated;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.history.PropertyChange;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Subclass;

@Subclass(index=true)
public class Stub extends Artifact
{
	private long functionId;
	private List<String> inputs;
	private String output;


	/******************************************************************************************
	 * Constructor
	 *****************************************************************************************/

	// Constructor for deserialization
	protected Stub()
	{
	}

	public Stub(List<String> inputs, String output, long functionId, boolean isApiArtifact, boolean isReadOnly, String projectId)
	{
		super(isApiArtifact, isReadOnly, projectId);


		this.functionId = functionId;
		this.inputs 	= inputs;
		this.output 	= output;

		ofy().save().entity(this).now();
		storeToFirebase();

		FunctionCommand.addStub(functionId, this.id);

		HistoryLog.Init(projectId).addEvent(new ArtifactCreated( this ));

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

	public void update(List<String> inputs, String output)
	{
		this.inputs	= inputs;
		this.output	= output;
		ofy().save().entities(this).now();
		storeToFirebase();

	}

	/******************************************************************************************
	 * Firebase methods
	 *****************************************************************************************/

	public void storeToFirebase()
	{
		int firebaseVersion = version + 1;

		FirebaseService.writeStub(new StubInFirebase(this.id,
													 firebaseVersion,
													 this.inputs,
													 this.output,
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
	public static Stub load(Ref<Stub> ref)
	{
		return ofy().load().ref(ref).now();
	}

	// Given an id for a test, finds the corresponding test. Returns null if no such test exists.
	public static Stub find(long id)
	{
		return (Stub) ofy().load().key(Artifact.getKey(id)).now();
	}

}

