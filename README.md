# files-to-prompt-ts

[![JSR](https://jsr.io/badges/@fry69/files-to-prompt-ts)](https://jsr.io/@fry69/files-to-prompt-ts)
[![JSR Score](https://jsr.io/badges/@fry69/files-to-prompt-ts/score)](https://jsr.io/@fry69/files-to-prompt-ts)

A command-line tool to concatenate a directory full of files into a single prompt for use with Large Language Models (LLMs).

## Description

`files-to-prompt.ts` is a stand-alone, dependency free script that allows you to combine multiple text or code files into a single, continuous stream of content. This can be useful when working with LLMs, where you may want to provide a comprehensive set of information as input to the model, rather than individual files.

The tool supports processing both individual files and entire directories, and provides options to include or exclude hidden files, ignore `.gitignore` rules, and specify custom patterns to ignore. Only a simple subset of `.gitignore` patterns are supported.

This is a TypeScript port of the original `files-to-prompt` tool written in Python by Simon Willison, which is available at [https://github.com/simonw/files-to-prompt](https://github.com/simonw/files-to-prompt).

## Installation

1. To use `files-to-prompt.ts` out-of-the-box, you'll need to have [Bun](https://bun.sh/) installed on your system.

2. Download the script
    - Install via jsr.io
        ```shell
        curl https://jsr.io/@fry69/files-to-prompt-ts/0.1.6/files-to-prompt.ts > ftp.ts
        ```

    - Install via GitHub

        ```shell
        curl https://raw.githubusercontent.com/fry69/files-to-prompt-ts/main/files-to-prompt.ts > ftp.ts
        ```

3. Copy the `ftp.ts` script to a location where it is accessible from your system's `$PATH`
4. Make it executable with `chmod +x ftp.ts`

## Usage

Run `ftp.ts` like a standard command:

```
ftp.ts <paths...> [options]
```

Replace `<paths...>` with one or more paths to files or directories you want to process. The tool will recursively process all files within the specified directories.

Available options:

- `--include-hidden`: Include files and folders starting with `.` (default: `false`)
- `--ignore-gitignore`: Ignore `.gitignore` files and include all files (default: `false`)
- `-i, --ignore <pattern>`: Specify one or more patterns to ignore (can be used multiple times)

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

Recent test status:

```
bun test v1.1.3 (2615dc74)

files-to-prompt.test.ts:
✓ files-to-prompt.ts > should include single file passed on the command line [7.09ms]
✓ files-to-prompt.ts > should include multiple files passed on the command line [2.81ms]
✓ files-to-prompt.ts > should include files in directories passed on the command line [1.81ms]
✓ files-to-prompt.ts > should include files a few levels deep in a directory structure [2.01ms]
✓ files-to-prompt.ts > should exclude files matching patterns passed via --ignore [1.91ms]
✓ files-to-prompt.ts > should exclude files matching patterns in .gitignore [1.93ms]
✓ files-to-prompt.ts > should exclude directory matching patterns in .gitignore [1.96ms]
✓ files-to-prompt.ts > should exclude directory matching patterns in .gitignore in different directories [1.99ms]
✓ files-to-prompt.ts > should include hidden files and directories when --include-hidden is passed [1.88ms]
✓ files-to-prompt.ts > should ignore .gitignore files when --ignore-gitignore is passed [1.72ms]
✓ files-to-prompt.ts > should skip binary files [1.93ms]
✓ files-to-prompt.ts > should fail with error message if path does not exist [2.35ms]
✓ files-to-prompt.ts > should skip FIFOs [13.40ms]
--------------------|---------|---------|-------------------
File                | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|---------|-------------------
All files           |   92.00 |   96.69 |
 files-to-prompt.ts |   92.00 |   96.69 | 14,18,50
--------------------|---------|---------|-------------------

 13 pass
 0 fail
 39 expect() calls
Ran 13 tests across 1 files. [86.00ms]
```

## Compatibility

The script is compatible with [Deno](https://deno.com/).
Transpilation to pure Javascript / [Node](https://nodejs.org/en) is (currently) not supported.

## Contributing

If you find any issues or have suggestions for improvements, feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/fry69/files-to-prompt-ts).

## License

This project is licensed under the [MIT License](LICENSE).
