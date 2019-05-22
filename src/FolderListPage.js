import React from 'react';
import { Link } from 'react-router-dom';

var folderExample = {
  id: 5467,
  name: '5 steps to beat alcoholism',
  lastModified: '2019-05-19T19:04:05+02:00',
  creationDate: '2019-05-17T15:04:05+02:00',
  owner: 6757,
  collaborators: [13569,4567],
}
var folderExample2 = {
  id: 5467,
  name: 'Things to forget',
  lastModified: '2019-05-20T17:04:05+02:00',
  creationDate: '2019-05-16T15:56:05+02:00',
  owner: 6757,
  collaborators: [],
}

export default class FolderListPage extends React.Component {
  state = {
    folders: [folderExample, folderExample2]
  }

  onAddClick() {
    alert('add is not implemented yet');
  }

  render() {
    return (
      <div>
        <div style={{background:'grey', padding:'5px'}}>
          <span>Say my name</span>
        </div>
        <div>
          {
            this.state.folders.map( (folder) => {
              return (
                <div>
                  <img height={40} src='https://cdn1.iconfinder.com/data/icons/education-set-3/512/folder-open-512.png'/>
                  <Link to={'/folders/'+folder.id}>{folder.name}</Link>
                  <span>{folder.id}</span>
                </div>
              )
            })
          }
        </div>
        <div>
          <button onClick={this.onAddClick.bind(this)}>+</button>
        </div>
      </div>
    )
  }
}