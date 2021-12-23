import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';

// TODO - this is very rudimentary, we still need to:
// - match OS preference by default
// - persist the choice
export function ToggleDarkModeButton() {
    const [v, setV] = useState(0);
  
    const h = document.querySelector("html");
    const isDark = h.className === "dark";
    
    function setMode(mode) {
      h.className = mode;
  
      setV(v + 1);
    }
  
    return isDark ? <Button variant="outline-light" size="sm" title="Switch to Light Mode" onClick={() => setMode("light")}><FontAwesomeIcon icon={faSun} />
     </Button> : <Button variant="outline-dark" size="sm" title="Switch to Dark Mode" onClick={() => setMode("dark")}><FontAwesomeIcon icon={faMoon} /></Button>;
}
  