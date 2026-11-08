# Security review — November 7, 2026

Scope: local Astro source, generated Netlify output, npm dependency advisories, and one passive HTTPS header request to the live homepage. No active production scans, login attempts, real contact messages, commits, or deployment.

- The live homepage returned HTTP 200 and HSTS. It did not return the content security policy configured by this local build.
- The local build generates per-page Netlify CSP rules with SHA-256 hashes for Astro's inline scripts. The public policy limits scripts, framing, connections, and form destinations. The separate Decap UI is not covered by this public-page CSP because it has its own authentication and media requirements.
- Netlify configuration adds anti-framing, MIME sniffing protection, restricted browser permissions, and no-store caching for admin responses. Verify these headers on a deploy preview before release.
- CMS URLs reject credentials, unsafe media schemes and traversal-like upload paths. The contact form and map use exact HTTPS origins and constrained paths. Raw HTML is rejected in policy Markdown.
- Cloudinary's public picker is opt-in. A configured Netlify API key alone does not appear in generated browser configuration. The Cloudinary API secret stays server-side. The production CMS config omits the local filesystem proxy.
- The production npm dependency audit reported zero known vulnerabilities. The full audit reported four high-severity entries in the local Decap proxy dependency tree, including transitive Joi and Zod advisories. Keep the proxy bound to loopback, stop it when not editing, and update it when a compatible patched release is available. The standalone vendored Decap browser bundle is outside npm audit coverage.
- A browser smoke test applied the generated homepage CSP, verified that an injected inline script did not run, and confirmed that the menu and intercepted contact submission still worked. Local checks rejected malformed or unapproved map, form, and media URLs.

Before publishing, verify the Netlify headers, Netlify Identity login and editor permissions, map, and contact delivery on a deploy preview. Confirm whether the Cloudinary picker should remain off or be explicitly enabled with its browser-facing API key. This is a scoped review, not a penetration test or certification.
