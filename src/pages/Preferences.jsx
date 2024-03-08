import Accordion from 'react-bootstrap/Accordion';
import { UIPreferencesContext } from '../contexts/UIPreferencesContext';
import { useContext } from 'react';
import { useTranslation } from "react-i18next";

/**
 * Class that exports preferences
 */
export function Preferences() {
    const { t } = useTranslation();
    const { pageSize, theme, bytesStringBase2, fontSize, language, setFontSize, setByteStringBase, setTheme, setLanguage } = useContext(UIPreferencesContext);
    return <>
        <Accordion defaultActiveKey="user_interface">
            <Accordion.Item eventKey="user_interface">
                <Accordion.Header>{t('user.interface')}</Accordion.Header>
                <Accordion.Body>
                    <form>
                        <div className='form-group'>
                            <label className='label-description' htmlFor='themeSelector' id='themeLabel'>{t('theme.description')}</label>
                            <select className="form-select form-select-sm" title={t('theme.select')} id='themeSelector' value={theme} onChange={e => setTheme(e.target.value)}>
                                <option value="light">{t('theme.light')}</option>
                                <option value="dark">{t('theme.dark')}</option>
                                <option value="pastel">{t('theme.pastel')}</option>
                                <option value="ocean">{t('theme.ocean')}</option>
                            </select>
                            <small hmtlfor='themeLabel' id='themeHelp' className='form-text text-muted'>{t('theme.help')}</small>
                        </div>
                        <br />
                        <div className='form-group'>
                            <label className='label-description' htmlFor="bytesBaseInput">{t('user.interface.byte.representation.description')}</label>
                            <select className="form-select form-select-sm" title={t('user.interface.byte.representation.select')} id='bytesBaseInput' value={bytesStringBase2} onChange={e => setByteStringBase(e.target.value)}>
                                <option value="true">Base-2 (KiB, MiB, GiB, TiB)</option>
                                <option value="false">Base-10 (KB, MB, GB, TB)</option>
                            </select>
                            <small hmtlfor='bytesBaseInput' id='bytesHelp' className='form-text text-muted'>{t('user.interface.byte.representation.help')}</small>
                        </div>
                        <br />
                        <div className='form-group'>
                            <label className='label-description'>{t('user.interface.appearance')}</label>
                            <select className="form-select form-select-sm" title={t('user.interface.appearance.hint')} id='appearanceInput' value={fontSize} onChange={e => setFontSize(e.target.value)}>
                                <option value="fs-6">{t('user.interface.appearance.small')}</option>
                                <option value="fs-5">{t('user.interface.appearance.medium')}</option>
                                <option value="fs-4">{t('user.interface.appearance.large')}</option>
                            </select>
                            <small hmtlfor="appearanceInput" id='appearanceHelp' className='form-text text-muted'>{t('user.interface.appearance.help')}</small>
                        </div>
                        <br />
                        <div className='form-group'>
                            <label className='label-description'>{t('user.interface.pagesize.description')}</label>
                            <input className='form-control form-control-sm' id='pageSizeInput'
                                type='text' placeholder={t('user.interface.pagesize.hint')} value={pageSize} disabled={true} />
                            <small hmtlfor="pageSizeInput" id='pageSizeHelp' className='form-text text-muted'>{t('user.interface.pagesize.help')}</small>
                        </div>
                    </form >
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="language">
                <Accordion.Header>{t('user.language')}</Accordion.Header>
                <Accordion.Body>
                    <div className='form-group'>
                        <label className='label-description'>{t('lang.description')}</label>
                        <select className="form-select form-select-sm" title={t('lang.select')} id='languageInput' value={language} onChange={e => setLanguage(e.target.value)}>
                            <option value="en-GB">{t('lang.en')}</option>
                            <option value="de-DE">{t('lang.de')}</option>
                            <option value="es-ES">{t('lang.es')}</option>
                            <option value="fr-FR">{t('lang.fr')}</option>
                            <option value="it-IT">{t('lang.it')}</option>
                            <option value="ru-RU">{t('lang.ru')}</option>
                            <option value="jp-JP">{t('lang.jp')}</option>
                        </select>
                        <small hmtlfor="languageInput" id='languageInputHelp' className='form-text text-muted'>{t('lang.help')}</small>
                    </div>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    </>
}