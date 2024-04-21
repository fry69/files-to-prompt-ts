#!/usr/bin/env bun

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const VERSION = 'v0.5.2';

/**
 * Represents runtime compatibility configuration with various engines.
 * @interface ComaptConfig
 * @property {boolean} isDeno - Set when the Deno runtime was detected
 * @property {boolean} isNode - Set when the Node runtime was detected
 */
interface CompatConfig {
  isDeno: boolean;
  isNode: boolean;
}

const compatConfig: CompatConfig = {
  isDeno: false,
  isNode: false,
}

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
 * @property {string} nbconvertFormat - The format to convert .ipynb files to ('asciidoc' or 'markdown').
 */
interface ProcessingConfig {
  includeHidden: boolean;
  ignoreGitignore: boolean;
  ignorePatterns: string[];
  gitignoreRules: string[];
  nbconvertName: string;
  nbconvertFormat: 'asciidoc' | 'markdown';
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
function error(...args: any[]): void {
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
    if (config.nbconvertName && filePath.endsWith('.ipynb')) {
      // Handle Jupyter Notebook files first
      if (config.nbconvertName === 'internal') {
        // internal conversion requested
        await convertNotebookInternal(filePath, config);
      } else {
        // external conversion requested
        await convertNotebookExternal(filePath, config);
      }
    } else if (await isBinaryFile(filePath)) {
      // Skip binary files
      error(`Warning: Skipping binary file ${filePath}`);
    } else {
      // Put everything else verbatim on the output stream
      const fileContents = fs.readFileSync(filePath, 'utf8');
      output(filePath);
      output('---');
      output(fileContents);
      output('---');
    }
  } catch (err) {
    // This should not happen unless e.g. files get deleted while this tool runs
    // I ran into this case with an earlier version of this script, where main()
    // was not returning a promise correctly. This lead to the test framework to
    // cleaning up files before this tool was done processing.
    // TODO: write test case (not trivial)
    error(`Error processing file ${filePath}: ${err}`);
  }
}

/**
 * Converts a Jupyter Notebook file to the specified format using internal conversion.
 * @async
 * @function convertNotebookInternal
 * @param {string} filePath - The path to the Jupyter Notebook file.
 * @param {ProcessingConfig} config - The processing configuration.
 * @returns {Promise<void>}
 */
async function convertNotebookInternal(filePath: string, config: ProcessingConfig): Promise<void> {
  try {
    const ipynbContents = await fs.promises.readFile(filePath, 'utf8');
    const ipynbData = JSON.parse(ipynbContents);

    let convertedContent = '';
    if (config.nbconvertFormat === 'asciidoc') {
      convertedContent = convertToAsciidoc(ipynbData);
    } else {
      convertedContent = convertToMarkdown(ipynbData);
    }

    output(`${filePath}`);
    output('---');
    output(convertedContent);
    output('---');
  } catch (err) {
    error(`Error converting .ipynb file ${filePath}: ${err}`);
  }
}

/**
 * Converts Jupyter Notebook JSON to AsciiDoc format.
 * @function convertToAsciidoc
 * @param {any} ipynbData - The parsed JSON data of the Jupyter Notebook file.
 * @returns {string} - The AsciiDoc content.
 */
function convertToAsciidoc(ipynbData: any): string {
  let asciidocContent = '';

  for (const cell of ipynbData.cells) {
    switch (cell.cell_type) {
      case 'code':
        asciidocContent += `+*In[${cell.execution_count}]:*+\n[source, ipython3]\n----\n${cell.source.join('')}\n----\n\n`;
        for (const output of cell.outputs) {
          if (output.data['text/plain']) {
            asciidocContent += `+*Out[${cell.execution_count}]:*+\n----\n${output.data['text/plain']}\n----\n\n`;
          }
          // TODO: handle images
          // if (output.data['image/png']) {
          //   asciidocContent += `+*Out[${cell.execution_count}]:*+\n[PNG Image]\n\n`;
          // }
        }
        break;
      case 'markdown':
        asciidocContent += `${cell.source.join('')}\n\n`;
        break;
    }
  }

  return asciidocContent;
}

/**
 * Converts Jupyter Notebook JSON to Markdown format.
 * @function convertToMarkdown
 * @param {any} ipynbData - The parsed JSON data of the Jupyter Notebook file.
 * @returns {string} - The Markdown content.
 */
function convertToMarkdown(ipynbData: any): string {
  let markdownContent = '';

  for (const cell of ipynbData.cells) {
    switch (cell.cell_type) {
      case 'code':
        markdownContent += `\`\`\`python\n${cell.source.join('')}\n\`\`\`\n\n`;
        for (const output of cell.outputs) {
          if (output.data['text/plain']) {
            markdownContent += `\`\`\`\n${output.data['text/plain']}\n\`\`\`\n\n`;
          }
          // TODO: handle images
          // if (output.data['image/png']) {
          // }
        }
        break;
      case 'markdown':
        markdownContent += `${cell.source.join('')}\n\n`;
        break;
      }
  }
  return markdownContent;
}

/**
 * Converts a Jupyter Notebook file to the specified format using external conversion.
 * @async
 * @function convertIPythonNotebookExternal
 * @param {string} filePath - The path to the Jupyter Notebook file.
 * @param {ProcessingConfig} config - The processing configuration.
 * @returns {Promise<void>}
 */
