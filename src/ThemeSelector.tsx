import Select, { components } from 'react-select'
import { useContext } from 'react';
import { Theme, UIPreferencesContext } from './contexts/UIPreferencesContext';

export function ThemeSelector() {
    const { theme, setTheme } = useContext(UIPreferencesContext);

    const themes = [
        { value: 'light-theme', label: 'light' },
        { value: 'dark-theme', label: 'dark' },
        { value: 'pastel-theme', label: 'pastel' },
        { value: 'ocean-theme', label: 'ocean' }
    ]
    
    updateTheme(theme)

    const handleTheme = (event: any) => {
        var selectedTheme = event.value;
        // keep html class in sync with button state.
        updateTheme(selectedTheme)
        setTheme(selectedTheme)
      };

    return <Select options={themes} classNamePrefix="select" onChange={handleTheme} 
    components={{
        SingleValue: ({ children, ...props }) => {
          return (
            <components.SingleValue {...props}>
              {"Theme: " + children}
            </components.SingleValue>
          );
        }}}/>
}

function updateTheme(theme: Theme) {
    var doc = document.querySelector("html")!;
    doc.className = theme
}