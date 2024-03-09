import React, { useContext } from 'react';
import { UIPreferencesContext } from '../contexts/UIPreferencesContext';
import languages from '../assets/languages.json'
import Flags from 'country-flag-icons/react/3x2'
import Select, { components } from "react-select";

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
  return <>
    <Select
      classNamePrefix="select"
      id='select-language'
      onChange={e => setLanguage(e.value)}
      value={LanguageOption.language}
      options={languages}
      components={{ Option: LanguageOption }}>
    </Select>
  </>
}