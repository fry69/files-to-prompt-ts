#!/usr/bin/env bun

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

const VERSION = '0.3.0';

/**
 * Represents the configuration for output.
 * @interface OutputConfig
 * @property {string} stdoutFile - Filename to redirect stdout.
 * @property {string} stderrFile - Filename to redirect stderr.
 */
interface OutputConfig {
  stdoutFile: string;
  stderrFile: string;
}

const outputConfig: OutputConfig = {
  stdoutFile: '',
  stderrFile: '',
}

/**
 * Represents the configuration for the file processing.
 * @interface ProcessingConfig
 * @property {boolean} includeHidden - Indicates whether to include hidden files and directories.
 * @property {boolean} ignoreGitignore - Indicates whether to ignore .gitignore files.
 * @property {string[]} ignorePatterns - An array of patterns to ignore.
 * @property {string[]} gitignoreRules - An array of .gitignore rules.
 * @property {string} nbconvertName - Filename or full path of nbconvert tool to convert .ipynb files to ASCII or Markdown.
 * @property {string} convertFormat - The format to convert .ipynb files to ('asciidoc' or 'markdown').
 */
interface ProcessingConfig {
  includeHidden: boolean;
  ignoreGitignore: boolean;
  ignorePatterns: string[];
  gitignoreRules: string[];
  nbconvertName: string;
  convertFormat: 'asciidoc' | 'markdown';
}

/**
 * Outputs the provided arguments to the console.
 * exported so it can be overridden in test script
 * implicitly tested (no test case)
 * @function consoleOutput
 * @param {...any[]} args - The arguments to log.
 */
export function consoleOutput(...args: any[]): void {
  console.log(...args);
}

/**
 * Outputs the provided arguments to the console or file.
 * @function output
 * @param {...any[]} args - The arguments to log.
 */
function output(...args: any[]): void {
  if (outputConfig.stdoutFile) {
    try {
      fs.appendFileSync(outputConfig.stdoutFile, args.join(' ') + '\n');
    } catch (err) {
      error(`Error writing to output file ${outputConfig.stdoutFile}: ${err}`);
    }
  } else {
    consoleOutput(...args);
  }
}

/**
 * Outputs the provided arguments to the console as an error.
 * exported so it can be overridden in test script
 * implicitly tested (no test case)
 * @function consoleError
 * @param {...any[]} args - The arguments to log.
 */
export function consoleError(...args: any[]): void {
  console.error(...args);
}

/**
 * Outputs the provided arguments to the console or file as an error.
 * @function error
 * @param {...any[]} args - The arguments to log as an error.
 */
export function error(...args: any[]): void {
  if (outputConfig.stderrFile) {
    try {
      fs.appendFileSync(outputConfig.stderrFile, args.join(' ') + '\n');
    } catch (err) {
      error(`Error writing to error file ${outputConfig.stderrFile}: ${err}`);
    }
  } else {
    consoleError(...args);
  }
}

/**
 * Determines whether a file is a binary file.
 * exported to be testable in test script
 * @async
 * @function isBinaryFile
 * @param {string} filePath - The path to the file.
 * @param {number} [chunkSize=8192] - The size of the chunks to read from the file.
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the file is a binary file, `false` otherwise.
 */
