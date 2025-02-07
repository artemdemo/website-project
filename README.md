# Website Project

- Static website generator
  - Allow content to be written in markdown
  - Allow custom js content
- Static content
  - Blog
  - Tags
  - Different sizes for images
- Custom dynamic content
  - Contact form
  - Games or any other dynamic content
- Export static site to a separate folder, that has separate git repository
- Markdown
  - https://mdxjs.com/docs/getting-started/

## ToDo

- Blog Posts Preview
  - Consider allowing the combination of pages under "meta categories" to create preview pages for these categories.
  - "Meta categories" would not be visible to site visitors and would only be used during development.
  - https://www.gatsbyjs.com/docs/adding-pagination/
- Tags
  - Display tags on every page (or post).
  - Allow users to create a page that displays all content associated with a selected tag, similar to "Blog Posts Preview."
- Page that displays some wasm project
- `script.ts` to load arbitrary code for the runtim
- Tests for the `site-builder`
  - Site builder should be tested, at least sanity tests
- Dynamic Content at Runtime
  - Enable React hydration for dynamic content.
  - Support updates through AJAX and animations.
- Site Reload in Development Mode
  - Initially, a full site reload upon changes in user code should suffice.
  - Eventually, maybe implement HMR for faster feedback during development.

- Error Stack Links to Source Files
  - Currently, error stacks link to JavaScript files in the `dist` directory. It would be better if they linked to the original TypeScript files.
  - To achieve this, source maps will likely need to be provided.
  - Reproduction steps: Throw an error in the builder.

## Inspiration

- https://vitepress.dev/
