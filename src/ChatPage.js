import React from 'react';
import { Link } from 'react-router-dom';

export default class ChatPage extends React.Component {

  state = {
    currentUser: {id:12},
    usersById: {
      '434': {
        id:434,
        displayName:'Hooker',
        avatar: 'https://i.ytimg.com/vi/f45jPEkTf2M/hqdefault.jpg'
      },
      '12': {
        id:12,
        displayName:'Fat Bastard',
        avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/73/Fat_bastard.jpeg/220px-Fat_bastard.jpeg'
      }
    },
    messages: [{
      id:1,
      userId: 12,
      creationDate:'2019-05-19T19:04:05+02:00',
      text:'Hi! How much?'
    }, {
      id:2,
      userId: 434,
      creationDate:'2019-05-19T19:04:05+02:00',
      text:'$5/hr'
    }, {
      id:3,
      userId: 12,
      creationDate:'2019-05-19T19:04:05+02:00',
      text:'You\'ve got yourself a deal babe!'
    }, {
      id:4,
      userId: 12,
      creationDate:'2019-05-19T19:04:05+02:00',
      text:'Wanna see ma dic?'
    }, {
      id:5,
      userId: 434,
      creationDate:'2019-05-19T19:04:05+02:00',
      text:'Nah, I\'ve got my own',
      files: [
        {
          id:646,
          filename:'pic-her-own-dic.jpg',
          size:46543
        }
      ]
    }, {
      id:6,
      userId: 12,
      creationDate:'2019-05-19T19:04:05+02:00',
      text:'Aw shiet! NOPE! BYE!!!'
    } ]
  }

  sendMessage(e) {
    e.preventDefault();
    var text = this.refs['newMessageText'].value;
    this.refs['newMessageText'].value = '';

    var messages = this.state.messages;
    messages.push({
      id: 123,
      userId: this.state.currentUser.id,
      creationDate:'2019-05-19T19:04:05+02:00',
      text: text,
    });

    this.setState({
      messages: messages
    })
  }

  render() {
    return (
      <div>
        <Link to={'/folders/'+this.props.folderId}>back to folder</Link>
        <h1>Chat for folder ??</h1>
        <div style={{width:300}}>
          {
            this.state.messages.map( (message) => {
              var isCurrentUserMessage = message.userId === this.state.currentUser.id;

              return (
                <div>
                  <img style={{float:isCurrentUserMessage?'right':'left'}} width={40} height={40} src={this.state.usersById[message.userId].avatar}/>
                  <div style={{background:'cyan', marginBottom:'3px'}}>
                    <div>{message.text}</div>
                    <div style={{clear:'both'}}></div>
                    {
                      message.files
                      && (
                        <div>
                          {
                            message.files.map((file)=>(
                              <div style={{margin:'6px', background:'lightgreen'}}>
                                <img height={30} src='https://previews.123rf.com/images/tmricons/tmricons1510/tmricons151000102/45803681-copier-le-fichier-ic%C3%B4ne-dupliquer-la-cote-du-document-.jpg'/>
                                <a href='https://www.youtube.com/watch?v=dQw4w9WgXcQ' target='_blank'> {file.filename} </a>
                                <span>size: {Math.round(file.size/1024)}kb</span>
                              </div>
                            ))
                          }
                        </div>
                      )
                    }
                  </div>
                </div>
              )
            })
          }
        </div>
        <div>
          <form onSubmit={this.sendMessage.bind(this)}>
            <input ref='newMessageText'/>
            <button>Send</button>
          </form>
        </div>
      </div>
    )
  }
}