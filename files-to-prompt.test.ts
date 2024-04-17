import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { describe, beforeEach, afterEach, expect, test, spyOn } from "bun:test";
import { main, isBinaryFile, parseFilePathsFromStdin } from "./files-to-prompt";
import * as ftp from "./files-to-prompt";

// Looks like 1ms not enough delay for tests to pass reliably, 5ms seems OK on my M1
// In doubt, set to 50ms
// Without this delay the afterEach() hook can run and delete files before the main() call has completed
const sleepTime = 5;

describe('files-to-prompt.ts', () => {
  const testDir = path.join(__dirname, 'test-data');

  let stdoutOutput: string = '';
  let stderrOutput: string = '';

  // Overwrite / mock output functions in main script to capture output in variables
  // Earlier versions of this test script used execSync() and direct stdout direction
  // But this makes it hard to capture stderr output (stderr gets redirected to the parent process
  // and then annoyingly error messages show up on the console when the test script runs)
  // Also child_process testing prevents the test framework from tracing codepaths and this disables coverage
  spyOn(ftp, 'output').mockImplementation((...args: any[]) => { stdoutOutput += args.join(' ') + '\n' });
  spyOn(ftp, 'error').mockImplementation((...args: any[]) => { stderrOutput += args.join(' ') + '\n' });

  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
    stdoutOutput = '';
    stderrOutput = '';
  });

  async function runScript(args: string[]): Promise<void> {
    await main(args);
    await Bun.sleep(sleepTime); // The joy of asynchrony, tests will fail without sleeping a few ms here
  }

  test('should include single file passed on the command line', async () => {
    const filePath = path.join(testDir, 'file1.txt');
    fs.writeFileSync(filePath, 'File 1 contents');

    const args = [filePath];
    await runScript(args);
    expect(stderrOutput).toBeEmpty();
    expect(stdoutOutput).toContain(filePath);
    expect(stdoutOutput).toContain("File 1 contents");
  });

  test('should include multiple files passed on the command line', async () => {
    const file1Path = path.join(testDir, 'file1.txt');
    const file2Path = path.join(testDir, 'file2.txt');
    fs.writeFileSync(file1Path, 'File 1 contents');
    fs.writeFileSync(file2Path, 'File 2 contents');

    const args = [file1Path, file2Path];
    await runScript(args);
    expect(stderrOutput).toBeEmpty();
    expect(stdoutOutput).toContain(file1Path);
    expect(stdoutOutput).toContain('File 1 contents');
    expect(stdoutOutput).toContain(file2Path);
    expect(stdoutOutput).toContain('File 2 contents');
  });

  test('should include files in directories passed on the command line', async () => {
    const dirPath = path.join(testDir, 'dir');
    fs.mkdirSync(dirPath);
    const filePath = path.join(dirPath, 'file.txt');
    fs.writeFileSync(filePath, 'File contents');

    const args = [dirPath];
    await runScript(args);
    expect(stderrOutput).toBeEmpty();
    expect(stdoutOutput).toContain(filePath);
    expect(stdoutOutput).toContain('File contents');
  });

  test('should include files a few levels deep in a directory structure', async () => {
    const dir1Path = path.join(testDir, 'dir1');
    const dir2Path = path.join(dir1Path, 'dir2');
    fs.mkdirSync(dir1Path);
    fs.mkdirSync(dir2Path);
    const filePath = path.join(dir2Path, 'file.txt');
    fs.writeFileSync(filePath, 'File contents');

    const args = [testDir];
    await runScript(args);
    expect(stderrOutput).toBeEmpty();
    expect(stdoutOutput).toContain(filePath);
    expect(stdoutOutput).toContain('File contents');
  });

  test('should exclude files matching patterns passed via --ignore', async () => {
    const file1Path = path.join(testDir, 'file1.txt');
    const file2Path = path.join(testDir, 'file2.txt');
    fs.writeFileSync(file1Path, 'File 1 contents');
    fs.writeFileSync(file2Path, 'File 2 contents');

    const args = [testDir, '--ignore', 'file1.txt'];
    await runScript(args);
    expect(stderrOutput).toBeEmpty();
    expect(stdoutOutput).not.toContain(file1Path);
    expect(stdoutOutput).toContain(file2Path);
  });

  test('should exclude files matching patterns passed via multiple --ignore', async () => {
    const file1Path = path.join(testDir, 'file1.txt');
    const file2Path = path.join(testDir, 'file2.txt');
    const file3Path = path.join(testDir, 'file3.txt');
    fs.writeFileSync(file1Path, 'File 1 contents');
    fs.writeFileSync(file2Path, 'File 2 contents');
    fs.writeFileSync(file3Path, 'File 3 contents');

    const args = [testDir, '--ignore', 'file1.txt', '--ignore', 'file2.txt'];
    await runScript(args);
    expect(stderrOutput).toBeEmpty();
    expect(stdoutOutput).not.toContain(file1Path);
    expect(stdoutOutput).not.toContain(file2Path);
    expect(stdoutOutput).toContain(file3Path);
  });

  test('should fail when --ignore gets passed without an argument', async () => {
    const file1Path = path.join(testDir, 'file1.txt');
    fs.writeFileSync(file1Path, 'File 1 contents');

    const args = [testDir, '--ignore'];
    await runScript(args);
    expect(stderrOutput).toContain('--ignore option requires a pattern');
    expect(stdoutOutput).not.toContain(file1Path);
  });

  test('should exclude files matching patterns in .gitignore', async () => {
    const file1Path = path.join(testDir, 'file1.txt');
    const file2Path = path.join(testDir, 'file2.txt');
    fs.writeFileSync(file1Path, 'File 1 contents');
    fs.writeFileSync(file2Path, 'File 2 contents');
    fs.writeFileSync(path.join(testDir, '.gitignore'), 'file1.txt');

    const args = [testDir];
    await runScript(args);
    expect(stderrOutput).toBeEmpty();
    expect(stdoutOutput).not.toContain(file1Path);
    expect(stdoutOutput).toContain(file2Path);
  });

  test('should exclude directory matching patterns in .gitignore', async () => {
    const dir1Path = path.join(testDir, 'dir1');
    const dir2Path = path.join(dir1Path, 'dir2');
    fs.mkdirSync(dir1Path);
    fs.mkdirSync(dir2Path);
    const file1Path = path.join(dir2Path, 'file.txt');
    fs.writeFileSync(file1Path, 'File 1 contents');
    const file2Path = path.join(testDir, 'file2.txt');
    fs.writeFileSync(file2Path, 'File 2 contents');
    fs.writeFileSync(path.join(testDir, '.gitignore'), 'dir1/');
  
    const args = [testDir];
    await runScript(args);
    expect(stderrOutput).toBeEmpty();
    expect(stdoutOutput).not.toContain(file1Path);
    expect(stdoutOutput).toContain(file2Path);
  });

  test('should exclude directory matching patterns in .gitignore in different directories', async () => {
    const dir1Path = path.join(testDir, 'dir1');
    const dir2Path = path.join(testDir, 'dir2');
    fs.mkdirSync(dir1Path);
    fs.mkdirSync(dir2Path);
    const file1Path = path.join(dir1Path, 'file1.txt');
    fs.writeFileSync(file1Path, 'File 1 contents');
    const file2Path = path.join(dir2Path, 'file2.txt');
    fs.writeFileSync(file2Path, 'File 2 contents');
    fs.writeFileSync(path.join(dir1Path, '.gitignore'), 'file1.txt');
    fs.writeFileSync(path.join(dir2Path, '.gitignore'), 'file2.txt');
  
    const args = [testDir];
    await runScript(args);
    expect(stderrOutput).toBeEmpty();
    expect(stdoutOutput).not.toContain(file1Path);
    expect(stdoutOutput).not.toContain(file2Path);
  });


  test('should include hidden files and directories when --include-hidden is passed', async () => {
    const hiddenFilePath = path.join(testDir, '.hidden-file.txt');
    const hiddenDirPath = path.join(testDir, '.hidden-dir');
    const hiddenDirFilePath = path.join(hiddenDirPath, 'file.txt');
    fs.writeFileSync(hiddenFilePath, 'Hidden file contents');
    fs.mkdirSync(hiddenDirPath);
    fs.writeFileSync(hiddenDirFilePath, 'Hidden dir file contents');

    const args = [testDir, '--include-hidden'];
    await runScript(args);
    expect(stderrOutput).toBeEmpty();
    expect(stdoutOutput).toContain(hiddenFilePath);
    expect(stdoutOutput).toContain('Hidden file contents');
    expect(stdoutOutput).toContain(hiddenDirFilePath);
    expect(stdoutOutput).toContain('Hidden dir file contents');
  });

  test('should ignore .gitignore files when --ignore-gitignore is passed', async () => {
    const file1Path = path.join(testDir, 'file1.txt');
    fs.writeFileSync(file1Path, 'File 1 contents');
    fs.writeFileSync(path.join(testDir, '.gitignore'), 'file1.txt');

    const args = [testDir, '--ignore-gitignore'];
    await runScript(args);
    expect(stderrOutput).toBeEmpty();
    expect(stdoutOutput).toContain(file1Path);
    expect(stdoutOutput).toContain('File 1 contents');
  });

  test('should skip binary files', async () => {
    const binaryFilePath = path.join(testDir, 'binary.data');
    const binaryData = Buffer.from([0x80, 0x81, 0x82, 0x83, 0x84, 0x85]);
    fs.writeFileSync(binaryFilePath, binaryData);

    const args = [testDir];
    await runScript(args);
    expect(stderrOutput).toContain('Warning: Skipping binary file');
    expect(stdoutOutput).not.toContain(binaryFilePath);
  });

  test('should fail silently if isBinaryFile() gets called with invalid path', async () => {
    const result = await isBinaryFile('./file-does-not-exist.txt');
    expect(result).toBeFalse;
  });

  test("should skip FIFOs", async () => {
    const fifoFilePath = path.join(testDir, "fifo");
    execSync(`mkfifo ${fifoFilePath}`);

    const args = [fifoFilePath];
    await runScript(args);
    expect(stderrOutput).toContain('unsupported file type');
    expect(stdoutOutput).not.toContain(fifoFilePath);
  });

  test("should fail with error message if path does not exist", async () => {
    const args = ['./file-does-not-exist.txt'];
    await runScript(args);
    expect(stderrOutput).toContain('Path does not exist');
  });

  test('should parse file paths with parseFilePathsFromStdin() correctly', () => {
    const stdinData = `file1.txt:File 1 contents.\nfile2.txt:File 2 contents.`;
    const filePathsFromStdin = parseFilePathsFromStdin(stdinData);
    expect(filePathsFromStdin).toEqual(['file1.txt', 'file2.txt']);
  });
});
