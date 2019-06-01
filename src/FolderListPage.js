import React from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';


export default class FolderListPage extends React.Component {
  state = {
    isFetching: false,
    error: '',
    folders: []
  }

  realtimeUnsibscribeOwn = null
  realtimeUnsibscribeCollab = null

  componentWillUnmount() {
    this.realtimeUnsibscribeOwn()
    this.realtimeUnsibscribeCollab()
  }

  componentDidMount() {
    var currentUserUid = firebase.auth().currentUser.uid;

    this.realtimeUnsibscribeOwn = firebase.firestore().collection('folders')
    .where('owner','==',currentUserUid).onSnapshot(this.onFoldersSnapshot.bind(this))

    this.realtimeUnsibscribeCollab = firebase.firestore().collection('folders')
    .where('collaborators','array-contains',currentUserUid).onSnapshot(this.onFoldersSnapshot.bind(this))
  }

  onFoldersSnapshot(next) {
    var folders = this.state.folders;
    
    var changes = next.docChanges();
    for (var i = 0; i < changes.length; i++) {
      switch (changes[i].type) {
        case 'added':
          var newFolder = changes[i].doc.data();
          newFolder.id = changes[i].doc.id;
          folders.push(newFolder);
        break;
        case 'modified':
          var modifiedFolder = changes[i].doc.data();
          modifiedFolder.id = changes[i].doc.id;
          var folderIndex = folders.findIndex(folder => folder.id === changes[i].doc.id);
          folders[folderIndex] = modifiedFolder;
        break;
        case 'removed':
          var folderIndex = folders.findIndex(folder => folder.id === changes[i].doc.id);
          folders.splice(folderIndex, 1);
        break;
      }
    }

    this.setState({folders: folders});
  }

  
  signout() {
    firebase.auth().signOut()
  }

  render() {
    const currentUser = firebase.auth().currentUser;
    // console.log('currentUser.providerData',currentUser && currentUser.providerData)

    return (
      <div>
        <div style={{background:'grey', padding:'5px'}}>
          <span>
            <button onClick={this.signout}>Sign out</button>
          {
            currentUser 
            ? `${currentUser.displayName} (${currentUser.providerData[0].providerId}) (${currentUser.uid})`
            : 'Not authorized!'
          }
          </span>
        </div>
        <div>
          {
            this.state.folders.length === 0 
            ? <div>No folders</div>
            : false
          }
          {
            this.state.folders.map( (folder) => {
              return (
                <div>
                  <img height={40} src='https://cdn1.iconfinder.com/data/icons/education-set-3/512/folder-open-512.png'/>
                  <Link to={'/folders/'+folder.id+'/tasks'}>{folder.name}</Link>
                  <span>(id:{folder.id})</span>
                  <Link to={'/folders/'+folder.id+'/edit'}>edit</Link>
                  {
                    folder.owner !== currentUser.uid
                    ? <span>(collab)</span>
                    : false
                  }
                </div>
              )
            })
          }
        </div>
        <div>
          <Link to='/folders/create'>Add folder...</Link>
        </div>
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