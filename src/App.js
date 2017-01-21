import React, { Component } from 'react';
import './App.css';
import Todo from './Todo';
import { Grid, Row } from 'react-bootstrap';

class Header extends Component {
  render() {
    return (
      <Row className="Header">
        <h1>topotodo</h1>
      </Row>
    );
  }
}

class Footer extends Component {
  render() {
    return (
      <Row className="Footer">
      </Row>
    );
  }
}

class App extends Component {
  render() {
    return (
      <Grid className="App" fluid>
        <Header />
        <Todo />
        <Footer />
      </Grid>
    );
  }
}

export default App;
