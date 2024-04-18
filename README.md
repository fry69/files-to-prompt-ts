# files-to-prompt-ts

[![JSR](https://jsr.io/badges/@fry69/files-to-prompt-ts)](https://jsr.io/@fry69/files-to-prompt-ts)
[![JSR Score](https://jsr.io/badges/@fry69/files-to-prompt-ts/score)](https://jsr.io/@fry69/files-to-prompt-ts)

A command-line tool to concatenate a directory full of files into a single prompt for use with Large Language Models (LLMs).

## Description

`files-to-prompt.ts` is a stand-alone, dependency free[^1] script that allows you to combine multiple text or code files into a single, continuous stream of content. This can be useful when working with LLMs, where you may want to provide a comprehensive set of information as input to the model, rather than individual files.

The tool supports processing both individual files and entire directories, and provides options to include or exclude hidden files, ignore `.gitignore` rules, and specify custom patterns to ignore. Only a simple subset of `.gitignore` patterns are supported.

This is a TypeScript port of the original `files-to-prompt` tool written in Python by Simon Willison, which is available at [https://github.com/simonw/files-to-prompt](https://github.com/simonw/files-to-prompt).

Additional features not found the original version:
- reading and parsing file paths received via `stdin` (e.g. via pipe from `grep` or `ripgrep`)
- redirect output to a file with `--output <file>` or `-o <file>`

[^1]: The script needs a Typescript engine to run, of course.

## Installation

1. To use `files-to-prompt.ts` out-of-the-box, you'll need to have [Bun](https://bun.sh/) installed on your system.

2. Download the script
    - Install via jsr.io
        ```shell
        curl https://jsr.io/@fry69/files-to-prompt-ts/0.3.0/files-to-prompt.ts > ftp.ts
        ```

    - Install via GitHub

        ```shell
        curl https://raw.githubusercontent.com/fry69/files-to-prompt-ts/v0.3.0/files-to-prompt.ts > ftp.ts
        ```

3. Make the script executable with `chmod +x ftp.ts`
4. Move `ftp.ts` to a location where it is accessible from your system's `$PATH` (optional)

## Usage

Run `ftp.ts` like a standard command:

```
ftp.ts <paths...> [options]
```

Replace `<paths...>` with one or more paths to files or directories you want to process. The tool will recursively process all files within the specified directories.

Available options:

- `--version`: Version of this script
- `--include-hidden`: Include files and folders starting with `.` (default: `false`)
- `--ignore-gitignore`: Ignore `.gitignore` files and include all files (default: `false`)
- `-i, --ignore <pattern>`: Specify one or more patterns to ignore (can be used multiple times)
- `-o, --output <file>`: Redirect output to `file` (**Note:** `file` will get silently overwritten)

Example usage:

```
ftp.ts ./my-project --include-hidden -i *.lockdb -i *.env | \
    llm -s "Update README.md to current state of the project"
```

This will concatenate all files (including hidden files) in the `./my-project` directory, excluding any files matching the `*.lockdb` or `*.env` patterns, and then send the result to the [llm](https://llm.datasette.io/en/stable/) command, which adds a system prompt and sends it to an LLM model for processing.

## Example output

```
$ ./ftp.ts testfolder/
testfolder/file3.txt
---
File 3 contents

---
Warning: Skipping binary file testfolder/binary.data
```
> **Note:** Warnings and errors will get sent to `stderr`, piping the output to another command is safe

## Testing

This tool includes a set of tests to ensure it works as expected. You can run the tests using the following command:

```
bun test --coverage
```

Recent test status (v0.3.0):

```
bun test v1.1.4 (fbe2fe0c)

files-to-prompt.test.ts:
✓ files-to-prompt.ts > should include single file passed on the command line [11.52ms]
✓ files-to-prompt.ts > should include multiple files passed on the command line [6.67ms]
✓ files-to-prompt.ts > should include files in directories passed on the command line [7.52ms]
✓ files-to-prompt.ts > should include files a few levels deep in a directory structure [6.65ms]
✓ files-to-prompt.ts > should exclude files matching patterns passed via --ignore [6.61ms]
✓ files-to-prompt.ts > should exclude files matching patterns passed via multiple --ignore [6.57ms]
✓ files-to-prompt.ts > should fail when --ignore gets passed without an argument [6.99ms]
✓ files-to-prompt.ts > should exclude files matching patterns in .gitignore [6.82ms]
✓ files-to-prompt.ts > should exclude directory matching patterns in .gitignore [7.99ms]
✓ files-to-prompt.ts > should exclude directory matching patterns in .gitignore in different directories [6.71ms]
✓ files-to-prompt.ts > should include hidden files and directories when --include-hidden is passed [8.19ms]
✓ files-to-prompt.ts > should ignore .gitignore files when --ignore-gitignore is passed [6.46ms]
✓ files-to-prompt.ts > should skip binary files [6.71ms]
✓ files-to-prompt.ts > should fail silently if isBinaryFile() gets called with invalid path [1.18ms]
✓ files-to-prompt.ts > should skip FIFOs [15.07ms]
✓ files-to-prompt.ts > should fail with error message if path does not exist [6.76ms]
✓ files-to-prompt.ts > should parse file paths with parseFilePathsFromStdin() correctly [0.27ms]
✓ files-to-prompt.ts > should de-duplicate file paths with parseFilePathsFromStdin() [0.06ms]
✓ files-to-prompt.ts > should parse file paths with one file path per line [0.06ms]
✓ files-to-prompt.ts > should handle mixed input formats [0.03ms]
✓ files-to-prompt.ts > should handle empty lines in stdin data [0.03ms]
✓ files-to-prompt.ts > should handle binary data in stdin [0.08ms]
✓ files-to-prompt.ts > should handle common text/code files in stdin [0.04ms]
✓ files-to-prompt.ts > should handle long file paths in stdin [0.25ms]
✓ files-to-prompt.ts > should ignore file paths with the null character [0.03ms]
✓ files-to-prompt.ts > should ignore file paths with control characters [0.34ms]
✓ files-to-prompt.ts > should output version string when --version is passed [0.10ms]
✓ files-to-prompt.ts > should output error for unsupported options [0.09ms]
✓ files-to-prompt.ts > should output to a file when --output is passed [6.80ms]
✓ files-to-prompt.ts > should output to a file when -o is passed [7.74ms]
✓ files-to-prompt.ts > should output error if --output is passed without a file path [5.84ms]
✓ files-to-prompt.ts > should output error if -o is passed without a file path [7.02ms]
✓ files-to-prompt.ts > should output error if output file cannot be written [6.02ms]
--------------------|---------|---------|-------------------
File                | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|---------|-------------------
All files           |   88.89 |   87.98 |
 files-to-prompt.ts |   88.89 |   87.98 | 46,59,74,85-88,114,152,279-290,417-419,437-440
--------------------|---------|---------|-------------------

 33 pass
 0 fail
 73 expect() calls
Ran 33 tests across 1 files. [195.00ms]
```

## Compatibility

The script is mostly compatible with [Deno](https://deno.com/), see [issues](https://github.com/fry69/files-to-prompt-ts/issues) for details.
Transpilation to pure Javascript / [Node](https://nodejs.org/en) is (currently) not supported.

## Contributing

If you find any issues or have suggestions for improvements, feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/fry69/files-to-prompt-ts).

## License

This project is licensed under the [MIT License](LICENSE).
