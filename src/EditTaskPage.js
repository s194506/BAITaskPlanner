import React from 'react';
import { Link, withRouter, Redirect } from 'react-router-dom';
import firebase from 'firebase';

import ElapsedTime from './ElapsedTime';


import calendarSVG from './img/calendar.svg';
import noteSVG from './img/note.svg';
import personSVG from './img/person.svg';

import stopwatchSVG from './img/stopwatch.svg';
import stopSVG from './img/stop.svg';
import playSVG from './img/play.svg';

import trashCanSVG from './img/trash-can.svg';
import UserToggler from './UserToggler';


export default withRouter(class FolderViewPage extends React.Component {
  state = {
    users: [],

    isFetching: false,
    error:'',

    task: null,

    isReminderEditing: false,
    isNoteEditing: false,
    isPersonEditing: false,
    newPersonList:[],

    readyState: 0,

    toRedirect: false
  }

  componentDidMount() {
    
    var folderId = this.props.match.params['folderId'];
    var taskId = this.props.match.params['taskId'];

    this.setState({isFetching: true, error:''})
    Promise.all([
      firebase.firestore().doc('folders/'+folderId).get(),
      firebase.firestore().doc('folders/'+folderId+'/tasks/'+taskId).get(),
      firebase.firestore().collection('users').get(),
    ]).then( ([folderSnapshot, taskSnapshot, usersCollection]) => {
      var folder = folderSnapshot.data();
      folder.id = folderSnapshot.id;
      
      var task = taskSnapshot.data();
      task.id = taskSnapshot.id;

      var users = usersCollection.docs.map(userSnapshot => userSnapshot.data())

      this.setState({isFetching:false, error:'', task: task, folder:folder, users:users});
    }).catch((reason) => {
      this.setState({isFetching:false, error: reason.message})
    })


    this.realtimeUnsubscribe = 
    firebase.firestore().doc('folders/'+this.props.match.params['folderId']+'/tasks/'+this.props.match.params['taskId'])
    .onSnapshot((docSnapshot) => {
      var newTaskState = docSnapshot.data();
      this.setState({task: newTaskState});
    })
  }

  componentWillUnmount() {
    this.realtimeUnsubscribe();
  }


  
  onRemoveTaskClick() {
    var folderId = this.props.match.params['folderId'];
    var taskId = this.props.match.params['taskId'];

    this.setState({isFetching: true, error:''});
    firebase.firestore().collection('folders/'+folderId+'/tasks').doc(taskId)
    .delete().then( () => {
      this.setState({isFetching: false, error:'', toRedirect: true});
    }).catch( reason => {
      this.setState({isFetching: false, error:reason.message});
    })
  }

  onPlayClick() {
    this.setState({isFetching: true, error:''});
    firebase.firestore().doc('folders/'+this.props.match.params['folderId']+'/tasks/'+this.props.match.params['taskId'])
    .update( { stopwatchStart: new Date().toISOString(), stopwatchEnd: null } ).then( () => {
      this.setState({isFetching: false, error:''});
    }).catch( reason => {
      this.setState({isFetching: false, error:reason.message});
    })
  }

  onStopClick() {
    if (!this.state.task.stopwatchStart || this.state.task.stopwatchEnd) return;

    this.setState({isFetching: true, error:''});
    firebase.firestore().doc('folders/'+this.props.match.params['folderId']+'/tasks/'+this.props.match.params['taskId'])
    .update( { stopwatchEnd: new Date().toISOString() } ).then( () => {
      this.setState({isFetching: false, error:''});
    }).catch( reason => {
      this.setState({isFetching: false, error:reason.message});
    })
  }

  /****************/
  onAddReminderClick() {
    this.setState({isReminderEditing: true})
  }

  onReminderSubmit(e) {
    e.preventDefault();
    var newReminderDate = this.refs['reminderInput-date'].value;
    var newReminderTime = this.refs['reminderInput-time'].value;
    var newReminder = newReminderDate+'T'+newReminderTime

    this.setState({isFetching: true, error:''});
    firebase.firestore().doc('folders/'+this.props.match.params['folderId']+'/tasks/'+this.props.match.params['taskId'])
    .update( { reminderDate: newReminder } ).then( () => {
      this.setState({isFetching: false, error:'', isReminderEditing:false});
    }).catch( reason => {
      this.setState({isFetching: false, error:reason.message});
    })
  }

  onRemoveReminderClick() {
    
    this.setState({isFetching: true, error:''});
    firebase.firestore().doc('folders/'+this.props.match.params['folderId']+'/tasks/'+this.props.match.params['taskId'])
    .update( { reminderDate: null } ).then( () => {
      this.setState({isFetching: false, error:''});
    }).catch( reason => {
      this.setState({isFetching: false, error:reason.message});
    })
  }

  
  /****************/
  onAddNoteClick() {
    this.setState({isNoteEditing: true})
  }


  onNoteSubmit(e) {
    e.preventDefault();
    var newNote = this.refs['noteInput'].value;

    this.setState({isFetching: true, error:''});
    firebase.firestore().doc('folders/'+this.props.match.params['folderId']+'/tasks/'+this.props.match.params['taskId'])
    .update( { note: newNote } ).then( () => {
      this.setState({isFetching: false, error:'', isNoteEditing: false});
    }).catch( reason => {
      this.setState({isFetching: false, error:reason.message});
    })
  }

  onRemoveNoteClick() {
    
    this.setState({isFetching: true, error:''});
    firebase.firestore().doc('folders/'+this.props.match.params['folderId']+'/tasks/'+this.props.match.params['taskId'])
    .update( { note: null } ).then( () => {
      this.setState({isFetching: false, error:''});
    }).catch( reason => {
      this.setState({isFetching: false, error:reason.message});
    })
  }


  
  /****************/
  onAddPersonClick() {
    this.setState({isPersonEditing: true, newPersonList:this.state.task.persons || []})
  }


  onPersonsSubmit() {

    this.setState({isFetching: true, error:''});
    firebase.firestore().doc('folders/'+this.props.match.params['folderId']+'/tasks/'+this.props.match.params['taskId'])
    .update( { persons: this.state.newPersonList } ).then( () => {
      this.setState({isFetching: false, error:'', isPersonEditing: false, newPersonList:[]});
    }).catch( reason => {
      this.setState({isFetching: false, error:reason.message});
    })
  }

  // onRemovePersonClick() {
    
  //   this.setState({isFetching: true, error:''});
  //   firebase.firestore().doc('folders/'+this.props.match.params['folderId']+'/tasks/'+this.props.match.params['taskId'])
  //   .update( { person: null } ).then( () => {
  //     this.setState({isFetching: false, error:''});
  //   }).catch( reason => {
  //     this.setState({isFetching: false, error:reason.message});
  //   })
  // }


  onPersonToggle(uid) {
    var persons = this.state.newPersonList;
    if (persons.includes(uid)) {
      persons.splice(persons.indexOf(uid),1)
    } else {
      persons.push(uid)
    }
    this.setState({newPersonList:persons})
  }

  userFilter(user) {
    return this.state.folder.collaborators.includes(user.uid) || this.state.folder.owner === user.uid;
  }

  render() {
    var folderId = this.props.match.params['folderId'];
    var taskId = this.props.match.params['taskId'];

    if (this.state.toRedirect) return <Redirect to={'/folders/'+folderId+'/tasks'}/>;

    return (
      <div className='page'>
        <div className='top-bar'>
          <div className="top-bar-left-elements">
            <Link to={'/folders/'+folderId+'/tasks'} className='btn btn-outline-light'>{'<'}</Link>
          </div>
          <span className='top-bar-center-elements'>
            {this.state.task ? this.state.task.text : ''}
          </span>
          <div className="top-bar-right-elements">
            <button className='btn btn-sm btn-danger' onClick={this.onRemoveTaskClick.bind(this)}> 
              <img src={trashCanSVG} height={15}/>
            </button>
          </div>
        </div>



        <div className='content'>
          {
            !this.state.task || !this.state.folder
            ? <div>Waiting...</div>
            : (
              <div>
                <ul className='list-unstyled my-list'>
                  <li>
                    <img src={calendarSVG} width={41} className='mr-2'/>
                    {
                      this.state.isReminderEditing
                      ? <form onSubmit={this.onReminderSubmit.bind(this)} className='input-group'>
                          <input className='form-control' ref='reminderInput-date' type='date' required/>
                          <input className='form-control' ref='reminderInput-time' type='time' required/>
                          <div className='input-group-append'>
                            <button className='btn btn-primary'>Done</button>
                          </div>
                        </form>
                      : this.state.task.reminderDate
                        ? <span>
                            <span>{new Date(this.state.task.reminderDate).toLocaleString()}</span>
                            <span className='btn btn-sm btn-outline-danger ml-2' onClick={this.onRemoveReminderClick.bind(this)}>X</span>
                          </span>
                        : <span className='list-item-content' onClick={this.onAddReminderClick.bind(this)}>
                            Choose date and set reminder
                          </span>
                    }
                    
                  </li>
                  <li>
                    <img src={noteSVG} width={35} className='mr-3'/>
                    {
                      this.state.isNoteEditing
                      ? <form onSubmit={this.onNoteSubmit.bind(this)} className='input-group'>
                          <input className='form-control' ref='noteInput' required/>
                          <div className='input-group-append'>
                            <button className='btn btn-primary'>Done</button>
                          </div>
                        </form>
                      : this.state.task.note
                        ? <span>
                            <span>{this.state.task.note}</span>
                            <span className='btn btn-sm btn-outline-danger ml-2' onClick={this.onRemoveNoteClick.bind(this)}>X</span>
                          </span>
                        : <span className='list-item-content' onClick={this.onAddNoteClick.bind(this)}>
                            Add a note
                          </span>
                    }
                    
                  </li>
                  <li>
                    <img src={personSVG} width={35} className='mr-3'/>
                    {
                      this.state.isPersonEditing
                      ? <div>
                          <UserToggler userFilterCallback={this.userFilter.bind(this)} checkedUsersList={this.state.newPersonList} onToggle={this.onPersonToggle.bind(this)}/>
                          <button className='btn btn-block btn-primary' onClick={this.onPersonsSubmit.bind(this)}>Save</button>
                        </div>
                      : this.state.task.persons && this.state.task.persons.length > 0
                        ? <span>
                            <span className='list-item-content'>
                              {
                                this.state.task.persons && this.state.task.persons.map(uid => 
                                  <div className='my-1'>
                                    {this.state.users.find(user => user.uid === uid).displayName}
                                  </div>
                                )
                              }
                            </span>
                            <span className='btn btn-sm btn-outline-danger ml-2' onClick={this.onAddPersonClick.bind(this)}>edit</span>
                          </span>
                        : <span className='list-item-content' onClick={this.onAddPersonClick.bind(this)}>
                            Add a person
                          </span>
                    }
                    
                  </li>
                </ul>

                <div className='d-flex justify-content-center align-items-center'>
                  <img height={30} src={playSVG} onClick={this.onPlayClick.bind(this)}/>
                  <img height={100} src={stopwatchSVG} className='mx-4'/>
                  <img height={30} src={stopSVG} onClick={this.onStopClick.bind(this)}/>
                </div>
                <div className='text-center my-2 h5'>
                  <ElapsedTime dateFrom={this.state.task.stopwatchStart} dateTo={this.state.task.stopwatchEnd}/>
                </div>

                {
                  this.state.isFetching
                  ? <div>Wait...</div>
                  : this.state.error
                    ? <div className='text-danger'>{this.state.error}</div>
                    : false
                }
              </div>
            )
          }

          
        </div>
      </div>
    )
  }
})