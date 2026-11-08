export function assertSafeMarkdown(source) {
  // Raw HTML is unnecessary in the policy and could inject scripts into its preview.
  if (/<\s*(?:[!?/]|[a-z])/i.test(source)) throw new Error('Use Markdown formatting instead of raw HTML in the privacy policy.');
}
