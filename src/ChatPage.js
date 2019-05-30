import React from 'react';
import firebase from 'firebase';
import { Link, withRouter } from 'react-router-dom';

export default withRouter(class ChatPage extends React.Component {

  state = {
    isFetching: false,
    error:'',
    imagesToSend:[],

    usersById: {},
    messages: [],
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

    this.realtimeUnsubscribe = 
      firebase.firestore().collection('folders/'+this.props.match.params['folderId']+'/messages')
      .onSnapshot(this.onServerDataUpdated.bind(this));
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
    });
    messages = messages.sort((m1,m2) => new Date(m1.creationDate) - new Date(m2.creationDate))
    this.setState({messages: messages})
  }

  sendMessage(e) {
    e.preventDefault();
    var folderId = this.props.match.params['folderId'];
    var messageData = {
      userId: firebase.auth().currentUser.uid,
      creationDate: new Date().toISOString(),
      text: this.refs['newMessageText'].value,
      attachedImages: this.state.imagesToSend
    }


    this.setState({isFetching: true, error: ''})
    firebase.firestore().collection('folders/'+folderId+'/messages').doc().set(messageData)
    .then(() => {
      this.refs['newMessageText'].value = '';
      this.setState({isFetching: false, error: '', imagesToSend: []})
    }).catch( reason => {
      this.setState({isFetching: false, error: reason.message})
    })
  }

  onTakePhotoClick() {
    var folderId = this.props.match.params['folderId'];

    var cameraOptions = {
      quality: 50,
      targetWidth: 300,
      targetHeight: 300,
      destinationType: window.Camera.DestinationType.DATA_URL,
      saveToPhotoAlbum: false
    }

    navigator.camera.getPicture((imageDataB64) => {
      var newFileName = Math.round(Math.random()*999999999)+'.jpg';
      var newFilePath = folderId+'/'+newFileName;
      var newFileRef = firebase.storage().ref().child(newFilePath);

      this.setState({isFetching:true, error:''})
      newFileRef.putString(imageDataB64,'base64').then(() => {
        
        newFileRef.getDownloadURL().then((url) => {
          var imagesToSend = this.state.imagesToSend;
          imagesToSend.push(url);
          this.setState({isFetching:false,error:'', imagesToSend: imagesToSend });
        })
        
      }).catch((reason) => {
        console.error(reason);
        this.setState({isFetching:false,error:reason.message})
      })

    }, (message) => {
      this.setState({error: message})
    }, cameraOptions);


  }

  render() {
    var folderId = this.props.match.params['folderId'];

    return (
      <div>
        <Link to={'/folders/'+folderId+'/tasks'}>back to folder</Link>
        <h1>Chat for folder ??</h1>
        <div style={{width:300}}>
          {
            this.state.messages.map( (message) => {
              var isCurrentUserMessage = message.userId === firebase.auth().currentUser.uid;
              var photoURL = this.state.usersById[message.userId] && this.state.usersById[message.userId].photoURL;
              var displayName = (this.state.usersById[message.userId] && this.state.usersById[message.userId].displayName) || '';
              var align = isCurrentUserMessage?'right':'left';
              var color = isCurrentUserMessage?'lime':'lightblue';

              return (
                <div>
                  <img style={{float:align}} width={40} height={40} src={photoURL}/>
                  <div style={{background:color, marginBottom:'3px', textAlign:align}}>
                    <div style={{fontSize:10, opacity:.5}}>{displayName} {message.creationDate}</div>
                    <div>{message.text}</div>
                    <div style={{clear:'both'}}></div>
                    <div></div>
                    {
                      message.attachedImages
                      && (
                        <div>
                          {
                            message.attachedImages.map((imageUrl)=> {
                              return (
                                <div style={{margin:'6px', background:'lightgreen'}}>
                                  <img height={30} src={imageUrl}/>
                                  <a href={imageUrl} target='_blank'> view </a>
                                </div>
                              )
                            })
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
            <input ref='newMessageText' disabled={this.state.isFetching}/>
            <button disabled={this.state.isFetching}>Send</button>
            <button type='button' onClick={this.onTakePhotoClick.bind(this)} disabled={this.state.isFetching}>Take photo</button>
          </form>
          <div>
            {
              this.state.imagesToSend.map( (imageToSend) => {
                return <img height={50} src={imageToSend}/>
              })
            }
          </div>
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
