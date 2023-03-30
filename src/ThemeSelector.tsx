import Select from 'react-select'
import { useContext } from 'react';
import { Theme, UIPreferencesContext } from './contexts/UIPreferencesContext';

export function ThemeSelector() {
    const { theme, setTheme } = useContext(UIPreferencesContext);
    
    updateTheme(theme)

    const themes = [
        { value: 'light-theme', label: 'light' },
        { value: 'dark-theme', label: 'dark' },
        { value: 'pastel-theme', label: 'pastel' },
        { value: 'ocean-theme', label: 'ocean' }
    ]
    
    const handleTheme = (event: any) => {
        var selectedTheme = event.value;
        // keep html class in sync with button state.
        updateTheme(selectedTheme)
        setTheme(selectedTheme)
      };

    return <Select defaultValue={themes[0]} options={themes} onChange={handleTheme} />
}

function updateTheme(theme: Theme) {
    var doc = document.querySelector("html")!;
    doc.className = theme
}