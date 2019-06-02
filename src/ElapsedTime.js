import React from 'react';

// accepted props:
// dateFrom: string timestamp in standart UTC format (2019-06-02T19:14:00)
// dateTo: optional, string timestamp in standart UTC format (2019-06-02T19:14:00)
export default class ElapsedTime extends React.Component {
  timerId = null
  state = {
    displayedText: '00:00'
  }



  componentDidMount() {
    this.recalculateDisplayedText();
    this.timerId = setInterval(this.recalculateDisplayedText.bind(this), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerId)
  }

  recalculateDisplayedText() {

    var newDisplayedText = '00:00'; //default value, if props.dateFrom is not provided

    if (this.props.dateFrom) {
      var dateFrom = new Date(this.props.dateFrom);
      var dateTo = this.props.dateTo ? new Date(this.props.dateTo) : new Date(); // new Date() = now
      var differenceMs = dateTo - dateFrom;

      var minutes = Math.floor(differenceMs / (1000 * 60));
      var seconds = Math.floor(differenceMs / 1000) % 60;

      newDisplayedText = minutes.toString().padStart(2,'0') + ':' + seconds.toString().padStart(2,'0')
    }

    this.setState({displayedText: newDisplayedText})
  }


  render() {
    return (
      <span>{this.state.displayedText}</span>
    );
  }
}