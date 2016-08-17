import Artifact from "Artifact";
export class ADT extends Artifact {
    constructor (description, name, structure, examples, isApiArtifact, isReadOnly, projectId) {
        super(isApiArtifact, isReadOnly, projectId);
        this._name		 = name;
        this._description = description;
        this.structure	 = structure;
        this.examples 	 = examples;
        
        storeToFirebase();

        // HistoryLog.Init(projectId).addEvent(new ArtifactCreated( this ));
    }
    get description() {
        return this._description;
    }
    get name() {
        return this._name;
    }

    delete() {
        this._isDeleted = true;
        storeToFirebase(projectId);
    }

    update(description, name, structure) {
        this._description = description;
        this._name        = name;
        this.structure    = structure;

        storeToFirebase();
    }

    addFunction(functionId) {
        this.functionsId.add(functionId);
    }

    removeFunction(functionId) {
        this.functionsId.remove(functionId);
    }

    storeToFirebase() {
        firebaseVersion = version + 1;

        // FirebaseService.writeAdt(....);

        incrementVersion();
    }

    //objectify
}