import React from 'react';
import { Route, Switch } from 'react-router-dom';
import MainPage from './MainPage';
import SignInPage from './SignInPage';
import SignUpPage from './SignUpPage';
import FolderListPage from './FolderListPage';
import CreateFolderPage from './CreateFolderPage';
import FolderViewPage from './FolderViewPage';
import ChatPage from './ChatPage';
import firebase from 'firebase';
import EditFolderPage from './EditFolderPage';

export default class App extends React.Component {

  componentDidMount() {

    firebase.auth().onAuthStateChanged(() => {
      this.forceUpdate();
    });
  }


  render() {

    // Switch chooses one of the pages to show 
    return (
      <Switch>
        <Route exact path='/' component={MainPage}/>
        <Route path='/signin' component={SignInPage}/>
        <Route path='/signup' component={SignUpPage}/>
        <Route path='/folders/create' component={CreateFolderPage}/>
        <Route path='/folders/:folderId/chat' component={ChatPage}/>
        <Route path='/folders/:folderId/edit' component={EditFolderPage}/>
        <Route path='/folders/:folderId/tasks' component={FolderViewPage}/>
        <Route path='/folders' component={FolderListPage}/>
      </Switch>      
    );
  }
}