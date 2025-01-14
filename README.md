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

- Site Renderer - `site.render.ts` - this file should be used by my render.
  - It exposes methods for content manipulation, like `pageRender()`.
  - These methods will allow to the user to add desired design.
- Blog posts preview
  - Maybe I will allow to combine pages under "meta categories" and then I can create preview pages for thise "meta categories".
  - "meta categories" are not exposed to site visitor and are used only during development.
- Navigation
  - User should be able to create a menu
  - Maybe "menu" is a special config, that user will define in "/navigation" directory.
  - After that user will be able to place it in the page or use it in the code with special syntax.
  - `[navigation id="main-menu"]`, `<Navigation id="main-menu">`
- Tags
  - Display tags on every page (post)
  - User should be able to create page that displays all the results for selected tag (same as "Blog posts preview")
- Site reload in dev mode
  - First full site reload on change in user code will be enough.
  - Next maybe we can do HMR.
- Error stack links to js files in the `dist`. It will be cooler if I could link to `ts` files instead.
  - Most likely I will need to proveid source maps for that to happen.
  - How to reproduce - throw an error in the builder.

## Inspiration

- https://vitepress.dev/
