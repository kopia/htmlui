import { Component } from 'react';
import { UIPreferencesContext } from '../contexts/UIPreferencesContext';

/**
 * Class that exports preferences
 */
export class Preferences extends Component {
    render() {
        const { pageSize, theme, bytesStringBase2, preferWebDav, fontSize, setByteStringBase, setTheme, setPreferWebDav, setFontSize} = this.context;
        return <>
            <form>
                <div className='form-group'>
                    <label className='label-description' htmlFor='themeSelector' id='themeLabel'>Theme</label>
                    <select className="form-select form-select-sm" title='Select theme' id='themeSelector' value={theme} onChange={e => setTheme(e.target.value)}>
                        <option value="light">light</option>
                        <option value="dark">dark</option>
                        <option value="pastel">pastel</option>
                        <option value="ocean">ocean</option>
                    </select>
                    <small hmtlfor='themeLabel' id='themeHelp' className='form-text text-muted'>The current active theme</small>
                </div>
                <br />
                <div className='form-group'>
                    <label className='label-description' htmlFor="bytesBaseInput">Byte representation</label>
                    <select className="form-select form-select-sm" title='Select byte representation' id='bytesBaseInput' value={bytesStringBase2} onChange={e => setByteStringBase(e.target.value)}>
                        <option value="true">Base-2 (KiB, MiB, GiB, TiB)</option>
                        <option value="false">Base-10 (KB, MB, GB, TB)</option>
                    </select>
                    <small hmtlfor='bytesBaseInput' id='bytesHelp' className='form-text text-muted'>Specifies the representation of bytes</small>
                </div>
                <br />
                <div className='form-group'>
                    <label className='label-description'>Preferred filesystem for mounts</label>
                    <select className="form-select form-select-sm" title='Select filesystem type for mounts' id='mountOptionInput' value={preferWebDav} onChange={e => setPreferWebDav(e.target.value)}>
                        <option value="false">Fuse</option>
                        <option value="true">WebDav</option>
                    </select>
                    <small hmtlfor="mountOptionInput" id='mountOptionHelp' className='form-text text-muted'>Specifies the filesystem that KopiaUI uses to mount snapshots</small>
                </div>
                <br />
                <div className='form-group'>
                    <label className='label-description'>Appereance</label>
                    <select className="form-select form-select-sm" title='Select font size' id='fontSizeInput' value={fontSize} onChange={e => setFontSize(e.target.value)}>
                        <option value="fs-6">small</option>
                        <option value="fs-5">medium</option>
                        <option value="fs-4">large</option>
                        <option value="fs-3">larger</option>
                    </select>
                    <small hmtlfor="fontSizeInput" id='fontSizeHelp' className='form-text text-muted'>Specifies the font size</small>
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
Preferences.contextType = UIPreferencesContext
