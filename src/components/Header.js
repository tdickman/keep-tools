import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

export default function Header(props) {
  return (
    <Navbar bg="light">
      <Navbar.Brand href="#/">Keep Tools</Navbar.Brand>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="#/">Home</Nav.Link>
          <NavDropdown title="Random Beacon" id="basic-nav-dropdown">
            <NavDropdown.Item href="#random-beacon/entries">Entries</NavDropdown.Item>
            <NavDropdown.Item href="#random-beacon/groups">Groups</NavDropdown.Item>
          </NavDropdown>
          <Nav.Link href="#/tbtc">TBTC</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}
