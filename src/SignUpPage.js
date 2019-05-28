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

    var email = this.refs['emailInput'].value;
    var password = this.refs['passwordInput'].value;
    var repeatPassword = this.refs['repeatPasswordInput'].value;

    this.setState({isFetching:true, error:''});
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredentials) => {
      this.setState({isFetching:false, error: ''})
    }).catch(e => {
      console.error(e);
      this.setState({isFetching:false, error:e.message})
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
          Email: <input ref='emailInput'/>
          <br/>
          Password: <input type='password' ref='passwordInput'/>
          <br/>
          Repeat password: <input type='password' ref='repeatPasswordInput'/>
          <br/>
          <button>sign up</button>
        </form>


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