export async function isBinaryFile(filePath: string, chunkSize: number = 8192): Promise<boolean> {
  let isBinary = false;
  let stream: fs.ReadStream;

  try {
    stream = fs.createReadStream(filePath, { highWaterMark: chunkSize });
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      // File not found, return false
      return false;
    } else {
      // Rethrow the error
      // TODO: write test case (not trivial)
      throw err;
    }
  }

  for await (const chunk of stream) {
    if (chunk instanceof Uint8Array) {
      if (Array.from(chunk).some((byte) => byte > 127)) { // Check for non-ASCII character
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
 * @param {ProcessingConfig} config - The processing configuration.
 * @returns {Promise<void>}
 */
async function processFile(filePath: string, config: ProcessingConfig): Promise<void> {
  try {
    if (await isBinaryFile(filePath)) {
      error(`Warning: Skipping binary file ${filePath}`);
    } else {
      if (config.nbconvertName && filePath.endsWith('.ipynb')) {
        await convertIPythonNotebook(filePath, config);
      } else {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        output(filePath);
        output('---');
        output(fileContents);
        output('---');
      }
    }
  } catch (err) {
    // This should not happen unless e.g. files get deleted while this tool runs
    // I ran into this case as the test framework was cleaning up files before this tool was done
    // Remove `Bun.sleep()` from the test script and you will end up here
    // TODO: write test case (not trivial)
    error(`Error processing file ${filePath}: ${err}`);
  }
}

async function convertIPythonNotebook(filePath: string, config: ProcessingConfig): Promise<void> {
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'files-to-prompt-'));
  const tempFilePath = path.join(tempDir, path.basename(filePath));

  try {
    // Copy the .ipynb file to the temporary directory
    await fs.promises.copyFile(filePath, tempFilePath);

    // Run nbconvert with the appropriate command-line options
    const convertCommand = `${config.nbconvertName} --to ${config.convertFormat} "${tempFilePath}"`;
    try {
      execSync(convertCommand, { stdio: 'inherit' });
    } catch (err) {
      error(`Error running ${config.nbconvertName}: ${err}`);
      return;
    }

    // Determine the correct file extension based on the conversion format
    const convertedFileExtension = config.convertFormat === 'markdown' ? '.md' : `.${config.convertFormat}`;

    // Read the converted file from the temporary directory
    const convertedFilePath = path.join(tempDir, `${path.basename(filePath, '.ipynb')}${convertedFileExtension}`);
    const convertedFileContents = await fs.promises.readFile(convertedFilePath, 'utf8');

    // Output the converted file with the original file name and path
    output(`${filePath}`);
    output('---');
    output(convertedFileContents);
    output('---');
  } catch (err) {
    error(`Error converting .ipynb file ${filePath}: ${err}`);
  } finally {
    // Clean up the temporary directory
    await fs.promises.rm(tempDir, { recursive: true, force: true });
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
      await processFile(pathToProcess, config);
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
        await processFile(file, newConfig);
      }
    }

    for (const dir of directories) {
      if (!shouldIgnore(dir, newConfig)) {
        await processPath(dir, newConfig);
      }
    }
  } else {
    // Skip everything else, e.g. FIFOs, sockets, symlinks
    // applies only to files directly specified on the commandline
    // files in directories get filtered above
    error(`Skipping ${pathToProcess}: unsupported file type`);
  }
}

/**
 * Reads the input from stdin.
 * This function can be overridden in tests.
 * @async
 * @function readStdin
 * @returns {Promise<string>} - The input from stdin.
 */
let readStdin = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    let stdinData = '';
    process.stdin.on('data', (chunk) => {
      stdinData += chunk.toString();
    });
    process.stdin.on('end', () => {
      resolve(stdinData);
    });
    process.stdin.on('error', (err) => {
      reject(err);
    });
  });
};

/**
 * Parses the file paths from the stdin input.
 * @function parseFilePathsFromStdin
 * @param {string} stdinData - The input from stdin.
 * @returns {string[]} - An array of file paths.
 */
export function parseFilePathsFromStdin(stdinData: string): string[] {
  const filePathsFromStdin: string[] = [];
  const seenFilePaths = new Set<string>();
  const lines = stdinData.trim().split('\n');

  for (const line of lines) {
    const filePath = line.trim();
    if (filePath === '') {
      // Ignore empty line
      continue;
    }
    if (filePath.includes(':')) {
      // Handle grep/ripgrep output format
      const parts = filePath.split(':');
      if (isValidFilePath(parts[0]) && !seenFilePaths.has(parts[0])) {
        seenFilePaths.add(parts[0]);
        filePathsFromStdin.push(parts[0]);
      }
    } else if (isValidFilePath(filePath) && !seenFilePaths.has(filePath)) {
      // Handle file path per line format
      seenFilePaths.add(filePath);
      filePathsFromStdin.push(filePath);
    }
  }

  return filePathsFromStdin;
}

