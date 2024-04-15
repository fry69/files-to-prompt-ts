#!/usr/bin/env bun

import fs from 'fs';
import path from 'path';
import { Command } from 'commander';

interface ProcessingConfig {
  includeHidden: boolean;
  ignoreGitignore: boolean;
  ignorePatterns: string[];
  gitignoreRules: string[];
}

async function isBinaryFile(filePath: string, chunkSize: number = 8192): Promise<boolean> {
  const stream = fs.createReadStream(filePath, { highWaterMark: chunkSize });
  let isBinary = false;

  for await (const chunk of stream) {
    if (Buffer.isBuffer(chunk)) {
      if (chunk.some((byte) => byte > 127)) { // Check for non-ASCII character
        isBinary = true;
        stream.destroy(); // Stop reading the file
        break;
      } 
    }
  }

  return isBinary;
}

async function processFile(filePath: string, config: ProcessingConfig): Promise<void> {
  try {
    if (await isBinaryFile(filePath)) {
      console.error(`Warning: Skipping binary file ${filePath}`);
    } else {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      console.log(filePath);
      console.log('---');
      console.log(fileContents);
      console.log('---');
    }
  } catch (err) {
    console.error(`Error processing file ${filePath}: ${err}`);
  }
}

function shouldIgnore(filePath: string, config: ProcessingConfig): boolean {
  const { ignorePatterns, gitignoreRules } = config;

  for (const pattern of [...gitignoreRules, ...ignorePatterns]) {
    if (minimatch(path.basename(filePath), pattern)) {
      return true;
    }
    if (pattern.endsWith('/')) {
      const dirPattern = pattern.slice(0, -1);
      if (minimatch(path.relative(path.dirname(filePath), filePath), dirPattern)) {
        return true;
      }
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

async function processPath(
  pathToProcess: string,
  config: ProcessingConfig
): Promise<void> {
  if (fs.statSync(pathToProcess).isDirectory()) {
    let newConfig: ProcessingConfig = config; // intentional reference copy
    if (config.gitignoreRules.length === 0) {
      // only check for another .gitingore for this hierarchy part if not already found one 
      const gitignoreRules = config.ignoreGitignore ? [] : readGitignore(pathToProcess);
      if (gitignoreRules.length > 0) {
        // deep cloning so that these .gitignore rules only apply to this part of the hierarchy
        newConfig = structuredClone(config);
        newConfig.gitignoreRules = gitignoreRules;
      }
    }

    const files = fs.readdirSync(pathToProcess, { withFileTypes: true })
      .filter((dirent: any) => config.includeHidden || !dirent.name.startsWith('.'))
      .filter((dirent: any) => dirent.isFile())
      .map((dirent: any) => path.join(pathToProcess, dirent.name));

    const directories = fs.readdirSync(pathToProcess, { withFileTypes: true })
      .filter((dirent: any) => config.includeHidden || !dirent.name.startsWith('.'))
      .filter((dirent: any) => dirent.isDirectory())
      .map((dirent: any) => path.join(pathToProcess, dirent.name));

    for (const file of files) {
      if (!shouldIgnore(file, newConfig)) {
        await processFile(file, newConfig);
      }
    }

    for (const dir of directories) {
      if (!shouldIgnore(dir, newConfig)) {
        await processPath(dir, newConfig);
      }
    }
  } else {
    // Process a single file
    if (!shouldIgnore(pathToProcess, config)) {
      await processFile(pathToProcess, config);
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
  .option('-i, --ignore <pattern>', 'Specify one or more patterns to ignore', (value: any, previous: any) => [...previous, value], [])
  .action((paths, options) => {
    const config: ProcessingConfig = {
      includeHidden: options.includeHidden,
      ignoreGitignore: options.ignoreGitignore,
      ignorePatterns: options.ignore,
      gitignoreRules: [],
    };

    for (const pathToProcess of paths) {
      if (!fs.existsSync(pathToProcess)) {
        throw new Error(`Path does not exist: ${pathToProcess}`);
      }
      processPath(pathToProcess, config);
    }
  });

program.parse(process.argv);
