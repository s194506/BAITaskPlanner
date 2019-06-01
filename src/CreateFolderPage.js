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
      <div className='page'>
        <div class="top-bar">
          Create a new folder
        </div>
        <div class="content">
          <form onSubmit={this.onSubmit.bind(this)}>
            <div className="form-group">
              <label for="">Folder name:</label>
              <input className='form-control' ref='folderNameInput'/>
            </div>
            
            <div className="form-group ">
              <button className='btn btn-block btn-primary'>Create</button>
            </div>
            {
            this.state.isFetching
            ? <div>Wait...</div>
            : this.state.error
              ? <div className='text-danger'>{this.state.error}</div>
              : false
          }
          </form>
          
        </div>
      </div>
    )
  }
}