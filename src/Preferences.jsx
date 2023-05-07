import { Component } from 'react';
import { ThemeSelector } from './ThemeSelector';
import { UIPreferencesContext } from './contexts/UIPreferencesContext';

export class Preferences extends Component {
    static contextType = UIPreferencesContext;
    constructor() {
        super();
        this.state = {
            status: {},
            error: null,
        };
    }

    render() {
        const { pageSize, bytesStringBase2 } = this.context;
        return <>
            <form>
                <div className='form-group'>
                    <label className='label-description' id='themeLabel'>Theme</label>
                    <ThemeSelector />
                    <small htmlFor='themeLabel' id='themeHelp' className='form-text text-muted'>The current active theme</small>
                </div>
                <br />
                <div className='form-group'>
                    <label className='label-description'>Bytes to the base of 2</label>
                    <input className='form-control form-control-sm' id='bytesBaseInput'
                        type='text' value={bytesStringBase2} disabled={true} />
                    <small htmlFor='bytesBaseInput' id='bytesHelp' className='form-text text-muted'>Represents bytes to the base of 2</small>
                </div>
                <br />
                <div className='form-group'>
                    <label className='label-description'>Page size</label>
                    <input className='form-control form-control-sm' id='pageSizeInput'
                        type='text' placeholder='Page size' value={pageSize} disabled={true} />
                    <small hmtlFor="pageSizeInput" id='pageSizeHelp' className='form-text text-muted'>The number of items shown in tables</small>
                </div>
            </form>
        </>
    }
}