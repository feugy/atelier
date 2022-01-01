import { locale, translations, getBrowserLocale } from 'svelte-intl'
import 'virtual:windi.css'
import './styles.postcss'
import fr from './locales/fr.yaml'
import en from './locales/fr.yaml'

translations.update({ fr, en })
locale.set(getBrowserLocale('fr'))
