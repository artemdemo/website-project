# Static Site Generator

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

- Links to site pages should end with `/`, otherwise it will not work.
  - Maybe solve it by introducing `<Link />` component
- [test] Add test for MD file that imports component with bg image
- [test] Add test for MD file that uses image in the text
- Page that displays some wasm project
- `script.ts` to load arbitrary code in runtime
- `preview` should command that `site-builder` exposes
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
