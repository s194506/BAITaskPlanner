import React from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';

import plusSVG from './img/plus.svg';
import folderSVG from './img/folder.svg';
import searchSVG from './img/search.svg';

export default class FolderListPage extends React.Component {
  state = {
    isFetching: false,
    error: '',
    folders: [],
    isSearchActive: false,
    searchQuery: ''
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

  showSearch() {
    this.setState({isSearchActive:true, searchQuery:''});
  }
  hideSearch() {
    this.setState({isSearchActive:false, searchQuery:''});
  }

  onSearchQueryChange(e) {
    var newSearchQuery = this.refs['searchInput'].value;
    this.setState({searchQuery: newSearchQuery});
  }

  render() {
    const currentUser = firebase.auth().currentUser;
    // console.log('currentUser.providerData',currentUser && currentUser.providerData)

    return (
      <div className='page'>
        {
          this.state.isSearchActive
          ? (
            <div className='top-bar'>
              <div class="input-group">
                <input className='form-control' ref='searchInput' onChange={this.onSearchQueryChange.bind(this)}/>
                <div className='input-group-append'>
                  <button className='btn btn-outline-light' onClick={this.hideSearch.bind(this)}>X</button>
                </div>
              </div>
            </div>
          )
          : (
            <div className='top-bar'>
              <div class="top-bar-left-elements">
                <button className='btn btn-sm btn-outline-light ' onClick={this.signout}>Sign out</button>
              </div>
              <div className='top-bar-center-elements'>
                {
                  currentUser 
                  ? currentUser.displayName || currentUser.email
                  : 'Not authorized!'
                }
              </div>
              <div class="top-bar-right-elements">
                <button className='btn btn-sm' onClick={this.showSearch.bind(this)}>
                  <img src={searchSVG} height={20}/>
                </button>
              </div>
            </div>
          )
        }


        <div className='content with-bottom-button'>
          {
            this.state.folders.length === 0 
            ? <div>No folders</div>
            : <ul className='list-unstyled my-list'>
                {
                  this.state.folders.map( (folder) => {
                    if (this.state.isSearchActive) {
                      if (!this.state.searchQuery) return;
                      if (!folder.name.toLowerCase().includes(this.state.searchQuery.toLowerCase())) return;
                    }

                    return (
                      <li>
                        <img height={30} src={folderSVG}/>
                        <div className="list-item-content mx-3">
                          <Link to={'/folders/'+folder.id+'/tasks'}>{folder.name}</Link>
                          {
                            folder.owner !== currentUser.uid
                            ? <span className='ml-1 text-muted small va-super'>(collab)</span>
                            : false
                          }
                        </div>
                        <Link className='btn btn-sm btn-outline-secondary float-right' to={'/folders/'+folder.id+'/edit'}>edit</Link>
                      </li>
                    )
                  })
                }
              </ul>
          }
          
          {
            this.state.isFetching
            ? <div>Wait...</div>
            : this.state.error
              ? <div className='text-danger'>{this.state.error}</div>
              : false
          }
          <Link className='bottom-circle-button bg-primary' to='/folders/create'>
            <img height={25} src={plusSVG}/>
          </Link>
        </div>
      </div>
    )
  }
}