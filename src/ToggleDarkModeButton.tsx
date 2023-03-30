import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext } from 'react';
import Button from 'react-bootstrap/Button';
import { UIPreferencesContext } from './contexts/UIPreferencesContext';

export function ToggleDarkModeButton() {
  const { theme, setTheme } = useContext(UIPreferencesContext);

  // keep html class in sync with button state.
  const h = document.querySelector("html")!;
  h.className = theme;

  return theme === "dark-theme"
    ? <Button data-testid="toggle-dark-mode" variant="outline-light" size="sm" title="Switch to Light Mode" onClick={() => setTheme("light-theme")}>
      <FontAwesomeIcon icon={faSun} />
    </Button>
    : <Button data-testid="toggle-dark-mode" variant="outline-dark" size="sm" title="Switch to Dark Mode" onClick={() => setTheme("dark-theme")}>
      <FontAwesomeIcon icon={faMoon} />
    </Button>;
}
