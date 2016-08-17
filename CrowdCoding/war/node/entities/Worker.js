export default class Worker {
    constructor (userid, nickname, project) {
        this.project = project.getKey();
        this.userid = userid;
        this.nickname = nickname;
        this.score = 0;
        this.level = 2;
        this.listOfAchievements = setAchievements();
        this.storeToFirebase(project.getID());
    }
}