import { useContext } from 'react';
import { useTranslation } from "react-i18next";
import { UIPreferencesContext } from '../contexts/UIPreferencesContext';

/**
 * Class that exports preferences
 */
export function Preferences() {
    const { t } = useTranslation();
    const { pageSize, theme, bytesStringBase2, fontSize, setFontSize, setByteStringBase, setTheme } = useContext(UIPreferencesContext);
    return <>
        <form>
            <div className='form-group'>
                <label className='label-description' htmlFor='themeSelector' id='themeLabel'>{t('ui.feedback.theme-description')}</label>
                <select className="form-select form-select-sm" title={t('feedback.ui.theme-select')} id='themeSelector' value={theme} onChange={e => setTheme(e.target.value)}>
                    <option value="light">{t('ui.value.theme-light')}</option>
                    <option value="dark">{t('ui.value.theme-dark')}</option>
                    <option value="pastel">{t('ui.value.theme-pastel')}</option>
                    <option value="ocean">{t('ui.value.theme-ocean')}</option>
                </select>
                <small hmtlfor='themeLabel' id='themeHelp' className='form-text text-muted'>{t('ui.feedback.theme-help')}</small>
            </div>
            <br />
            <div className='form-group'>
                <label className='label-description' htmlFor="bytesBaseInput">{t('ui.feedback.byte-representation-description')}</label>
                <select className="form-select form-select-sm" title={t('ui.feedback.byte-representation-select')} id='bytesBaseInput' value={bytesStringBase2} onChange={e => setByteStringBase(e.target.value)}>
                    <option value="true">Base-2 (KiB, MiB, GiB, TiB)</option>
                    <option value="false">Base-10 (KB, MB, GB, TB)</option>
                </select>
                <small hmtlfor='bytesBaseInput' id='bytesHelp' className='form-text text-muted'>{t('ui.feedback.byte-representation-help')}</small>
            </div>
            <br />
            <div className='form-group'>
                <label className='label-description'>{t('feedback.ui.appearance')}</label>
                <select className="form-select form-select-sm" title={t('feedback.ui.appearance-hint')} id='appearanceInput' value={fontSize} onChange={e => setFontSize(e.target.value)}>
                    <option value="fs-6">{t('ui.value.appearance-small')}</option>
                    <option value="fs-5">{t('ui.value.appearance-medium')}</option>
                    <option value="fs-4">{t('ui.value.appearance-large')}</option>
                </select>
                <small hmtlfor="appearanceInput" id='appearanceHelp' className='form-text text-muted'>{t('feedback.ui.appearance-help')}</small>
            </div>
            <br />
            <div className='form-group'>
                <label className='label-description'>{t('ui.feedback.pagesize-description')}</label>
                <input className='form-control form-control-sm' id='pageSizeInput'
                    type='text' placeholder={t('ui.feedback.pagesize-hint')} value={pageSize} disabled={true} />
                <small hmtlfor="pageSizeInput" id='pageSizeHelp' className='form-text text-muted'>{t('ui.feedback.pagesize-help')}</small>
            </div>
        </form >
    </>
}