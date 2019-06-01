import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
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
  state = { 
    isAuthReady: false 
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(() => {
      if (!this.state.isAuthReady) {
        this.setState({isAuthReady:true})
      }

      this.forceUpdate();
    });
  }


  render() {
    // gotta wait until firebase calls onAuthStateChanged the first time
    // until then dont render any app pages
    if (!this.state.isAuthReady) return <div className='text-center py-5 text-secondary'>Wait a sec...</div>

    if (!firebase.auth().currentUser) {
      return (
        <Switch>
          <Route path='/signin' component={SignInPage}/>
          <Route path='/signup' component={SignUpPage}/>
          <Redirect to='/signin'/>
        </Switch>   
      )
    } else {
      return (
        <Switch>
          <Route path='/folders/create' component={CreateFolderPage}/>
          <Route path='/folders/:folderId/chat' component={ChatPage}/>
          <Route path='/folders/:folderId/edit' component={EditFolderPage}/>
          <Route path='/folders/:folderId/tasks' component={FolderViewPage}/>
          <Route path='/folders' component={FolderListPage}/>
          <Redirect to='/folders'/>
        </Switch>
      )
    }

  }
}