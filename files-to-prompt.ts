#!/usr/bin/env bun

import fs from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';

/**
 * Represents the configuration for the file processing.
 * @interface ProcessingConfig
 * @property {boolean} includeHidden - Indicates whether to include hidden files and directories.
 * @property {boolean} ignoreGitignore - Indicates whether to ignore .gitignore files.
 * @property {string[]} ignorePatterns - An array of patterns to ignore.
 * @property {string[]} gitignoreRules - An array of .gitignore rules.
 */
interface ProcessingConfig {
  includeHidden: boolean;
  ignoreGitignore: boolean;
  ignorePatterns: string[];
  gitignoreRules: string[];
}

// The following two functions allow redirecting the output via mock functions in the test script.
// They need to be exported for the test script, they get implicitly tested (no test case).

/**
 * Outputs the provided arguments to the console.
 * @function output
 * @param {...any[]} args - The arguments to log.
 */
export function output(...args: any[]): void {
  console.log(...args);
}

/**
 * Outputs the provided arguments to the console as an error.
 * @function error
 * @param {...any[]} args - The arguments to log as an error.
 */
export function error(...args: any[]): void {
  console.error(...args);
}

/**
 * Determines whether a file is a binary file.
 * @async
 * @function isBinaryFile
 * @param {string} filePath - The path to the file.
 * @param {number} [chunkSize=8192] - The size of the chunks to read from the file.
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the file is a binary file, `false` otherwise.
 */
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

/**
 * Processes a single file.
 * @async
 * @function processFile
 * @param {string} filePath - The path to the file to process.
 * @returns {Promise<void>}
 */
async function processFile(filePath: string): Promise<void> {
  try {
    if (await isBinaryFile(filePath)) {
      error(`Warning: Skipping binary file ${filePath}`);
    } else {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      output(filePath);
      output('---');
      output(fileContents);
      output('---');
    }
  } catch (err) {
    // This should not happen unless e.g. files get deleted while this tool runs
    // I ran into this case as the test framework was cleaning up files before this tool was done
    // Remove `Bun.sleep()` from the test script and you will end up here
    // TODO: write test case (not trivial)
    error(`Error processing file ${filePath}: ${err}`);
  }
}

/**
 * Determines whether a file should be ignored based on the provided configuration.
 * @function shouldIgnore
 * @param {string} filePath - The path to the file.
 * @param {ProcessingConfig} config - The processing configuration.
 * @returns {boolean} - `true` if the file should be ignored, `false` otherwise.
 */
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

/**
 * Reads the .gitignore file from the specified directory.
 * @function readGitignore
 * @param {string} dirPath - The path to the directory.
 * @returns {string[]} - An array of .gitignore rules.
 */
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

/**
 * Checks if a filename matches a pattern using minimatch.
 * @function minimatch
 * @param {string} filename - The filename to match.
 * @param {string} pattern - The pattern to match against.
 * @returns {boolean} - `true` if the filename matches the pattern, `false` otherwise.
 */
function minimatch(filename: string, pattern: string): boolean {
  const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
  return regex.test(filename);
}

/**
 * Processes a file or directory path.
 * @async
 * @function processPath
 * @param {string} pathToProcess - The path to the file or directory to process.
 * @param {ProcessingConfig} config - The processing configuration.
 * @returns {Promise<void>}
 */
async function processPath(
  pathToProcess: string,
  config: ProcessingConfig
): Promise<void> {
  if (fs.statSync(pathToProcess).isFile()) {
    // Process a single file
    if (!shouldIgnore(pathToProcess, config)) {
      await processFile(pathToProcess);
    }
  } else if (fs.statSync(pathToProcess).isDirectory()) {
    let newConfig: ProcessingConfig = config; // intentional reference copy
    if (config.gitignoreRules.length === 0) {
      // only check for .gitingore file for this hierarchy part if not already found one
      const gitignoreRules = config.ignoreGitignore ? [] : readGitignore(pathToProcess);
      if (gitignoreRules.length > 0) {
        // deep cloning so current .gitignore rules only apply to current part of the hierarchy
        newConfig = structuredClone(config);
        newConfig.gitignoreRules = gitignoreRules;
      }
    }

    const files = fs.readdirSync(pathToProcess, { withFileTypes: true })
      .filter((directoryEntry: fs.Dirent) => config.includeHidden || !directoryEntry.name.startsWith('.'))
      .filter((directoryEntry: fs.Dirent) => directoryEntry.isFile())
      .map((directoryEntry: fs.Dirent) => path.join(pathToProcess, directoryEntry.name));

    const directories = fs.readdirSync(pathToProcess, { withFileTypes: true })
      .filter((directoryEntry: fs.Dirent) => config.includeHidden || !directoryEntry.name.startsWith('.'))
      .filter((directoryEntry: fs.Dirent) => directoryEntry.isDirectory())
      .map((directoryEntry: fs.Dirent) => path.join(pathToProcess, directoryEntry.name));

    for (const file of files) {
      if (!shouldIgnore(file, newConfig)) {
        await processFile(file);
      }
    }

    for (const dir of directories) {
      if (!shouldIgnore(dir, newConfig)) {
        await processPath(dir, newConfig);
      }
    }
  } else {
    // Skip everything else, e.g. FIFOs, sockets, symlinks (only when specified on the commandline)
    // Files in directories get filtered above
    error(`Skipping ${pathToProcess}: unsupported file type`);
  }
}

/**
 * The main entry point of the script.
 * @async
 * @function main
 * @param {string[]} [args=process.argv] - The command-line arguments.
 * @returns {Promise<void>}
 */
export async function main( args: string[] = process.argv) {
  const program = new Command();

  program
    .version('0.2.1')
    .description('Concatenate a directory full of files into a single prompt for use with LLMs')
    .argument('<paths...>', 'One or more paths to files or directories to process')
    .option('--include-hidden', 'Include files and folders starting with .', false)
    .option('--ignore-gitignore', 'Ignore .gitignore files and include all files', false)
    .option('-i, --ignore <pattern>', 'Specify one or more patterns to ignore', (value: string, previous: any[]) => [...previous, value], [])
    .action(async (paths, options) => {
      const config: ProcessingConfig = {
        includeHidden: options.includeHidden,
        ignoreGitignore: options.ignoreGitignore,
        ignorePatterns: options.ignore,
        gitignoreRules: [],
      };

      for (const pathToProcess of paths) {
        if (!fs.existsSync(pathToProcess)) {
          error(`Path does not exist: ${pathToProcess}`);
          return;
        }
        await processPath(pathToProcess, config);
      }
    });

  program.parse(args);
}

// Check if the script is being run directly
if (import.meta.main) {
  await main();
}
