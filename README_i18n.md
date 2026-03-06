# Internationalization (i18n) for Kopia HTML UI

This document describes the localization system for Kopia HTML UI.

## Supported Languages

- **en** - English (default)
- **ru** - Russian

## Usage

### Language Selector

Use the language dropdown in the top-right corner of the UI to switch between English and Russian.

### Browser Language Detection

The UI automatically detects your browser's language preference and uses it if a translation is available.

## File Structure

```
src/i18n/
├── i18n.js              # i18n configuration
└── locales/
    ├── en.json          # English translations
    └── ru.json          # Russian translations
```

## Adding Translations

### For Translators

1. Edit the locale file in `src/i18n/locales/<lang>.json`
2. Add translations in JSON format
3. Test the build: `npm run build`

### For Developers

Use the `t()` function in React components:

```jsx
import { withTranslation } from 'react-i18next';

class MyComponent extends Component {
  render() {
    const { t } = this.props;
    
    return (
      <div>
        <h1>{t('app.title')}</h1>
        <button>{t('common.save')}</button>
      </div>
    );
  }
}

export default withTranslation()(MyComponent);
```

Or with hooks:

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('app.title')}</h1>;
}
```

## Translation File Format

JSON format with nested keys:

```json
{
  "app": {
    "title": "KopiaUI",
    "version": "Version"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

Usage in code:
- `t('app.title')` → "KopiaUI"
- `t('common.save')` → "Save"

## Current Translations

### English (en.json)
- App navigation (Snapshots, Policies, Tasks, etc.)
- Repository actions
- Common UI elements
- Error messages

### Russian (ru.json)
- All English translations translated to Russian
- 100+ translated strings

## Testing

```bash
# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build
```

## Contributing Translations

1. Create `src/i18n/locales/<lang>.json` for your language
2. Add translations for all keys in `en.json`
3. Update `src/i18n/i18n.js` to include your language
4. Submit a pull request

## Dependencies

- `react-i18next` - React integration for i18next
- `i18next` - Internationalization framework
- `i18next-browser-languagedetector` - Browser language detection

## License

Same as Kopia project.
