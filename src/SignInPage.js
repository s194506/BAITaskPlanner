import React from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';

export default class SignInPage extends React.Component {
  state = {
    isFetching: false,
    error: ''
  }

  componentDidMount() {
    firebase.auth().getRedirectResult().then((userCredentials) => {
      var newUser = userCredentials.user;
      if (newUser === null) return;
      this.setState({isFetching:false, error: ''})
    }).catch(e => {
      this.setState({isFetching:false, error:e.message})
    });
  }

  googleClick() {
    var googleAuthProvider = new firebase.auth.GoogleAuthProvider();
    this.setState({isFetching:true, error:''});
    firebase.auth().signInWithRedirect(googleAuthProvider).then((userCredentials) => {
      this.setState({isFetching:false, error:''})
    }).catch((error) => {
      this.setState({isFetching:false, error:error.message})
    });
  }

  facebookClick() {    
    var facebookAuthProvider = new firebase.auth.FacebookAuthProvider();
    this.setState({isFetching:true, error:''});
    firebase.auth().signInWithRedirect(facebookAuthProvider).then((userCredentials) => {
      this.setState({isFetching:false, error:''})
    }).catch((error) => {
      this.setState({isFetching:false, error:error.message})
    });
  }


  onFormSubmit(e) {
    e.preventDefault();
    var email = this.refs['emailInput'].value;
    var password = this.refs['passwordInput'].value;

    this.setState({
      isFetching: true,
      error: ''
    });

    firebase.auth().signInWithEmailAndPassword(email, password).then( userCredentials => {
      this.setState({
        isFetching: false,
        error: ''
      });
    }).catch( reason => {
      this.setState({
        isFetching: false,
        error: reason.message
      });
    });
  }


  signout() {
    firebase.auth().signOut()
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
            this.state.error
            ? <span>Error: {this.state.error}</span>
            : false
          }
        </form>

        <div>OR</div>

        <button onClick={this.facebookClick.bind(this)}>Sign in with Facebook</button>
        <button onClick={this.googleClick.bind(this)}>Sign in with Google</button>
        
        {
          firebase.auth().currentUser 
          ? <div>
              <div>Authorized: {firebase.auth().currentUser.displayName} ({firebase.auth().currentUser.providerData[0].providerId})</div>
              <Link to='/folders'>to folders</Link>
              <button onClick={this.signout.bind(this)}>Sign out</button>
            </div>
          : false
        }
      </div>
    )
  }
}