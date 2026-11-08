import { content } from '../lib/content';

export const GET = () => {
  const { appearance, settings } = content;
  const icons = appearance.logo === '/uploads/branding/afg-church-logo.svg'
    ? [192, 512].map(size => ({ src: `/icons/church-${size}.png`, sizes: `${size}x${size}`, type: 'image/png' }))
    : [{ src: appearance.logo, sizes: 'any' }];
  return new Response(JSON.stringify({
    name: settings.fullName,
    short_name: settings.name,
    start_url: '/',
    display: 'standalone',
    background_color: appearance.colors.paper,
    theme_color: appearance.colors.paper,
    icons,
  }), { headers: { 'Content-Type': 'application/manifest+json' } });
};