async function convertNotebookExternal(filePath: string, config: ProcessingConfig): Promise<void> {
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'files-to-prompt-'));
  const tempFilePath = path.join(tempDir, path.basename(filePath));

  try {
    // Copy the .ipynb file to the temporary directory
    await fs.promises.copyFile(filePath, tempFilePath);

    // Run nbconvert with the appropriate command-line options
    const convertCommand = `${config.nbconvertName} --to ${config.nbconvertFormat} "${tempFilePath}"`;
    try {
      execSync(convertCommand, { stdio: 'inherit' });
    } catch (err) {
      error(`Error running ${config.nbconvertName}: ${err}`);
      return;
    }

    // Determine the correct file extension based on the conversion format
    const convertedFileExtension = config.nbconvertFormat === 'markdown' ? '.md' : `.${config.nbconvertFormat}`;

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
 * @async
 * @function readStdin
 * @returns {Promise<string>} - The input from stdin.
 */
async function readStdin(): Promise<string> {
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
 * Parses the command-line arguments and updates the processing configuration and output configuration.
 * @function parseCommandLineArgs
 * @param {string[]} args - The command-line arguments array to read from.
 * @param {string[]} pathsToProcess - The array with paths to process to append to.
 * @param {ProcessingConfig} config - The processing configuration to modify.
 * @param {OutputConfig} outputConfig - The output configuration to modify.
 * @returns {boolean} - A boolean indicating if an error occurred, true means error.
 */
function parseCommandLineArgs(args: string[], pathsToProcess: string[], config: ProcessingConfig, outputConfig: OutputConfig): boolean {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--version':
        output(`files-to-prompt.ts ${VERSION}`);
        return false;
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
          return true;
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
            return true;
            }
        } else {
          error('Error: --output option requires a file path');
          return true;
        }
        break;
      case '--nbconvert':
        if (i + 1 < args.length) {
          config.nbconvertName = args[++i];
        } else {
          error('Error: --nbconvert option requires the filename or full path of the tool or \'internal\'');
          return true;
        }
        if (!(config.nbconvertName === 'internal')) {
          try {
            execSync(`${config.nbconvertName} --version`, { stdio: 'ignore' });
          } catch (err) {
            error(`Warning: ${config.nbconvertName} command not found`);
            config.nbconvertName = '';
          }
        }
        break;
      case '--format':
        if (i + 1 < args.length) {
          const format = args[++i];
          if (format === 'asciidoc' || format === 'markdown') {
            config.nbconvertFormat = format;
          } else {
            error(`Error: Unsupported format '${format}', use 'asciidoc' or 'markdown'`);
            return true;
          }
        } else {
          error('Error: --format option requires a format');
          return true;
        }
        break;
      default:
        if (arg.startsWith('-')) {
          error(`Error: Unsupported option '${arg}'`);
          return true;
        }
        // Assume it's a file or directory path to process
        pathsToProcess.push(arg);
    }
  }

  return false;
}

/**
 * Processes the provided paths recursively.
 * @async
 * @function processPathsRecursively
 * @param {string[]} pathsToProcess - The paths to process.
 * @param {ProcessingConfig} config - The processing configuration.
 * @returns {Promise<void>} - A Promise that resolves when all the paths have been processed.
 */
async function processPathsRecursively(
  pathsToProcess: string[],
  config: ProcessingConfig
): Promise<void> {
  for (const path of pathsToProcess) {
    if (!fs.existsSync(path)) {
      error(`Path does not exist: ${path}`);
      return;
    }
    await processPath(path, config);
  }
}

/**
 * The main entry point of the script.
 * @async
 * @function main
 * @param {string[]} args - The command-line arguments.
 * @returns {Promise<void>} - A Promise that resolves when the script has finished processing all the files.
 */
export async function main( args: string[] ): Promise<void> {
  return new Promise((resolve, reject) => {
    const config: ProcessingConfig = {
      includeHidden: false,
      ignoreGitignore: false,
      ignorePatterns: [],
      gitignoreRules: [],
      nbconvertName: '',
      nbconvertFormat: 'asciidoc',
    };
    const pathsToProcess: string[] = [];

    const hasError = parseCommandLineArgs(args, pathsToProcess, config, outputConfig);

    if (hasError) {
      // Quit silently before processing further
      resolve();
      return;
    }

    // Process input from stdin
    if ((compatConfig.isNode && !process.stdin.isTTY) ||
        (compatConfig.isDeno && !Deno.stdin.isTerminal()))  {
      readStdin()
        .then((stdinData) => {
          const filePathsFromStdin = parseFilePathsFromStdin(stdinData);
          pathsToProcess.push(...filePathsFromStdin);
          return processPathsRecursively(pathsToProcess, config);
        })
        .then(() => resolve())
        .catch((err) => reject(err));
    } else {
      processPathsRecursively(pathsToProcess, config)
        .then(() => resolve())
        .catch((err) => reject(err));
    }
  });
}

// Check if the script is being run directly and detect the runtime environment,
// then call main() with appropriate arguments.
// Note: main() may not be called from here when this script gets imported in test script
// TODO: write test case (not trivial)
if (import.meta.main || (process.argv[1] === fileURLToPath(import.meta.url))) {
  if (typeof Deno !== 'undefined') {
    compatConfig.isDeno = true;
    await main(Deno.args);
  } else {
    // for now Bun and Node can be considered equal
    compatConfig.isNode = true;
    await main(process.argv.slice(2));
  }
}
