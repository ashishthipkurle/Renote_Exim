'use client';

import i18next from 'i18next';
import { initReactI18next, useTranslation as useTranslationOrg } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { getOptions, languages, cookieName } from './config';


const runsOnServerSide = typeof window === 'undefined';

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(resourcesToBackend((language: string, namespace: string) => import(`../../public/locales/${language}/${namespace}.json`)))
  .init({
    ...getOptions(),
    lng: undefined, // let detect the language on client side
    detection: {
      order: ['path', 'htmlTag', 'cookie', 'localStorage'],
      caches: ['cookie'],
      lookupCookie: cookieName,
    },
    preload: runsOnServerSide ? languages : []
  });

export function useTranslation(ns?: string, options: any = {}) {
  const ret = useTranslationOrg(ns, options);
  const { i18n } = ret;

  if (runsOnServerSide && options.lng && i18n.resolvedLanguage !== options.lng) {
    i18n.changeLanguage(options.lng);
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeLng, setActiveLng] = (typeof window !== 'undefined' ? [i18n.resolvedLanguage, i18n.changeLanguage] : [null, null]) as [string, (lng: string) => any];

    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (typeof window !== 'undefined' && activeLng && i18n.resolvedLanguage !== activeLng) {
      setActiveLng(activeLng);
    }
  }
  return ret;
}
