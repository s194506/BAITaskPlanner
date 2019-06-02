import React from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';

import logoPNG from './img/logo.png';


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

  render() {
    return (
      <div className='page'>
        <div class="top-bar h4">
          Sign In
        </div>
        <div class="content">
          
          <div class="text-center">
            <img src={logoPNG} className='logo'/>
          </div>

          <form className='mb-3' onSubmit={this.onFormSubmit.bind(this)}>
            <div class="form-group">
              <label for="">Email: </label>
              <input className='form-control' ref='emailInput'/>
            </div>
            
            <div class="form-group">
              <label for="">Password: </label>
              <input className='form-control' type='password' ref='passwordInput'/>
            </div>
            
            <div class="form-group">
              <button className='btn btn-primary btn-block'>Sign In</button>
            </div>
            {
              this.state.isFetching
              ? <span>Waiting...</span>
              : false
            }
            {
              this.state.error
              ? <div className='text-danger'>Error: {this.state.error}</div>
              : false
            }
          </form>
  
          <div class="btn-group-vertical btn-block">
            <button className='btn btn-primary' onClick={this.facebookClick.bind(this)}>Sign in with Facebook</button>
            <button className='btn btn-danger' onClick={this.googleClick.bind(this)}>Sign in with Google</button>
          </div>
  
          <div className='text-center py-1'>OR</div>
          
          <Link to='/signup' className='btn btn-block btn-outline-secondary'>Register new account</Link>

        </div>
      </div>
    )
  }
}