/**
 * Checks if a given string is a valid file path.
 * @function isValidFilePath
 * @param {string} filePath - The file path to check.
 * @returns {boolean} - `true` if the file path is valid, `false` otherwise.
 */
function isValidFilePath(filePath: string): boolean {
  // Check if the file path contains only valid characters
  for (const char of filePath) {
    if (char.charCodeAt(0) < 32 || char.charCodeAt(0) > 126) {
      return false;
    }
  }

  // Check if the file path is not too long
  if (filePath.length > 1024) {
    return false;
  }

  // If the file path passes the above checks, consider it valid
  return true;
}

/**
 * The main entry point of the script.
 * @async
 * @function main
 * @param {string[]} args - The command-line arguments.
 * @returns {Promise<void>}
 */
export async function main( args: string[] ): Promise<void> {
  const config: ProcessingConfig = {
    includeHidden: false,
    ignoreGitignore: false,
    ignorePatterns: [],
    gitignoreRules: [],
    nbconvertName: '',
    convertFormat: 'asciidoc',
   };
  let pathsToProcess: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--version':
        output(`files-to-prompt.ts version ${VERSION}`);
        return;
      case '--include-hidden':
        config.includeHidden = true;
        break;
      case '--ignore-gitignore':
        config.ignoreGitignore = true;
        break;
      case '-i':
      case '--ignore':
        if (i + 1 < args.length) {
          config.ignorePatterns.push(args[++i]);
        } else {
          error('Error: --ignore option requires a pattern');
          return;
        }
        break;
      case '--output':
      case '-o':
        if (i + 1 < args.length) {
          outputConfig.stdoutFile = args[++i];
          try {
            fs.writeFileSync(outputConfig.stdoutFile, '');
            // delete existing content in file
            fs.truncateSync(outputConfig.stdoutFile);
          } catch (err) {
            error(`Error writing to output file ${outputConfig.stdoutFile}: ${err}`);
            outputConfig.stdoutFile = '';
            return;
          }
        } else {
          error('Error: --output option requires a file path');
          return;
        }
        break;
      case '--nbconvert':
        if (i + 1 < args.length) {
          config.nbconvertName = args[++i];
        } else {
          error('Error: --nbconvert option requires the filename or full path of the tool');
          return;
        }
        break;
      case '--format':
        if (i + 1 < args.length) {
          const format = args[++i];
          if (format === 'asciidoc' || format === 'markdown') {
            config.convertFormat = format;
          } else {
            error(`Error: Unsupported format '${format}', use 'asciidoc' or 'markdown'`);
            return;
          }
        } else {
          error('Error: --format option requires a format');
          return;
        }
        break;
      default:
        if (arg.startsWith('-')) {
          error(`Error: Unsupported option '${arg}'`);
          return;
        }
        pathsToProcess.push(arg);
    }
  }

  // Process input from stdin
  if (!process.stdin.isTTY) {
    const stdinData = await readStdin();
    const filePathsFromStdin = parseFilePathsFromStdin(stdinData);
    pathsToProcess.push(...filePathsFromStdin);
  }

  for (const path of pathsToProcess) {
    if (!fs.existsSync(path)) {
      error(`Path does not exist: ${path}`);
      return;
    }
    await processPath(path, config);
  }
  return;
}

// Check if the script is being run directly and detect the runtime environment
// main() may not be called here when this script gets imported in the test script
// call the main function with the appropriate arguments
// TODO: write test case (not trivial)
if (import.meta.main) {
  if (typeof (globalThis as any).Deno !== 'undefined') {
    await main((globalThis as any).Deno.args);
  } else {
    await main(process.argv.slice(2));
  }
}