import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import firebase from 'firebase';

export default class CreateFolderPage extends React.Component {
  state = {
    isFetching: false,
    error:'',

    doRedirect: false
  }
  // var folderExample2 = {
  //   id: 5467,
  //   name: 'Things to forget',
  //   lastModified: '2019-05-20T17:04:05+02:00',
  //   creationDate: '2019-05-16T15:56:05+02:00',
  //   owner: 6757,
  //   collaborators: [],
  // }

  onSubmit(e) {
    e.preventDefault();
    var folderName = this.refs['folderNameInput'].value;


    this.setState({isFetching: true, error: ''});
    firebase.firestore().collection('folders').doc().set({
      name: folderName,
      lastModified: new Date().toISOString(),
      creationDate: new Date().toISOString(),
      owner: firebase.auth().currentUser.uid,
      collaborators: []
    }).then(() => {
      this.setState({isFetching:false, error:'', doRedirect: true});
    }).catch((reason) => {
      this.setState({isFetching:false, error:reason.message})
    })
  }

  render() {
    if (this.state.doRedirect) return <Redirect to='/folders'/>

    return (
      <div>
        <form onSubmit={this.onSubmit.bind(this)}>
          Folder name <input ref='folderNameInput'/>
          <br/>
          <button>Create</button>
        </form>
        {
          this.state.isFetching
          ? <div>Wait...</div>
          : this.state.error
            ? <div>{this.state.error}</div>
            : false
        }
      </div>
    )
  }
}