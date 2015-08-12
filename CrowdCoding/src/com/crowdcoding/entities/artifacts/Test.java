package com.crowdcoding.entities.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.dto.ajax.microtask.submission.TestDTO;
import com.crowdcoding.dto.firebase.artifacts.AdvancedTestInFirebase;
import com.crowdcoding.dto.firebase.artifacts.SimpleTestInFirebase;
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
	private List<String> inputs;
	private String output;
	private String code;
	protected double creationTime;


	/******************************************************************************************
	 * Constructor
	 *****************************************************************************************/

	// Constructor for deserialization
	protected Test()
	{
	}

	public Test(TestDTO test, long functionId, boolean isApiArtifact,boolean isReadOnly, String projectId)
	{
		super(isApiArtifact, isReadOnly, projectId);

		this.functionId    = functionId;
		
		this.description   = test.description;
		this.isSimple 	   = test.isSimple;
		
		if( isSimple ){
			this.inputs = test.inputs;
			this.output = test.output;
		}
		else {
			this.code = test.code;
		}
			
			
		this.creationTime  = System.currentTimeMillis();
		

		ofy().save().entity(this).now();
		storeToFirebase();

		HistoryLog.Init(projectId).addEvent(new ArtifactCreated( this ));
		FunctionCommand.addTest(functionId, this.id);
	}

	/******************************************************************************************
	 * Accessors
	 *****************************************************************************************/
	public String getDescription(){
		return description;
	}


	public String getName(){
		return description;
	}

	public long getFunctionId(){
		return functionId;
	}

	
	/**updates this test if description and code differ from the old one */
	public void update(TestDTO testDto){
		this.isSimple = testDto.isSimple;
	
		this.code = testDto.code;
		this.inputs = testDto.inputs;
		this.output = testDto.output;
		
		this.description     = testDto.description;
		
	
		ofy().save().entities(this).now();
		storeToFirebase();
		
		FunctionCommand.incrementTestSuite(this.functionId);
	}

	/** Marks this test as deleted**/
	public void delete(){
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
		
		if( this.isSimple ){
			FirebaseService.writeSimpleTest(
				new SimpleTestInFirebase(this.id,
					 firebaseVersion,
					 this.inputs,
					 this.output,
					 this.description,
					 this.isSimple,
					 this.isReadOnly,
					 this.isAPIArtifact,
					 this.isDeleted
				),
				this.functionId,
				this.id,
				firebaseVersion,
				projectId
			);
		}
		else {
			FirebaseService.writeAdvancedTest(
				new AdvancedTestInFirebase(
					this.id,
					firebaseVersion,
					this.description,
					this.code,
					this.functionId,
					this.creationTime,
					this.isSimple,
					this.isReadOnly,
					this.isAPIArtifact,
					this.isDeleted
				),
				this.functionId,
				this.id,
				firebaseVersion,
				projectId
			);
		}

		incrementVersion();
	}
	
	public static Test load(Ref<Test> ref)
	{
		return ofy().load().ref(ref).now();
	}

	public static Test find(long id)
	{
		return (Test) ofy().load().key(Artifact.getKey(id)).now();
	}
}