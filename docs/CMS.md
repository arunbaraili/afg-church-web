# Editing the church website

## Local review — no GitHub commits

Run `npm run dev` and, in another terminal from this folder, `npm run cms`. Open http://localhost:4321/admin/. The local proxy edits files in this checkout. It does not authenticate to GitHub or publish the live site. Keep the proxy on your own computer; stop it when finished. Changes saved locally immediately update the Astro preview.

The sidebar separates Home, Mission, About us & gallery, Pastors & leaders, Connect, Church settings, and Privacy policy. Mission supports a heading, statement, Scripture, photo and description, plus any number of mission stories with optional photos. Uploads are saved in `public/uploads` and versioned alongside content. Existing Cloudinary URLs continue to work; no Cloudinary account upgrade is required. Complete photo descriptions for screen readers.

`npm run build` validates content before generating the website. A missing required field, invalid endpoint or missing local asset fails the build rather than deploying a broken page. Content is rendered into static HTML, without a browser-side fetch dependency. Complete biographies appear only when enabled; original placeholder biographies remain editable but are hidden publicly.

## Production authentication — owner setup before launch

Decap uses the existing Netlify Identity and Git Gateway integration. Open `/admin/`, click **Login**, and use the email and password already registered for this Netlify site. Editors do not need to sign into GitHub. Keep Identity invite-only and leave the existing Git Gateway connection enabled. If login succeeds but content cannot load, check the existing repository connection in Netlify.

- [Decap Git Gateway setup](https://decapcms.org/docs/git-gateway-backend/)
- [Netlify Git Gateway](https://docs.netlify.com/manage/security/secure-access-to-sites/git-gateway/)

After the owner approves the local rebuild, use a Netlify deploy preview to test login, a draft edit, an uploaded image, preview links, and publish/revert on a non-production branch before switching the live domain. Production save/publish creates Git commits; do not use it during local review. In local proxy mode Decap uses the local filesystem workflow rather than GitHub review states.

## Netlify

Keep the existing site and domain. Build command: `npm run build`; publish directory: `dist`; Node 22. `netlify.toml` records these settings. No DNS change or new hosting service is needed. Existing plan limits still apply. The contact form retains the original Formspree endpoint; live delivery must be checked by the owner before launch. No real messages are sent by automated tests.

## Content to confirm before launch

The inherited public contact email is `afgnchurch@email.com`; the existing privacy policy instead says `email@gmail.com`. The policy is preserved verbatim rather than silently rewritten. Confirm both. Several leadership biographies are unfinished. Mission stories are initially empty: add church-approved content in the CMS instead of publishing invented programs.

## Customize the site

Open **Branding & layout** to replace the church logo, edit the tagline and search metadata, choose site colors, rename or reorder navigation links, and reorder or hide optional homepage sections. The home and Sunday visit sections remain available. Links to hidden sections are automatically removed from the main navigation. The build checks theme contrast. Use the other records to edit the church copy, people, service details, and photos. The layout components themselves remain in source code.

The editor is self-hosted using the pinned Decap CMS 3.17.3 standalone distribution. Its upstream license notices accompany the bundle in `public/admin`.

Under **Mission → Mission stories**, add a title, real location, unique page address, cover image and description, mission details, and optional gallery photos. The location and title appear over the cover photo on the homepage. The card opens the mission page in a new tab. Add more stories to make the row scroll.

## Cloudinary media library

The Decap config is served from `/admin/config.yml`. To open Cloudinary when choosing an image, set `DECAP_CLOUDINARY_API_KEY` to a Cloudinary API key intended for browser use, in a local `.env` or Netlify's build environment. Set `CLOUDINARY_CLOUD_NAME` if using a different cloud (default: `dhwpjxt89`), then restart the preview or rebuild. The existing server-side `CLOUDINARY_API_KEY` is never used for the picker. Decap requires the public API key in its browser config. The API Secret is never included. Editors must sign into the corresponding Cloudinary account. Without an API key, Decap continues using the local upload library; existing Cloudinary URLs still render.

Pastors and leaders display Facebook and Instagram icons only for links entered in **Pastors & leaders**.

Mission photo credits are not CMS fields. The site automatically looks up attribution for the bundled documentary images by URL. Your own photos need no credit fields; caption and image description are optional.
