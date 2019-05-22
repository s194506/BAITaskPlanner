import React from 'react';
import { Link } from 'react-router-dom';

var currentFolder = {
  id: 5467,
  name: '5 steps to beat alcoholism',
  lastModified: '2019-05-19T19:04:05+02:00',
  creationDate: '2019-05-17T15:04:05+02:00',
  owner: 6757,
  collaborators: [13569,4567],
}

export default class FolderViewPage extends React.Component {
  state = {
    currentFolder: currentFolder,
    showDone: false,
    sortType: 'date', // date, favorite
    tasks: [{
      id:12,
      isFavorite:true,
      isDone:false,
      creationDate: '2019-05-17T15:04:05+02:00',
      text: 'froget your trouble',
    }, {
      id:13,
      isFavorite:false,
      isDone:true,
      creationDate: '2019-05-17T15:04:05+02:00',
      text: 'go onto a deep sheep',
    }, {
      id:14,
      isFavorite:true,
      isDone:false,
      creationDate: '2019-05-17T15:04:05+02:00',
      text: 'and dream what your life can get',
    }, {
      id:15,
      isFavorite:false,
      isDone:true,
      creationDate: '2019-05-17T15:04:05+02:00',
      text: 'what your life can get you',
    }, {
      id:16,
      isFavorite:true,
      isDone:false,
      creationDate: '2019-05-17T15:04:05+02:00',
      text: 'whatever',
    }]
  }

  onTaskAdd(e) {
    e.preventDefault();

    const text = this.refs['newTaskText'].value;
    const isFavorite = this.refs['newTaskIsFavorite'].checked;

    var tasks = this.state.tasks;
    tasks.push({
      id: Math.round( Math.random() * 100000 ),
      text: text,
      isFavorite: isFavorite,
      isDone: false,
      creationDate: new Date().toISOString()
    })
    this.setState({
      tasks: tasks
    })
  }

  toggleTaskDone(taskId) {
    var tasks = this.state.tasks;
    var task = tasks.find(task => task.id === taskId);
    task.isDone = !task.isDone;
    this.setState({
      tasks
    });
  }

  toggleTaskFavorite(taskId) {
    var tasks = this.state.tasks;
    var task = tasks.find(task => task.id === taskId);
    task.isFavorite = !task.isFavorite;
    this.setState({
      tasks
    });
  }

  render() {
    return (
      <div>
        <div>
          <Link to='/folders'>to folders</Link>
          <span>{this.state.currentFolder.id}</span>
          <span>{this.state.currentFolder.name}</span>
          <Link to={'/folders/'+this.props.folderId+'/chat'}>to chat</Link>
        </div>
        <div>
          <form onSubmit={this.onTaskAdd.bind(this)}>
            <button>+</button>
            <input ref='newTaskText'/>
            <input ref='newTaskIsFavorite' type='checkbox'/> fav
          </form>
        </div>
        <div>
          {
            this.state.tasks.map( (task) => {
              if (!this.state.showDone && !task.isDone) return false;

              return (
                <div style={{background:'grey', border:'1px solid black'}}>
                  <img onClick={this.toggleTaskDone.bind(this, task.id)} width={30} src={task.isDone ? 'https://banner2.kisspng.com/20180403/ylq/kisspng-computer-icons-checkbox-font-login-button-5ac3a27fc69b76.1599492915227705598135.jpg' : 'http://aux2.iconspalace.com/uploads/unchecked-checkbox-icon-256.png'}/>
                  <span>{task.text}</span>
                  <img onClick={this.toggleTaskFavorite.bind(this, task.id)} width={30} src={task.isFavorite ? 'https://cdn0.iconfinder.com/data/icons/simplicity/512/rate_star_full-256.png' : 'https://cdn2.iconfinder.com/data/icons/picons-essentials/71/star_off-256.png'}/>
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
}