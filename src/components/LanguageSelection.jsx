import React, { useContext } from 'react';
import languages from '../assets/languages.json'
import Flags from 'country-flag-icons/react/3x2'
import Select, { components } from "react-select";
import { UIPreferencesContext } from '../contexts/UIPreferencesContext';

const { Option } = components;
const LanguageOption = props => {
  const Flag = Flags[props.data.code];
  return <>
    <Option {...props}>
      <Flag title={props.data.label} width={30} height={20} />
      {props.data.label}
    </Option>
  </>
};

export function LanguageSelection() {
  const { language, setLanguage } = useContext(UIPreferencesContext);
  const allLanguages = Object.values(languages)
  return <>
    <Select
      classNamePrefix="select"
      id='select-language'
      onChange={selection => setLanguage(selection.value)}
      value={languages[language]}
      options={allLanguages}
      //To render the select component before the input group
      menuPortalTarget={document.body}
      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
      components={{ Option: LanguageOption }}>
    </Select>
  </>
}