import appearance from '../content/site/appearance.json';
import home from '../content/site/home.json';
import mission from '../content/site/mission.json';
import about from '../content/site/about.json';
import leadership from '../content/site/leadership.json';
import connect from '../content/site/connect.json';
import settings from '../content/site/settings.json';
import { schemas } from './content-schema.mjs';
export const content = { appearance: schemas.appearance.parse(appearance), home: schemas.home.parse(home), mission: schemas.mission.parse(mission), about: schemas.about.parse(about), leadership: schemas.leadership.parse(leadership), connect: schemas.connect.parse(connect), settings: schemas.settings.parse(settings) };
export function optimizedImage(src: string, width = 1200): string {
  return src.startsWith('https://res.cloudinary.com/') ? src.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width},c_limit/`) : src;
}
export function readyBio(bio: string) { return bio.trim().length > 50 && !/pending|bio working|bio about/i.test(bio); }
export const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content.connect.address)}`;
