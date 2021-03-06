import { get } from 'svelte/store'
import { _ } from 'svelte-intl'

export function translate(...args) {
  return get(_)(...args)
}

export async function sleep(time = 0) {
  return new Promise(resolve => setTimeout(resolve, time))
}

export const lorem = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'In eu mi bibendum neque egestas congue quisque egestas',
  'Arcu non odio euismod lacinia at quis risus sed',
  'Massa tempor nec feugiat nisl',
  'Sagittis aliquam malesuada bibendum arcu vitae elementum',
  'Elementum facilisis leo vel fringilla est ullamcorper eget nulla',
  'Bibendum arcu vitae elementum curabitur vitae nunc sed velit dignissim',
  'Elit sed vulputate mi sit amet mauris commodo',
  'Ut enim blandit volutpat maecenas volutpat blandit aliquam etiam erat',
  'Lorem mollis aliquam ut porttitor leo a diam sollicitudin',
  'Vitae proin sagittis nisl rhoncus mattis',
  'Ut morbi tincidunt augue interdum velit euismod in pellentesque',
  'Aliquam purus sit amet luctus venenatis lectus magna',
  'Amet venenatis urna cursus eget',
  'Et pharetra pharetra massa massa',
  'Ac ut consequat semper viverra nam libero justo laoreet',
  'Eget arcu dictum varius duis at consectetur lorem',
  'Tellus id interdum velit laoreet id donec',
  'Aliquam sem fringilla ut morbi',
  'Consequat nisl vel pretium lectus quam id leo in vitae',
  'Velit scelerisque in dictum non',
  'Pretium aenean pharetra magna ac',
  'Tincidunt arcu non sodales neque sodales ut etiam',
  'Cursus eget nunc scelerisque viverra mauris in aliquam',
  'Tortor at auctor urna nunc id cursus',
  'Consequat interdum varius sit amet mattis vulputate enim nulla',
  'Sagittis vitae et leo duis ut',
  'Pretium lectus quam id leo in',
  'Fusce ut placerat orci nulla pellentesque dignissim enim sit',
  'Sed cras ornare arcu dui vivamus arcu.'
]
