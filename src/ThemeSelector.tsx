import Select, { components } from 'react-select'
import { useContext } from 'react';
import { Theme, UIPreferencesContext } from './contexts/UIPreferencesContext';

export function ThemeSelector() {
    const { theme, setTheme } = useContext(UIPreferencesContext);
    
    //Contains all supported themes
    const themes = [
        { value: 'light-theme', label: 'light' },
        { value: 'dark-theme', label: 'dark' },
        { value: 'pastel-theme', label: 'pastel' },
        { value: 'ocean-theme', label: 'ocean' }
    ]
    
    //Finds the current selected theme within supported themes
    const currentTheme = themes.find(o => o.value === theme);
    updateTheme(theme)

    /**
     * Handles the theme selection by the user
     * @param event 
     */
    const handleTheme = (event: any) => {
        var selectedTheme = event.value;
        updateTheme(selectedTheme)
        setTheme(selectedTheme)
      };
    
    return <Select options={themes} value={currentTheme} classNamePrefix="select" onChange={handleTheme} 
    components={{
        SingleValue: ({ children, ...props }) => {
          return (
            <components.SingleValue {...props}>
              {"Theme: " + children}
            </components.SingleValue>
          );
        }}}/>
}

/**
 * Keeps the html in sync with the current selected theme
 * @param theme 
 */
function updateTheme(theme: Theme) {
    var doc = document.querySelector("html")!;
    doc.className = theme
}