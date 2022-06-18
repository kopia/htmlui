import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import Button from 'react-bootstrap/Button';

export function ToggleDarkModeButton(props) {
  let theme = props.theme;
  if (!theme) {
    theme = "light";

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      // browser supports light/dark mode and user prefers dark theme.
      theme = "dark"
    }
  }

  const onChangeTheme = props.onChangeTheme;

  // keep html class in sync with button state.
  const h = document.querySelector("html");
  h.className = theme;

  return theme === "dark" ? <Button data-testid="toggle-dark-mode" variant="outline-light" size="sm" title="Switch to Light Mode" onClick={() => onChangeTheme("light")}><FontAwesomeIcon icon={faSun} />
    </Button> : <Button data-testid="toggle-dark-mode" variant="outline-dark" size="sm" title="Switch to Dark Mode" onClick={() => onChangeTheme("dark")}><FontAwesomeIcon icon={faMoon} /></Button>;
}
