import React from 'react';
import { Link } from 'react-router-dom';

export default class LoginPage extends React.Component {


  onFormSubmit(e) {
    e.preventDefault();

    var login = this.refs['loginInput'].value;
    var password = this.refs['passwordInput'].value;

    alert(login+' '+password);
  }

  render() {
    return (
      <div>
        <Link to='/'>to main</Link>
        <br/>
        <Link to='/signup'>signup instead</Link>
        <br/>
        <form onSubmit={this.onFormSubmit}>
          Login: <input name='login' ref='loginInput'/>
          <br/>
          Password: <input name='password' type='password' ref='passwordInput'/>
          <br/>
          <button>login</button>
        </form>
      </div>
    )
  }
}