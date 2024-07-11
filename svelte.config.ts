import sveltePreprocess from 'svelte-preprocess';
import node from '@sveltejs/adapter-node';

export default {
  preprocess: sveltePreprocess(),
  kit: {
    target: '#svelte',
    adapter: node(),
  }
};
