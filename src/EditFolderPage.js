import React from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import firebase from 'firebase';
import UserToggler from './UserToggler';

import trashCanSVG from './img/trash-can.svg';

export default withRouter(class EditFolderPage extends React.Component {
  state = {
    isFetching: false,
    error:'',

    folder:null,

    doRedirect: false
  }


  componentDidMount() {
    var editingFolderId = this.props.match.params['folderId'];
    this.setState({isFetching: true, error:''})
    firebase.firestore().collection('folders').doc(editingFolderId)
    .get().then( docSnapshot => {
      var folder = docSnapshot.data();
      folder.id = docSnapshot.id;

      this.setState({isFetching:false, error:'', folder: folder});
    }).catch((reason) => {
      this.setState({isFetching:false, error: reason.message})
    })
  }

  onSubmit(e) {
    e.preventDefault();
    var newFolderName = this.refs['folderNameInput'].value;

    var folder = this.state.folder;
    folder.name = newFolderName;
    folder.lastModified = new Date().toISOString();


    this.setState({isFetching: true, error: ''});
    firebase.firestore().collection('folders').doc(folder.id).set(folder).then(() => {
      this.setState({isFetching:false, error:'', doRedirect: true});
    }).catch((reason) => {
      this.setState({isFetching:false, error:reason.message})
    })
  }

  
  onRemoveFolderClick(e) {
    e.preventDefault();

    var folder = this.state.folder;

    this.setState({isFetching: true, error: ''});
    firebase.firestore().collection('folders').doc(folder.id).delete().then(() => {
      this.setState({isFetching:false, error:'', doRedirect: true});
    }).catch((reason) => {
      this.setState({isFetching:false, error:reason.message})
    })
  }

  onUserToggle(uid) {
    var folder = this.state.folder;
    if (folder.collaborators.includes(uid)) {
      folder.collaborators.splice(folder.collaborators.indexOf(uid),1)
    } else {
      folder.collaborators.push(uid)
    }

    this.setState({ folder: folder })
  }

  render() {
    if (this.state.doRedirect) return <Redirect to='/folders'/>

    return (
      <div className='page'>
        <div className='top-bar'>
          <div className="top-bar-left-elements">
            <Link to='/folders' className='btn btn-outline-light'>{'<'}</Link>
          </div>
          <span className='top-bar-center-elements'>Edit {this.props.match.params['folderId']}</span>
          
          <div className="top-bar-right-elements">
            <button className='btn btn-sm btn-danger' onClick={this.onRemoveFolderClick.bind(this)}> 
              <img src={trashCanSVG} height={15}/>
            </button>
          </div>
        </div>

        <div className='content'>
          {
            this.state.folder
            && 
            <form onSubmit={this.onSubmit.bind(this)}>
              <div className="form-group">
                <label for="">Folder name:</label>
                <input className='form-control' ref='folderNameInput' defaultValue={this.state.folder.name}/>
              </div>
              <div className="form-group">
                <label for="">Collaborators:</label>
                <UserToggler 
                  userFilterCallback={(user)=>user.uid !== this.state.folder.owner} 
                  checkedUsersList={this.state.folder.collaborators} 
                  onToggle={this.onUserToggle.bind(this)}
                  />
              </div>
              
              <div className="form-group">
                <button className='btn btn-block btn-primary'>Save</button>
              </div>
            </form>
          }
          
          {
            this.state.isFetching
            ? <div>Wait...</div>
            : this.state.error
              ? <div>{this.state.error}</div>
              : false
          }
        </div>
        
        
      </div>
    )
  }
})