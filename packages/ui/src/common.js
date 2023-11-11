import 'virtual:windi.css'
import './styles.postcss'

import { getBrowserLocale, locale, translations } from 'svelte-intl'

import fr from './locales/fr.yaml'
import en from './locales/fr.yaml'

translations.update({ fr, en })
locale.set(getBrowserLocale('fr'))
