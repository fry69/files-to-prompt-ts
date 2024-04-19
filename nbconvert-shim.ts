#!/usr/bin/env bun

/**
 * nbconvert-shim.ts
 *
 * Helper tool to speed up testing, mimicking `nbconvert`.
 * It creates output files with fixed content for test cases in `files-to-prompt.test.ts`.
 */

import fs from 'node:fs';
import path from 'node:path';

function writeAsciidoc(filename: string): void {
  const content = `+*In[1]:*+\n[source, ipython3]\n----\nprint('Hello, World!')\n----\n`;
  const outputPath = path.join(path.dirname(filename), `${path.basename(filename, path.extname(filename))}.asciidoc`);
  fs.writeFileSync(outputPath, content);
}

function writeMarkdown(filename: string): void {
  const content = `\`\`\`python\nprint('Hello, World!')\n\`\`\`\n`;
  const outputPath = path.join(path.dirname(filename), `${path.basename(filename, path.extname(filename))}.md`);
  fs.writeFileSync(outputPath, content);
}

if (import.meta.main) {
  const args = process.argv.slice(2);

  // needed to satisfy test for existence of nbconvert command
  if (args[0] === '--version') {
    console.error('nbconvert-shim v0.0.0');
    process.exit(0);
  }

  if (args.length < 3) {
    console.error('Usage: nbconvert-shim --to asciidoc|markdown <filename>');
    process.exit(1);
  }

  const outputFormat = args[1];
  const filename = args[2];

  if (outputFormat === 'asciidoc') {
    writeAsciidoc(filename);
  } else if (outputFormat === 'markdown') {
    writeMarkdown(filename);
  } else {
    console.error(`Unknown output format: ${outputFormat}`);
    process.exit(1);
  }
}
