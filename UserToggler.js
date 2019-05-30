import React from 'react';
import firebase from 'firebase';


export default class UserToggler extends React.Component {
  state = {
    isFetching: false,
    error: '',
    users: []
  }

  componentDidMount() {
    this.setState({isFetching:true, error:''});
    firebase.firestore().collection('users').get().then( result => {
      var users = result.docs.map(docSnapshot => docSnapshot.data())
      if (this.props.userFilterCallback) users = users.filter(this.props.userFilterCallback)
      this.setState({isFetching: false, error: '', users: users});
    }).catch( (reason) => {
      this.setState({isFetching: false, error: reason.message})
    });
  }

  onToggleButtonClick(uid) {
    this.props.onToggle(uid)
  }

  render() {
    if (this.state.isFetching) return <div>Wait...</div>;
    if (this.state.error) return <div>{this.state.error}</div>;

    return (
      <div>
        {
          this.state.users.map( user => {
            return (
              <div>
                <span>{user.uid} </span>
                <span>{user.email} </span>
                <span>{user.displayName} </span>
                <button type='button' onClick={this.onToggleButtonClick.bind(this, user.uid)}>
                  {
                    this.props.checkedUsersList.includes(user.uid) 
                    ? 'remove' 
                    : 'add'
                  }
                </button>
              </div>
            )
          })
        }
      </div>
    )
  }
}