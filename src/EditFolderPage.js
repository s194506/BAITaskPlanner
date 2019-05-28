import React from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import firebase from 'firebase';
import UserToggler from './UserToggler';

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
      <div>
        {
          this.state.folder
          && 
          <div>
            <h3>Editing folder {this.state.folder.id}</h3>
            <form onSubmit={this.onSubmit.bind(this)}>
              Folder name <input ref='folderNameInput' defaultValue={this.state.folder.name}/>
              <br/>
              <UserToggler userFilterCallback={(user)=>user.uid !== this.state.folder.owner} checkedUsersList={this.state.folder.collaborators} onToggle={this.onUserToggle.bind(this)}/>
              <br/>
              <button>Save</button>
            </form>
          </div>
        }
        
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
})