import Artifact from "entities/artifacts/Artifact";
export class Function extends Artifact {
    constructor (functionDTO, isAPIArtifact, isReadOnly, projectId) {
        super(isAPIArtifact, isReadOnly, projectId);
        this._name = functionDTO.name;
        this.returnType = functionDTO.returnType;
        
        functionDTO.parameters.forEach(function(parameter){ this.paramNames.add(parameter.name) });
        functionDTO.parameters.forEach(function(parameter){ this.paramTypes.add(parameter.type) });
        functionDTO.parameters.forEach(function(parameter){ this.paramDescriptions.add(parameter.description) });

        this.header = functionDTO.header;
        this.description = functionDTO.description;
        this.code = functionDTO.code;
        this.linesOfCode = (this.code.match("/\n/g") || []).length + 2;

        this.isCompleted = false;

        this.lookForWork(this.id);

        this.storeToFirebase();
    }

    get name() {
        return this._name;
    }

    get numParams() {
        paramNames.size();
    }

    storeToFirebase() {
        int firebaseVersion = version + 1;

        // FirebaseService.writeFunction(....);

        incrementVersion();
    }
}