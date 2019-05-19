import React from 'react';

export default class App extends React.Component {
  render() {
    const divstyle = {
      width:'100vw',
      height:'100vh',
      background:'linear-gradient(to top, #19293a, #061926)', 
      color:'#eee', 
      fontFamily:'Verdana, Geneva, sans-serif', 
      display:'flex', 
      alignItems:'center',
      justifyContent:'center',
      textAlign:'center',
      fontSize:'3rem',
      padding:'15px'
    };

    return (
      <div style={divstyle}>
        <span>Now you can use <b>cordova</b> apis inside <b>React</b>!</span>
      </div>      
    );
  }
}