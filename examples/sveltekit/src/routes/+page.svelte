<script>
  import { comparator$ } from '../stores/locale'

  const terms = ['rapide', 'élégant', 'simple']
</script>

<h1>Welcome to SvelteKit</h1>
{#each terms.sort($comparator$.compare) as term}
  <p>{term}</p>
{/each}
