import React from 'react';
import firebase from 'firebase';
import { Link, withRouter } from 'react-router-dom';

export default withRouter(class ChatPage extends React.Component {

  state = {
    isFetching: false,
    error:'',

    usersById: {},
    messages: []
  }

  realtimeUnsubscribe = null

  componentDidMount() {
    this.setState({isFetching:true, error:''});
    firebase.firestore().collection('users').get().then(result => {
      var users = result.docs.map(docSnapshot => docSnapshot.data());
      var usersById = {};
      users.forEach( user => usersById[user.uid] = user);
      this.setState({isFetching:false, error:'', usersById: usersById})
    }).catch( reason => {
      this.setState({isFetching:false, error:reason.message})
    })

    firebase.firestore().doc('folders/'+this.props.match.params['folderId']).get({source:'cache'}).then((ting)=>{
      this.setState({folder:ting.data()})
      console.warn('ye',ting)
    }).catch((reason)=>{
      console.warn('nope'+reason.message)
    })

    this.realtimeUnsubscribe = 
      firebase.firestore().collection('folders/'+this.props.match.params['folderId']+'/messages')
      .onSnapshot(this.onServerDataUpdated.bind(this));


    // firebase.firestore().collection('folders/'+this.props.match.params['folderId']+'/messages').get().then( result => {
    //   result.docs.map()
    // })
  }

  componentWillUnmount() {
    this.realtimeUnsubscribe();
  }

  onServerDataUpdated(snapshot) {
    var messages = this.state.messages;
    snapshot.docChanges().forEach(function(change) {
      if (change.type === "added") {
        messages.push(change.doc.data());
      }
      // if (change.type === "modified") {
      //     console.log("Modified city: ", change.doc.data());
      // }
      // if (change.type === "removed") {
      //     console.log("Removed city: ", change.doc.data());
      // }
    });
    messages = messages.sort((m1,m2) => new Date(m1.creationDate) - new Date(m2.creationDate))
    this.setState({messages: messages})
  }

  sendMessage(e) {
    e.preventDefault();
    var text = this.refs['newMessageText'].value;
    this.refs['newMessageText'].value = '';

    this.setState({isFetching: true, error: ''})
    firebase.firestore().collection('folders/'+this.props.match.params['folderId']+'/messages').doc().set({
      userId: firebase.auth().currentUser.uid,
      creationDate: new Date().toISOString(),
      text: text,
    }).then(() => {
      this.setState({isFetching: false, error: ''})
    }).catch( reason => {
      this.setState({isFetching: false, error: reason.message})
    })
  }

  render() {
    return (
      <div>
        <Link to={'/folders/'+this.props.match.params['folderId']}>back to folder</Link>
        <h1>Chat for folder ??</h1>
        <div style={{width:300}}>
          {
            this.state.messages.map( (message) => {
              var isCurrentUserMessage = message.userId === firebase.auth().currentUser.uid;
              var photoURL = this.state.usersById[message.userId] && this.state.usersById[message.userId].photoURL;
              var displayName = (this.state.usersById[message.userId] && this.state.usersById[message.userId].displayName) || '';
              var align = isCurrentUserMessage?'right':'left';
              var color = `hsl(${displayName.split('').map(ch=>ch.charCodeAt(0)).reduce((res,code)=>res^code,0)%360},100%,75%)`

              return (
                <div>
                  <img style={{float:align}} width={40} height={40} src={photoURL}/>
                  <div style={{background:color, marginBottom:'3px', textAlign:align}}>
                    <div style={{fontSize:10, opacity:.5}}>{displayName} {message.creationDate}</div>
                    <div>{message.text}</div>
                    <div style={{clear:'both'}}></div>
                    <div></div>
                    {/* {
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
                    } */}
                  </div>
                </div>
              )
            })
          }
        </div>
        <div>
          <form onSubmit={this.sendMessage.bind(this)}>
            <input ref='newMessageText' disabled={this.state.isFetching}/>
            <button>Send</button>
          </form>
          {
            this.state.error
            ? <div>{this.state.error}</div>
            : false
          }
        </div>
      </div>
    )
  }
})