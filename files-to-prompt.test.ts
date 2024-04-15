import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { describe, beforeEach, afterEach, expect, test } from "bun:test";

describe('files-to-prompt.ts', () => {
  const testDir = path.join(__dirname, 'test-data');

  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('should include single file passed on the command line', () => {
    const filePath = path.join(testDir, 'file1.txt');
    fs.writeFileSync(filePath, 'File 1 contents');

    const output = execSync(`bun ./files-to-prompt.ts ${filePath}`).toString();
    expect(output).toContain(filePath);
    expect(output).toContain('File 1 contents');
  });

  test('should include multiple files passed on the command line', () => {
    const file1Path = path.join(testDir, 'file1.txt');
    const file2Path = path.join(testDir, 'file2.txt');
    fs.writeFileSync(file1Path, 'File 1 contents');
    fs.writeFileSync(file2Path, 'File 2 contents');

    const output = execSync(`bun ./files-to-prompt.ts ${file1Path} ${file2Path}`).toString();
    expect(output).toContain(file1Path);
    expect(output).toContain('File 1 contents');
    expect(output).toContain(file2Path);
    expect(output).toContain('File 2 contents');
  });

  test('should include files in directories passed on the command line', () => {
    const dirPath = path.join(testDir, 'dir');
    fs.mkdirSync(dirPath);
    const filePath = path.join(dirPath, 'file.txt');
    fs.writeFileSync(filePath, 'File contents');

    const output = execSync(`bun ./files-to-prompt.ts ${dirPath}`).toString();
    expect(output).toContain(filePath);
    expect(output).toContain('File contents');
  });

  test('should include files a few levels deep in a directory structure', () => {
    const dir1Path = path.join(testDir, 'dir1');
    const dir2Path = path.join(dir1Path, 'dir2');
    fs.mkdirSync(dir1Path);
    fs.mkdirSync(dir2Path);
    const filePath = path.join(dir2Path, 'file.txt');
    fs.writeFileSync(filePath, 'File contents');

    const output = execSync(`bun ./files-to-prompt.ts ${testDir}`).toString();
    expect(output).toContain(filePath);
    expect(output).toContain('File contents');
  });

  test('should exclude files matching patterns passed via --ignore', () => {
    const file1Path = path.join(testDir, 'file1.txt');
    const file2Path = path.join(testDir, 'file2.txt');
    fs.writeFileSync(file1Path, 'File 1 contents');
    fs.writeFileSync(file2Path, 'File 2 contents');

    const output = execSync(`bun ./files-to-prompt.ts ${testDir} --ignore "file1.txt"`).toString();
    expect(output).not.toContain(file1Path);
    expect(output).toContain(file2Path);
  });

  test('should exclude files matching patterns in .gitignore', () => {
    const file1Path = path.join(testDir, 'file1.txt');
    const file2Path = path.join(testDir, 'file2.txt');
    fs.writeFileSync(file1Path, 'File 1 contents');
    fs.writeFileSync(file2Path, 'File 2 contents');
    fs.writeFileSync(path.join(testDir, '.gitignore'), 'file1.txt');

    const output = execSync(`bun ./files-to-prompt.ts ${testDir}`).toString();
    expect(output).not.toContain(file1Path);
    expect(output).toContain(file2Path);
  });

  test('should include hidden files and directories when --include-hidden is passed', () => {
    const hiddenFilePath = path.join(testDir, '.hidden-file.txt');
    const hiddenDirPath = path.join(testDir, '.hidden-dir');
    const hiddenDirFilePath = path.join(hiddenDirPath, 'file.txt');
    fs.writeFileSync(hiddenFilePath, 'Hidden file contents');
    fs.mkdirSync(hiddenDirPath);
    fs.writeFileSync(hiddenDirFilePath, 'Hidden dir file contents');

    const output = execSync(`bun ./files-to-prompt.ts ${testDir} --include-hidden`).toString();
    expect(output).toContain(hiddenFilePath);
    expect(output).toContain('Hidden file contents');
    expect(output).toContain(hiddenDirFilePath);
    expect(output).toContain('Hidden dir file contents');
  });

  test('should ignore .gitignore files when --ignore-gitignore is passed', () => {
    const file1Path = path.join(testDir, 'file1.txt');
    fs.writeFileSync(file1Path, 'File 1 contents');
    fs.writeFileSync(path.join(testDir, '.gitignore'), 'file1.txt');

    const output = execSync(`bun ./files-to-prompt.ts ${testDir} --ignore-gitignore`).toString();
    expect(output).toContain(file1Path);
    expect(output).toContain('File 1 contents');
  });
});