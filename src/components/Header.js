import React from 'react';
import { Link } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

export default function Header(props) {
  return (
    <Navbar bg="light">
      <Navbar.Brand href="#/">Keep Tools</Navbar.Brand>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="#/">Home</Nav.Link>
          <Nav.Link href="#random-beacon">Random Beacon</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}
