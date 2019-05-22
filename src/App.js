import React from 'react';
import { Route, Switch } from 'react-router-dom';
import MainPage from './MainPage';
import LoginPage from './LoginPage';
import SignUpPage from './SignUpPage';
import FolderListPage from './FolderListPage';
import FolderViewPage from './FolderViewPage';
import ChatPage from './ChatPage';

export default class App extends React.Component {



  render() {

    // Switch chooses one of the pages to show 
    return (
      <Switch>
        <Route exact path='/' component={MainPage}/>
        <Route path='/login' component={LoginPage}/>
        <Route path='/signup' component={SignUpPage}/>
        <Route path='/folders/:folderId/chat' component={ChatPage}/>
        <Route path='/folders/:folderId' component={FolderViewPage}/>
        <Route path='/folders' component={FolderListPage}/>
      </Switch>      
    );
  }
}