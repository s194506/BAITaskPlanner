import React from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';


export default class FolderListPage extends React.Component {
  state = {
    isFetching: false,
    error: '',
    folders: []
  }

  componentDidMount() {

    this.setState({isFetching:true,error:''})

    var currentUserUid = firebase.auth().currentUser.uid;
    // var currentUserUid='ekCq2eBs4uPK9nZ1F1Oho4n6lG33' // hack, kucherovvv97@gmail.com

    Promise.all([
      firebase.firestore().collection('folders').where('owner','==',currentUserUid).get(), // own folders
      firebase.firestore().collection('folders').where('collaborators','array-contains',currentUserUid).get() // collab folders
    ]).then((results) => {
      var ownFolders = results[0].docs.map(docSnapshot => {
        var folder = docSnapshot.data();
        folder.id = docSnapshot.id;
        return folder;
      });
      var collabFolders = results[1].docs.map(docSnapshot => {
        var folder = docSnapshot.data();
        folder.id = docSnapshot.id;
        return folder;
      });
      
      console.log(ownFolders, collabFolders)
      this.setState({
        isFetching:false,
        error:'',
        folders:ownFolders.concat(collabFolders)
      });
    }).catch((reason) => {
      this.setState({isFetching:false, error:reason.message})
    })
  }

  render() {
    const currentUser = firebase.auth().currentUser;
    // console.log('currentUser.providerData',currentUser && currentUser.providerData)

    return (
      <div>
        <div style={{background:'grey', padding:'5px'}}>
          <span>
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
                  <Link to={'/folders/'+folder.id}>{folder.name}</Link>
                  <span>(id:{folder.id})</span>
                  <Link to={'/folders/'+folder.id+'/edit'}>edit</Link>
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