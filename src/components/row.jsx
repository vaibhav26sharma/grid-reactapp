import React, { Component } from 'react';

class Row extends Component {
  render() {
    //props.children wil render whatever is bw <Row></Row> tag in game component
    return <div className="row">{this.props.children}</div>;
  }
}

export default Row;
