import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from 'firebase';

import chatSVG from './img/chat.svg';
import checkOutlineSVG from './img/check-outline.svg';
import checkFilledSVG from './img/check-filled.svg';


import starOutlineSVG from './img/star-outline.svg';
import starFilledSVG from './img/star-filled.svg';

import searchSVG from './img/search.svg';


export default withRouter(class FolderViewPage extends React.Component {
  state = {
    folder:null,

    showDone: false,
    sortType: 'date', // date, favorite
    tasks: [],
    isSearchActive: false,
    searchQuery: ''
  }

  componentDidMount() {
    
    // this one is needed to display folder's name at the top
    firebase.firestore().collection('folders').doc(this.props.match.params['folderId'])
    .get().then( docSnapshot => {
      var folder = docSnapshot.data();
      folder.id = docSnapshot.id;

      this.setState({ folder: folder});
    })


    this.realtimeUnsubscribe = 
    firebase.firestore().collection('folders/'+this.props.match.params['folderId']+'/tasks')
    .onSnapshot((next) => {
      var tasks = this.state.tasks;

      var changes = next.docChanges();
      for (var i = 0; i < changes.length; i++) {
        switch (changes[i].type) {
          case 'added':
            var newTask = changes[i].doc.data();
            newTask.id = changes[i].doc.id;
            tasks.push(newTask);
          break;
          case 'modified':
            var modifiedTask = changes[i].doc.data();
            modifiedTask.id = changes[i].doc.id;
            var taskIndex = tasks.findIndex(task => task.id === changes[i].doc.id);
            tasks[taskIndex] = modifiedTask;
          break;
          case 'removed':
            var taskIndex = tasks.findIndex(task => task.id === changes[i].doc.id);
            tasks.splice(taskIndex, 1);
          break;
        }
      }

      tasks = tasks.sort( (t1,t2) => t2.isFavorite - t1.isFavorite || new Date(t2.creationDate) - new Date(t1.creationDate))
      this.setState({tasks: tasks});
    })
  }

  componentWillUnmount() {
    this.realtimeUnsubscribe();
  }

  onTaskAdd(e) {
    e.preventDefault();

    const text = this.refs['newTaskText'].value;
    const isFavorite = this.refs['newTaskIsFavorite'].checked;
    if (!text) return;


    this.setState({isFetching: true, error:''});
    firebase.firestore().collection('folders/'+this.props.match.params['folderId']+'/tasks').doc().set({
      isDone: false,
      isFavorite: isFavorite,
      text: text,
      creationDate: new Date().toISOString(),
      createdBy: firebase.auth().currentUser.uid,
      doneDate: null,

    }).then( () => {
      this.refs['newTaskText'].value = '';
      this.setState({isFetching: false, error:''});
    }).catch( reason => {
      this.setState({isFetching: false, error:reason.message});
    })
  }

  toggleTaskDone(taskId) {
    if (this.state.isFetching) return;

    var tasks = this.state.tasks;
    var task = tasks.find(task => task.id === taskId);

    var newIsDone = !task.isDone;
    var newDoneDate = newIsDone ? new Date().toISOString() : null;

    this.setState({isFetching: true, error:''});
    firebase.firestore().collection('folders/'+this.props.match.params['folderId']+'/tasks').doc(taskId).update({
      isDone: newIsDone,
      doneDate: newDoneDate,
    }).then( () => {
      this.setState({isFetching: false, error:''});
    }).catch( reason => {
      this.setState({isFetching: false, error:reason.message});
    })
  }

  toggleTaskFavorite(taskId) {
    if (this.state.isFetching) return;

    var tasks = this.state.tasks;
    var task = tasks.find(task => task.id === taskId);

    var newFavorite = !task.isFavorite;

    this.setState({isFetching: true, error:''});
    firebase.firestore().collection('folders/'+this.props.match.params['folderId']+'/tasks').doc(taskId).update({
      isFavorite: newFavorite,
    }).then( () => {
      this.setState({isFetching: false, error:''});
    }).catch( reason => {
      this.setState({isFetching: false, error:reason.message});
    })
  }

  
  removeTask(taskId) {
    this.setState({isFetching: true, error:''});
    firebase.firestore().collection('folders/'+this.props.match.params['folderId']+'/tasks').doc(taskId)
    .delete().then( () => {
      this.setState({isFetching: false, error:''});
    }).catch( reason => {
      this.setState({isFetching: false, error:reason.message});
    })
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
              <div className="top-bar-left-elements">
                <Link to='/folders' className='btn btn-outline-light'>{'<'}</Link>
              </div>
              <span className='top-bar-center-elements'>{this.state.folder ? this.state.folder.name : ''}</span>
              <div className="top-bar-right-elements">
                <button className='btn btn-sm' onClick={this.showSearch.bind(this)}>
                  <img src={searchSVG} height={20}/>
                </button>
                <Link to={'/folders/'+this.props.match.params.folderId+'/chat'}  className='btn btn-primary'>
                  <img height={20} src={chatSVG}/>
                </Link>
              </div>
            </div>
          )
        }
        <div style={{display:this.state.isSearchActive ? 'none' : ''}}>
          <form onSubmit={this.onTaskAdd.bind(this)}>
            <div className="input-group p-1">
              <input className='form-control' ref='newTaskText' disabled={this.state.isFetching}/>
              <div className="input-group-append">
                <button className='btn btn-success text-bold' disabled={this.state.isFetching}><b>+</b></button>
              </div>
              <div className="input-group-append">
                <label className=' custom-checkbox mx-2 my-1'>
                  <input ref='newTaskIsFavorite' type='checkbox' disabled={this.state.isFetching}/>
                  <img src={starOutlineSVG} className='custom-checkbox-not-checked' height={25}/>
                  <img src={starFilledSVG} className='custom-checkbox-checked' height={25}/>
                </label>
              </div>
            </div>
            {
              this.state.error
              ? <div className='text-danger'>{this.state.error}</div>
              : false
            }
          </form>
        </div>


        <div className='content'>
          <ul className='list-unstyled my-list'>
            {
              this.state.tasks.map( (task) => {
                if (!this.state.showDone && task.isDone) return false;

                if (this.state.isSearchActive) {
                  if (!this.state.searchQuery) return;
                  if (!task.text.toLowerCase().includes(this.state.searchQuery.toLowerCase())) return;
                }


                var textClassName = task.isDone ? 'strike text-muted' : '';

                return (
                  <li className='d-flex flex-row align-items-center'>
                    <img 
                      className='mr-3 my-1'
                      onClick={this.toggleTaskDone.bind(this, task.id)} 
                      width={25} 
                      src={task.isDone ? checkFilledSVG : checkOutlineSVG}
                      />
                    
                    <Link 
                      className={'list-item-content '+textClassName} 
                      to={'/folders/'+this.props.match.params['folderId']+'/tasks/'+task.id}
                      >
                      {task.text}
                    </Link>

                    <img 
                      className='align-self-right'
                      onClick={this.toggleTaskFavorite.bind(this, task.id)} 
                      width={30} 
                      src={task.isFavorite ? starFilledSVG : starOutlineSVG}
                      />
                  </li>
                )
              })
            }
          </ul>

        </div>
        
        <div className='px-1'>
          <button className='btn btn-sm btn-block btn-outline-secondary my-1 ' onClick={()=>this.setState({showDone: !this.state.showDone})}>
            {this.state.showDone ? 'Hide done' : 'Show done'}
          </button>
        </div>
      </div>
    )
  }
})