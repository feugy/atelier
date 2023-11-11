import { derived } from 'svelte/store'
import { locale } from 'svelte-intl'

const defaultLocale = 'fr'
const locale$ = derived(locale, value => value || defaultLocale)

export const comparator$ = derived(
  locale$,
  locale => new Intl.Collator(locale, { numeric: true, usage: 'sort' })
)
