// Layout.js
import React from 'react';
import Header from './Header';

const Layout = ({ children, userName }) => {
  return (
    <div className="main-content">
      <div className="container mt-5">
        <Header userName={userName} />
        {children}
      </div>
    </div>
  );
};

export default Layout;
