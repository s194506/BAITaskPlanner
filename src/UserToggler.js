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
      <ul className='list-group'>
        {
          this.state.users.map( user => {
            var isUserCollaborator = this.props.checkedUsersList.includes(user.uid);
            var buttonClassName = isUserCollaborator ? 'btn-success' : 'btn-outline-secondary';
            var buttonText = isUserCollaborator ? 'remove' : 'add';
            return (
              <li className='list-group-item clearfix'>
                <button className={'btn btn-sm float-right ml-2 '+buttonClassName} type='button' onClick={this.onToggleButtonClick.bind(this, user.uid)}>
                  {buttonText}
                </button>
                <span>{user.displayName} ({user.email})</span>
              </li>
            )
          })
        }
      </ul>
    )
  }
}