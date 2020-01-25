const sass = require('node-sass');
import sveltePreprocess from 'svelte-preprocess';
import PurgeSvelte from 'purgecss-from-svelte';
export const mode = process.env.NODE_ENV;
export const dev = mode === 'development';
export const postcssPlugins = (purgecss = false) => {
  return [
    require('postcss-import')(),
    require('postcss-url')(),
    require('tailwindcss')('./tailwind.config.js'),
    require('autoprefixer')(),
    // Do not purge the CSS in dev mode to be able to play with classes in the browser dev-tools.
    purgecss &&
      require('@fullhuman/postcss-purgecss')({
        content: ['./**/*.svelte', './src/template.html'],
        extractors: [
          {
            extractor: PurgeSvelte,

            // Specify the file extensions to include when scanning for
            // class names.
            extensions: ['svelte', 'html']
          }
        ],
        // Whitelist selectors to stop Purgecss from removing them from your CSS.
        whitelist: []
      }),
    !dev && require('cssnano')
  ].filter(Boolean);
};
export default {
  preprocess: {
    postcss: {
      plugins: [require('autoprefixer')]
    },
    transformers: {
      postcss: {
        plugins: postcssPlugins() // Don't need purgecss because Svelte handle unused css for you.
      }
    },
    style: async ({ content, attributes }) => {
      if (attributes.type !== 'text/scss' && attributes.lang !== 'scss') return; // lang is now taken into account

      return new Promise((resolve, reject) => {
        sass.render(
          {
            data: content,
            sourceMap: true,
            outFile: 'x' // this is necessary, but is ignored
          },
          (err, result) => {
            if (err) return reject(err);

            resolve({
              code: result.css.toString(),
              map: result.map.toString()
            });
          }
        );
      });
    }
  }
};
