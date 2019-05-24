import firebase from 'firebase';


var firebaseConfig = {
  apiKey: "AIzaSyDshipfidHOJfkws_TwlTVmATnVMdp0Blw",
  authDomain: "taskplanner-62e04.firebaseapp.com",
  databaseURL: "https://taskplanner-62e04.firebaseio.com",
  projectId: "taskplanner-62e04",
  storageBucket: "taskplanner-62e04.appspot.com",
  messagingSenderId: "891181347622",
  appId: "1:891181347622:web:ec82ef9d11549ef8"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


window.firebase = firebase;



export default firebase;