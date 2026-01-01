import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const docsDir = path.join(process.cwd(), 'docs');
const typesDir = path.join(process.cwd(), 'lib', 'api', 'types');

// Ensure types folder exists
if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir, { recursive: true });
}

// Clean previous type files
fs.readdirSync(typesDir)
  .filter(f => f.endsWith('.ts'))
  .forEach(f => fs.unlinkSync(path.join(typesDir, f)));

// Generate TS types for each JSON spec
const jsonFiles = fs.readdirSync(docsDir).filter(f => f.endsWith('.json'));

jsonFiles.forEach(file => {
  const serviceName = path.basename(file, '.json');
  const inputFile = path.join(docsDir, file);
  const outputFile = path.join(typesDir, `${serviceName}.ts`);
  console.log(`Generating types for ${serviceName}...`);
  execSync(`npx openapi-typescript "${inputFile}" -o "${outputFile}"`, { stdio: 'inherit' });
});

// Create or update index.ts to export all service types
const indexFile = path.join(typesDir, 'index.ts');
const exports = jsonFiles
  .map(f => `export * from './${path.basename(f, '.json')}';`)
  .join('\n');

fs.writeFileSync(indexFile, exports);
console.log('\n✅ All types generated and index.ts updated!');
