import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from 'firebase';


export default withRouter(class FolderViewPage extends React.Component {
  state = {
    showDone: false,
    sortType: 'date', // date, favorite
    tasks: []
  }

  componentDidMount() {
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

  render() {
    return (
      <div>
        <div>
          <Link to='/folders'>to folders</Link>
          <span>{this.props.match.params['folderId']}</span>
          <Link to={'/folders/'+this.props.match.params.folderId+'/chat'}>to chat</Link>
        </div>
        <div>
          <form onSubmit={this.onTaskAdd.bind(this)}>
            <button disabled={this.state.isFetching}>+</button>
            <input ref='newTaskText' disabled={this.state.isFetching}/>
            <input ref='newTaskIsFavorite' type='checkbox' disabled={this.state.isFetching}/> fav
            {
              this.state.isFetching
              ? <span>Wait...</span>
              : this.state.error
                ? <span>{this.state.error}</span>
                : false
            }
          </form>
        </div>
        <div>
          {
            this.state.tasks.map( (task) => {
              if (!this.state.showDone && task.isDone) return false;

              return (
                <div style={{background:'grey', border:'1px solid black'}}>
                  <img onClick={this.toggleTaskDone.bind(this, task.id)} width={30} src={task.isDone ? 'https://banner2.kisspng.com/20180403/ylq/kisspng-computer-icons-checkbox-font-login-button-5ac3a27fc69b76.1599492915227705598135.jpg' : 'http://aux2.iconspalace.com/uploads/unchecked-checkbox-icon-256.png'}/>
                  <span>{task.text}</span>
                  <span> ({task.id})</span>
                  <img onClick={this.toggleTaskFavorite.bind(this, task.id)} width={30} src={task.isFavorite ? 'https://cdn0.iconfinder.com/data/icons/simplicity/512/rate_star_full-256.png' : 'https://cdn2.iconfinder.com/data/icons/picons-essentials/71/star_off-256.png'}/>
                  <button onClick={this.removeTask.bind(this, task.id)}>remove</button>
                </div>
              )
            })
          }
        </div>
        <div>
          <button onClick={()=>this.setState({showDone: !this.state.showDone})}>
            {this.state.showDone ? 'Hide done' : 'Show done'}
          </button>
        </div>
      </div>
    )
  }
})