import React from 'react';
import firebase from 'firebase';
import { Link, withRouter } from 'react-router-dom';

import cameraSVG from './img/camera.svg';

export default withRouter(class ChatPage extends React.Component {

  state = {
    folder: null,

    isFetching: false,
    error:'',
    imagesToSend:[],

    usersById: {},
    messages: [],
  }

  realtimeUnsubscribe = null

  componentDidMount() {
    // this one is needed to display folder's name at the top
    firebase.firestore().collection('folders').doc(this.props.match.params['folderId'])
    .get().then( docSnapshot => {
      var folder = docSnapshot.data();
      folder.id = docSnapshot.id;

      this.setState({ folder: folder});
    })


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
    this.setState({messages: messages});
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

  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.refs['messages-div'].scrollTo(0,1e10);
  }

  render() {
    var folderId = this.props.match.params['folderId'];

    return (
      <div className='page'>
        <div className='top-bar'>
          <div className='top-bar-left-elements'>
            <Link className='btn btn-outline-light' to={'/folders/'+folderId+'/tasks'}>{'<'}</Link>
          </div>
          <div className='top-bar-center-elements'>
            Chat for '{this.state.folder ? this.state.folder.name : ''}'
          </div>
        </div>
        
        <div className='content' ref='messages-div'>
          {
            this.state.messages.map( (message) => {
              var isCurrentUserMessage = message.userId === firebase.auth().currentUser.uid;
              var photoURL = this.state.usersById[message.userId] && this.state.usersById[message.userId].photoURL;
              var displayName = (this.state.usersById[message.userId] && this.state.usersById[message.userId].displayName) || '';
              var wrapperClassName = isCurrentUserMessage?'ml-5 own-message':'mr-5 others-message';
              var avatarClassName = isCurrentUserMessage?'ml-2 float-right':'mr-2 float-left';
              var contentClassName = isCurrentUserMessage?' text-right':' text-left';
              var attachmentsClassName = isCurrentUserMessage?' own-attachments':' others-attachments';

              return (
                <div className={'mb-3 rounded overflow-hidden '+wrapperClassName}>
                  <img className={'border-0 bg-secondary '+avatarClassName} width={40} height={40} src={photoURL}/>
                  <div className={'clearfix  '+contentClassName}>
                    <div className='text-muted small' style={{fontSize:10}}>{displayName}</div>
                    <div>{message.text}</div>
                    
                  </div>
                  {
                      message.attachedImages && message.attachedImages.length > 0
                      && (
                        <div className={'p-1'+attachmentsClassName}>
                          <div className='text-muted small' style={{fontSize:10}}>attachments</div>
                          {
                            message.attachedImages.map((imageUrl)=> {
                              return (
                                <a className=' mx-1' href={imageUrl}><img height={30} src={imageUrl}/></a>
                              )
                            })
                          }
                        </div>
                      )
                    }
                </div>
              )
            })
          }
        </div>
        <div>
          <form onSubmit={this.sendMessage.bind(this)}>
            <div className="input-group">
              <div className="input-group-prepend">
                <button className='btn btn-warning btn-sm rounded-0' type='button' onClick={this.onTakePhotoClick.bind(this)} disabled={this.state.isFetching}>
                  <img src={cameraSVG} height={25}/>
                </button>
              </div>
              <input className='form-control' ref='newMessageText' disabled={this.state.isFetching}/>
              <div className="input-group-append">
                <button className='btn btn-primary btn-sm rounded-0' disabled={this.state.isFetching}>Send</button>
              </div>
            </div>
          </form>
          <div>
            {
              this.state.imagesToSend.map( (imageToSend) => {
                return <img className='mx-1' height={50} src={imageToSend}/>
              })
            }
          </div>
          {
            this.state.error
            ? <div className='text-danger'>{this.state.error}</div>
            : false
          }
        </div>
      </div>
    )
  }
})
