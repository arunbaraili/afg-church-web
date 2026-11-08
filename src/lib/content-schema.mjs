import { z } from 'zod';
const text = z.string().trim().min(1);
const httpsUrl = v => {
  try {
    const u = new URL(v);
    return u.protocol === 'https:' && !u.username && !u.password ? u : null;
  } catch { return null; }
};
const url = z.url().refine(v => Boolean(httpsUrl(v)), 'Use an HTTPS URL without embedded credentials');
const isUpload = v => /^\/uploads\/(?:[a-z0-9_-][a-z0-9_. -]*\/)*[a-z0-9_-][a-z0-9_. -]*$/i.test(v);
const media = text.refine(v => isUpload(v) || Boolean(httpsUrl(v)), 'Use an HTTPS URL or a safe /uploads/ path');
const image = media;
const optionalText = z.string().trim().nullish().transform(value=>value ?? '');
const optionalMedia = z.union([media,z.literal('')]).nullish().transform(value=>value ?? '');
const optionalUrl = z.union([url, z.literal('')]).optional();
const photo = z.object({ image, alt: text });
const person = z.object({ name: text, role: text, bio: z.string().default(''), photo: image, has_bio: z.boolean().default(false), facebook: optionalUrl, instagram: optionalUrl });
const section = z.enum(['visit','mission','about','pastors','connect']);
const color = z.string().regex(/^#[0-9a-f]{6}$/i, 'Use a six-digit hex color');
const luminance = hex => {
  const rgb = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:((v+.055)/1.055)**2.4);
  return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
};
const contrast = (a,b) => (Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
export const schemas = {
  appearance: z.object({
    logo:image, logoAlt:text, tagline:text, pageTitle:text, description:text,
    colors:z.object({paper:color,surface:color,ink:color,accent:color}).refine(c=>[c.paper,c.surface,'#fffef9'].every(bg=>contrast(c.ink,bg)>=4.5 && contrast(c.accent,bg)>=3) && contrast(c.accent,'#ffffff')>=4.5,'Choose darker text/accent colors or lighter backgrounds for readability'),
    navigation:z.array(z.object({label:text,section:z.enum(['home','visit','mission','about','pastors','connect'])})),
    sections:z.array(section).min(1).refine(v=>new Set(v).size===v.length,'Each section can appear only once').refine(v=>v.includes('visit'),'Keep the Sunday visit section enabled'),
    visitLabel:text,visitHeading:text,visitIntro:text,photoNote:text,leadershipHeading:text,leadershipIntro:text,formHeading:text,mapHeading:text,
  }),
  home: z.object({ title: text, heading: text, intro: text, image, imageAlt: text, video: z.union([media,z.literal('')]).default(''), verse: text, verseReference: text }),
  mission: z.object({
    title:text, statement:text, verse:text, verseReference:text, image, imageAlt:text,
    items:z.array(z.object({
      slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens').refine(v=>v!=='overview','Overview is reserved'),
      title:text, location:optionalText, body:optionalText, image:optionalMedia, imageAlt:optionalText,
      sections:z.array(z.object({title:optionalText,body:optionalText})).nullish().transform(value=>value ?? []),
      gallery:z.array(z.object({image:optionalMedia,alt:optionalText,caption:optionalText})).nullish().transform(value=>value ?? []),
    })).default([]).refine(items=>new Set(items.map(item=>item.slug)).size===items.length,'Each mission needs a unique page address'),
  }),
  about: z.object({ title: text, paragraph1: text, paragraph2: text, galleryUrl: optionalUrl, images: z.array(photo) }),
  leadership: z.object({ pastors: z.array(person), leaders: z.array(person) }),
  connect: z.object({ title: text, intro: text, address: text, serviceTime: text, email: z.email(), phone: text, mapEmbededUrl: url.refine(v=>httpsUrl(v)?.origin === 'https://www.google.com' && /^\/maps\/embed(?:\/v1\/[a-z]+)?$/.test(httpsUrl(v)?.pathname ?? ''),'Use a Google Maps embed URL'), formAction: url.refine(v=>httpsUrl(v)?.origin === 'https://formspree.io' && /^\/f\/[a-z0-9]+$/i.test(httpsUrl(v)?.pathname ?? ''),'Use a Formspree form endpoint') }),
  settings: z.object({ name: text, fullName: text, service: z.object({ day: text, time: text, location: text }), socials: z.object({ facebook: optionalUrl, instagram: optionalUrl, bible: optionalUrl }), siteUrl: url }),
};
