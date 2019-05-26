import React from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';

export default class SignInPage extends React.Component {
  state = {
    isFetching: false,
    signinError: ''
  }

  onFormSubmit(e) {
    e.preventDefault();
    var email = this.refs['emailInput'].value;
    var password = this.refs['passwordInput'].value;

    this.setState({
      isFetching: true,
      signinError: ''
    });

    firebase.auth().signInWithEmailAndPassword(email, password).then( userCredentials => {
      this.setState({
        isFetching: false,
        signinError: ''
      });
    }).catch( reason => {
      this.setState({
        isFetching: false,
        signinError: reason.message
      });
    });
  }

  render() {
    return (
      <div>
        <Link to='/'>to main</Link>
        <br/>
        <Link to='/signup'>sign up instead</Link>
        <br/>
        <form onSubmit={this.onFormSubmit.bind(this)}>
          Email: <input ref='emailInput'/>
          <br/>
          Password: <input type='password' ref='passwordInput'/>
          <br/>
          <button>sign in</button>
          {
            this.state.isFetching
            ? <span>wait just a sec...</span>
            : false
          }
          {
            this.state.signinError
            ? <span>Error: {this.state.signinError}</span>
            : false
          }
        </form>
        {
          firebase.auth().currentUser
          ? <Link to='/folders'>to folders</Link>
          : false
        }
      </div>
    )
  }
}