#!/usr/bin/env bun

import fs from 'fs';
import path from 'path';
import { Command } from 'commander';

function shouldIgnore(filePath: string, ignorePatterns: string[]): boolean {
  for (const pattern of ignorePatterns) {
    if (minimatch(path.basename(filePath), pattern)) {
      return true;
    }
  }
  return false;
}

function readGitignore(dirPath: string): string[] {
  const gitignorePath = path.join(dirPath, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    return fs.readFileSync(gitignorePath, 'utf8')
      .split('\n')
      .filter((line: string) => line.trim() !== '' && !line.startsWith('#'))
      .map((pattern: string) => pattern.trim());
  }
  return [];
}

function minimatch(filename: string, pattern: string): boolean {
  const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
  return regex.test(filename);
}

function processPath(
  pathToProcess: string,
  includeHidden: boolean,
  ignoreGitignore: boolean,
  ignorePatterns: string[]
): void {
  if (fs.statSync(pathToProcess).isDirectory()) {
    const gitignoreRules = ignoreGitignore ? [] : readGitignore(pathToProcess);

    const files = fs.readdirSync(pathToProcess, { withFileTypes: true })
      .filter((dirent: any) => includeHidden || !dirent.name.startsWith('.'))
      .filter((dirent: any) => dirent.isFile())
      .map((dirent: any) => path.join(pathToProcess, dirent.name));

    const directories = fs.readdirSync(pathToProcess, { withFileTypes: true })
      .filter((dirent: any) => includeHidden || !dirent.name.startsWith('.'))
      .filter((dirent: any) => dirent.isDirectory())
      .map((dirent: any) => path.join(pathToProcess, dirent.name));

    for (const file of files) {
      if (!shouldIgnore(file, gitignoreRules) && !shouldIgnore(file, ignorePatterns)) {
        try {
          const fileContents = fs.readFileSync(file, 'utf8');
          console.log(file);
          console.log('---');
          console.log(fileContents);
          console.log('---');
        } catch (err) {
          if ((err as { code: string }).code === 'EINVAL') {
            console.error(`Warning: Skipping file ${file} due to UnicodeDecodeError`);
          } else {
            throw err;
          }
        }
      }
    }

    for (const dir of directories) {
      if (!shouldIgnore(dir, gitignoreRules)) {
        processPath(dir, includeHidden, ignoreGitignore, ignorePatterns);
      }
    }
  } else {
    // Process a single file
    if (!shouldIgnore(pathToProcess, []) && !shouldIgnore(pathToProcess, ignorePatterns)) {
      try {
        const fileContents = fs.readFileSync(pathToProcess, 'utf8');
        console.log(pathToProcess);
        console.log('---');
        console.log(fileContents);
        console.log('---');
      } catch (err) {
        if ((err as { code: string }).code === 'EINVAL') {
          console.error(`Warning: Skipping file ${pathToProcess} due to UnicodeDecodeError`);
        } else {
          throw err;
        }
      }
    }
  }
}

const program = new Command();

program
  .version('0.2.1')
  .description('Concatenate a directory full of files into a single prompt for use with LLMs')
  .argument('<paths...>', 'One or more paths to files or directories to process')
  .option('--include-hidden', 'Include files and folders starting with .', false)
  .option('--ignore-gitignore', 'Ignore .gitignore files and include all files', false)
  .option('-i, --ignore <pattern>', 'Specify one or more patterns to ignore', (value, previous) => [...previous, value], [])
  .action((paths, options) => {
    for (const pathToProcess of paths) {
      if (!fs.existsSync(pathToProcess)) {
        throw new Error(`Path does not exist: ${pathToProcess}`);
      }
      processPath(pathToProcess, options.includeHidden, options.ignoreGitignore, options.ignore);
    }
  });

program.parse(process.argv);
