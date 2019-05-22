import React from 'react';
import { Link } from 'react-router-dom';

export default class SignUpPage extends React.Component {


  onFormSubmit(e) {
    e.preventDefault();

    var login = this.refs['loginInput'].value;
    var password = this.refs['passwordInput'].value;
    var repeatPassword = this.refs['repeatPasswordInput'].value;

    alert(login+' '+password+' '+repeatPassword);
  }

  googleClick() {
    // TODO: google sign in
    alert('google sign in is not implemented yet');
  }

  facebookClick() {
    // TODO: facebook sign in
    alert('facebook sign in is not implemented yet');
  }

  render() {
    return (
      <div>
        <Link to='/'>to main</Link>
        <br/>
        <Link to='/login'>back to login</Link>
        <h1>Sign Up</h1>
        <br/>
        <form onSubmit={this.onFormSubmit.bind(this)}>
          Login: <input name='login' ref='loginInput'/>
          <br/>
          Password: <input name='password' type='password' ref='passwordInput'/>
          <br/>
          Repeat password: <input name='repeatPassword' type='password' ref='repeatPasswordInput'/>
          <br/>
          <button>sign up</button>
        </form>
        <button onClick={this.facebookClick.bind(this)}>Sign up with Facebook</button>
        <button onClick={this.googleClick.bind(this)}>Sign up with Google</button>
      </div>
    )
  }
}