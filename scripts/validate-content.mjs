import { assertSafeMarkdown } from '../src/lib/safe-markdown.mjs';
import { readFileSync, existsSync } from 'node:fs';
import { schemas } from '../src/lib/content-schema.mjs';
import { parse } from 'yaml';
let failed = false;
for (const [name, schema] of Object.entries(schemas)) {
  try {
    const data = JSON.parse(readFileSync(`src/content/site/${name}.json`, 'utf8'));
    schema.parse(data);
    const checkImages = value => {
      if(typeof value === 'string' && value.startsWith('/uploads/') && !existsSync(`public${value}`)) throw Error(`Missing uploaded asset: ${value}`);
      if(Array.isArray(value)) value.forEach(checkImages);
      else if(value && typeof value === 'object') Object.values(value).forEach(checkImages);
    };
    checkImages(data);
    console.log(`✓ ${name}`);
  } catch (err) { failed = true; console.error(`✗ ${name}: ${err.message}`); }
}
const config = parse(readFileSync('config/decap.yml','utf8'));
for (const collection of config.collections) for (const file of collection.files ?? []) {
  if(!existsSync(file.file)) { failed = true; console.error(`CMS file missing: ${file.file}`); }
  if(file.file.endsWith('.json')) {
    const data = JSON.parse(readFileSync(file.file,'utf8'));
    for(const key of Object.keys(data)) if(!file.fields.some(f=>f.name===key)) { failed=true; console.error(`CMS cannot edit ${file.file}: ${key}`); }
  }
}
try { assertSafeMarkdown(readFileSync('src/content/privacy.md','utf8')); }
catch (error) { failed = true; console.error(error.message); }
if (failed) process.exit(1);
