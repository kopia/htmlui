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
                <label className='label-description' htmlFor='themeSelector' id='themeLabel'>{t('feedback.ui.theme-description')}</label>
                <select className="form-select form-select-sm" title={t('feedback.ui.theme-select')} id='themeSelector' value={theme} onChange={e => setTheme(e.target.value)}>
                    <option value="light">{t('value.ui.theme-light')}</option>
                    <option value="dark">{t('value.ui.theme-dark')}</option>
                    <option value="pastel">{t('value.ui.theme-pastel')}</option>
                    <option value="ocean">{t('value.ui.theme-ocean')}</option>
                </select>
                <small hmtlfor='themeLabel' id='themeHelp' className='form-text text-muted'>{t('feedback.ui.theme-help')}</small>
            </div>
            <br />
            <div className='form-group'>
                <label className='label-description' htmlFor="bytesBaseInput">{t('feedback.ui.byte-representation-description')}</label>
                <select className="form-select form-select-sm" title={t('feedback.ui.byte-representation-select')} id='bytesBaseInput' value={bytesStringBase2} onChange={e => setByteStringBase(e.target.value)}>
                    <option value="true">{t('value.ui.byte-representation-base2')}</option>
                    <option value="false">{t('value.ui.byte-representation-base10')}</option>
                </select>
                <small hmtlfor='bytesBaseInput' id='bytesHelp' className='form-text text-muted'>{t('feedback.ui.byte-representation-help')}</small>
            </div>
            <br />
            <div className='form-group'>
                <label className='label-description'>{t('feedback.ui.appearance')}</label>
                <select className="form-select form-select-sm" title={t('feedback.ui.appearance-hint')} id='appearanceInput' value={fontSize} onChange={e => setFontSize(e.target.value)}>
                    <option value="fs-6">{t('value.ui.appearance-small')}</option>
                    <option value="fs-5">{t('value.ui.appearance-medium')}</option>
                    <option value="fs-4">{t('value.ui.appearance-large')}</option>
                </select>
                <small hmtlfor="appearanceInput" id='appearanceHelp' className='form-text text-muted'>{t('feedback.ui.appearance-help')}</small>
            </div>
            <br />
            <div className='form-group'>
                <label className='label-description'>{t('feedback.ui.pagesize-description')}</label>
                <input className='form-control form-control-sm' id='pageSizeInput'
                    type='text' placeholder={t('feedback.ui.pagesize-hint')} value={pageSize} disabled={true} />
                <small hmtlfor="pageSizeInput" id='pageSizeHelp' className='form-text text-muted'>{t('feedback.ui.pagesize-help')}</small>
            </div>
        </form >
    </>
}