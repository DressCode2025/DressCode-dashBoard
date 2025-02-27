// Header.js
import React from 'react';

const Header = ({ userName }) => {
  return (
    <div className="row mb-4">
      <div className="col">
        <h5>Welcome Back, {userName}</h5>

      </div>

    </div>
  );
};

export default Header;
