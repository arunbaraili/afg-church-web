import { parse, stringify } from 'yaml';
import baseConfig from '../../../config/decap.yml?raw';

export function GET() {
  const config = parse(baseConfig);
  if (import.meta.env.PROD) delete config.local_backend;
  const apiKey = (import.meta.env.DECAP_CLOUDINARY_API_KEY ?? process.env.DECAP_CLOUDINARY_API_KEY)?.trim();
  const cloudName = (import.meta.env.CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME ?? 'dhwpjxt89').trim();
  // The browser picker only accepts a key explicitly intended for public use.
  if (apiKey && cloudName) {
    config.media_library = {
      name: 'cloudinary',
      use_secure_url: true,
      use_transformations: false,
      config: { cloud_name: cloudName, api_key: apiKey },
    };
  }
  return new Response(stringify(config), { headers: { 'Content-Type': 'text/yaml; charset=utf-8' } });
}
