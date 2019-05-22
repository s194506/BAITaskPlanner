import React from 'react';
import { Link } from 'react-router-dom';

export default class MainPage extends React.Component {

  render() {
    return (
      <div>
        Main page <Link to='/login'>login page</Link>
        <br/>
        <Link to='/folders'>to folders</Link>
      </div>
    )
  }
}