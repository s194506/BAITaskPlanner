import React from 'react';
import { Link } from 'react-router-dom';

import firebase from 'firebase';

export default class SignUpPage extends React.Component {
  state = {
    isFetching: false,
    error: ''
  }
  

  onSignUpByEmail(e) {
    e.preventDefault();

    var name = this.refs['nameInput'].value;
    var email = this.refs['emailInput'].value;
    var password = this.refs['passwordInput'].value;
    var repeatPassword = this.refs['repeatPasswordInput'].value;

    this.setState({isFetching:true, error:''});
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredentials) => {
      var newUser = userCredentials.user;
      newUser.updateProfile({ displayName: name })

      // now when we registered user in auth, add a record in firestore
      firebase.firestore().collection('users').doc(newUser.uid).set({
        uid: newUser.uid,
        displayName: name,
        email: newUser.email,
        photoURL: newUser.photoURL,
      })

      this.setState({isFetching:false, error: ''})
    }).catch(e => {
      console.error(e);
      this.setState({isFetching:false, error:e.message})
    });
  }

  googleClick() {
    var googleAuthProvider = new firebase.auth.GoogleAuthProvider();
    this.setState({isFetching:true, error:''});
    firebase.auth().signInWithRedirect(googleAuthProvider).then((userCredentials) => {
      var newUser = userCredentials.user;
      // now when we registered user in auth, add a record in firestore
      firebase.firestore().collection('users').doc(newUser.uid).set({
        uid: newUser.uid,
        displayName: newUser.displayName,
        email: newUser.email,
        photoURL: newUser.photoURL,
      })
      this.setState({isFetching:false, error:''})
    }).catch((error) => {
      console.log('redirect result fail prom')
      this.setState({isFetching:false, error:error.message})
    });
  }

  facebookClick() {    
    var facebookAuthProvider = new firebase.auth.FacebookAuthProvider();
    this.setState({isFetching:true, error:''});
    firebase.auth().signInWithRedirect(facebookAuthProvider).then((userCredentials) => {
      var newUser = userCredentials.user;
      // now when we registered user in auth, add a record in firestore
      firebase.firestore().collection('users').doc(newUser.uid).set({
        uid: newUser.uid,
        displayName: newUser.displayName,
        email: newUser.email,
        photoURL: newUser.photoURL,
      })
      this.setState({isFetching:false, error:''})
    }).catch((error) => {
      console.log('redirect result fail prom')
      this.setState({isFetching:false, error:error.message+' prom'})
    });
  }

  signout() {
    firebase.auth().signOut()
  }

  render() {
    var currentUser = firebase.auth().currentUser;

    return (
      <div>
        <Link to='/'>to main</Link>
        <br/>
        <Link to='/signin'>back to sign in page</Link>
        <h1>Sign Up</h1>
        <br/>
        <form onSubmit={this.onSignUpByEmail.bind(this)}>
          Name: <input ref='nameInput'/>
          <br/>
          Login: <input ref='emailInput'/>
          <br/>
          Password: <input type='password' ref='passwordInput'/>
          <br/>
          Repeat password: <input type='password' ref='repeatPasswordInput'/>
          <br/>
          <button>sign up</button>
        </form>

        <div>OR</div>

        <button onClick={this.facebookClick.bind(this)}>Sign up with Facebook</button>
        <button onClick={this.googleClick.bind(this)}>Sign up with Google</button>

        {
          this.state.isFetching && <div>Waiting...</div>
        }
        {
          this.state.error && <div>{this.state.error}</div>
        }
        
        
        {
          currentUser && (
            <div>
              <div>Authorized: {currentUser.displayName} ({currentUser.providerData[0].providerId})</div>
              <Link to='/folders'>to folders</Link>
              <button onClick={this.signout.bind(this)}>Sign out</button>
            </div>
          )

        }
      </div>
    )
  }
}