import { Component } from 'react';
import { UIPreferencesContext } from './contexts/UIPreferencesContext';

export class PreferencesView extends Component {
    render() {
        const { pageSize, theme, bytesStringBase2, setByteStringBase, setTheme } = this.context;
        return <>
            <form>
                <div className='form-group'>
                    <label className='label-description' id='themeLabel'>Theme</label>
                    <select className="select_theme, form-select form-select-sm" value={theme} onChange={e => setTheme(e.target.value)}>
                        <option value="light">light</option>
                        <option value="dark">dark</option>
                        <option value="pastel">pastel</option>
                        <option value="ocean">ocean</option>
                    </select>
                    <small hmtlfor='themeLabel' id='themeHelp' className='form-text text-muted'>The current active theme</small>
                </div>
                <br />
                <div className='form-group'>
                    <label className='label-description'>Byte representation</label>
                    <select className="form-select form-select-sm" id='bytesBaseInput' value={bytesStringBase2} onChange={e => setByteStringBase(e.target.value)}>
                        <option value="true">Base-2 (KiB, MiB, GiB, TiB)</option>
                        <option value="false">Base-10 (KB, MB, GB, TB)</option>
                    </select>
                    <small hmtlfor='bytesBaseInput' id='bytesHelp' className='form-text text-muted'>Specifies the representation of bytes</small>
                </div>
                <br />
                <div className='form-group'>
                    <label className='label-description'>Page size</label>
                    <input className='form-control form-control-sm' id='pageSizeInput'
                        type='text' placeholder='Page size' value={pageSize} disabled={true} />
                    <small hmtlfor="pageSizeInput" id='pageSizeHelp' className='form-text text-muted'>Specifies the pagination size in tables</small>
                </div>
            </form>
        </>
    }
}
PreferencesView.contextType = UIPreferencesContext
