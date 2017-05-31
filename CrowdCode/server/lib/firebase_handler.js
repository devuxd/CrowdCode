var firebase = require('firebase');

var app = firebase.initializeApp({
        apiKey: "AIzaSyCmhzDIbe7pp8dl0gveS2TtOH4n8mvMzsU",
        authDomain: "crowdcode2.firebaseapp.com",
        databaseURL: "https://crowdcode2.firebaseio.com",
        projectId: "crowdcode2",
        storageBucket: "crowdcode2.appspot.com",
        messagingSenderId: "382318704982"
    });
var rootRef = firebase.database().ref();

function addData(value){
    rootRef.child("data").set(value);
}
module.exports.add = addData;