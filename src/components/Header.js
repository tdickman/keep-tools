import React from 'react';
import { Link } from 'react-router-dom';

export default function Header(props) {
  return (
    <React.Fragment>
      <Link to='/'>Home</Link>&nbsp;|&nbsp;
      <Link to='/random-beacon'>Random Beacon</Link>
    </React.Fragment>
  )
}
