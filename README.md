# AFG Church website

Astro + TypeScript, with Decap CMS and static HTML output. Designed for the existing Netlify project and afgchurch.com domain. No added paid service.

## Local review

```sh
npm ci
npm run dev
# In another terminal, from the same folder:
npm run cms
```

Site: http://localhost:4321/ · Content editor: http://localhost:4321/admin/

Local CMS saves change this checkout only. They do not publish or commit to GitHub. Keep both terminals running while editing. Stop the CMS proxy when done.

## Project structure

- `src/components/sections/`: Home, Visit, Mission, About, Leadership, Connect
- `src/components/`: shared navigation, footer, people and icon
- `src/layouts/`: shared document metadata and page shell
- `src/content/site/`: separate JSON records for church editors
- `src/content/privacy.md`: original privacy policy, rendered at build time
- `src/lib/`: schemas, validated content and image helpers
- `src/styles/`: responsive design system
- `public/admin/`: Decap editor and field configuration
- `public/uploads/`: real church photos and original community video
- `netlify/`: existing gallery endpoint, retained with safer errors and caching
- `legacy/`: original implementation for comparison; not deployed
- `docs/CMS.md`: editing, production OAuth setup and launch checklist
- `docs/media-sources.json`: provenance for copied church photographs

## Verification

```sh
npm run validate
npm run check
npm run build
npm test
```

The build validates required content, HTTPS links, form and map destinations, local media paths and CMS field coverage. Playwright covers mobile navigation, JavaScript-free content, contact success/failure with intercepted requests, and privacy links. No test sends a real message.

## Before production

Read [CMS setup](docs/CMS.md). Configure GitHub OAuth through Netlify for Decap, test a draft and image upload, verify the inherited contact details, and review the design locally. No automatic deployment has been performed. CMS publication creates Git commits after launch; local proxy edits do not.
