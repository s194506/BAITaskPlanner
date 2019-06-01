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
    if (this.state.isFetching) return;

    var email = this.refs['emailInput'].value;
    var password = this.refs['passwordInput'].value;
    var repeatPassword = this.refs['repeatPasswordInput'].value;

    if (password !== repeatPassword) {
      this.setState({isFetching:false, error:'Passwords don\'t match'});
    }

    this.setState({isFetching:true, error:''});
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredentials) => {
      this.setState({isFetching:false, error: ''})
    }).catch(e => {
      console.error(e);
      this.setState({isFetching:false, error:e.message})
    });
  }

  

  render() {
    var currentUser = firebase.auth().currentUser;

    return (
      <div className='page'>
        <div class="top-bar h4">
          <div class="top-bar-left-elements">
            <Link to='/signin' className='btn btn-outline-light'>{'<'}</Link>
          </div>
          <div className='top-bar-center-elements'>Sign Up</div>
        </div>
        <div class="content">
          <form className='mb-5' onSubmit={this.onSignUpByEmail.bind(this)}>
            <div class="form-group">
              <label>Email:</label>
              <input className='form-control' ref='emailInput'/>
              
            </div>
            
            <div class="form-group">
              <label>Password:</label>
              <input className='form-control' type='password' ref='passwordInput'/>
              
            </div>
            
            <div class="form-group">
              <label>Repeat password:</label>
              <input className='form-control' type='password' ref='repeatPasswordInput'/>
              
            </div>
            <div class="form-group">
              <button class='btn btn-block btn-primary'>Sign Up</button>
            </div>
            {
              this.state.isFetching && <div>Waiting...</div>
            }
            {
              this.state.error && <div className='text-danger'>{this.state.error}</div>
            }
          </form>
        </div>
      </div>
    )
  }
}