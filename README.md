# files-to-prompt-ts

[![JSR](https://jsr.io/badges/@fry69/files-to-prompt-ts)](https://jsr.io/@fry69/files-to-prompt-ts)
[![JSR Score](https://jsr.io/badges/@fry69/files-to-prompt-ts/score)](https://jsr.io/@fry69/files-to-prompt-ts)

A command-line tool to concatenate a directory full of files into a single prompt for use with Large Language Models (LLMs).

## Description

`files-to-prompt.ts` is a stand-alone, dependency free[^1] script that allows you to combine multiple text or code files into a single, continuous stream of content. This can be useful when working with LLMs, where you may want to provide a comprehensive set of information as input to the model, rather than individual files.

The tool supports processing both individual files and entire directories, and provides options to include or exclude hidden files, ignore `.gitignore` rules, and specify custom patterns to ignore. Only a simple subset of `.gitignore` patterns are supported.

This is a TypeScript port of the original `files-to-prompt` tool written in Python by Simon Willison, which is available at [https://github.com/simonw/files-to-prompt](https://github.com/simonw/files-to-prompt).

Additional features not currently found the original version:
- reading and parsing file paths received via `stdin` (e.g. via pipe from `grep` or `ripgrep`)
- redirect output to a file with `--output <file>` or `-o <file>`
- convert Jupyter Notebook `*.ipynb` files on the fly to ascii or markdown with [nbconvert](https://nbconvert.readthedocs.io/en/latest/index.html)

[^1]: The script needs a Typescript engine to run, of course.

## Installation

1. To use `files-to-prompt.ts` out-of-the-box, you'll need to have [Bun](https://bun.sh/) installed on your system.

2. Download the script
    - Install via jsr.io
        ```shell
        curl https://jsr.io/@fry69/files-to-prompt-ts/0.4.0/files-to-prompt.ts > ftp.ts
        ```

    - Install via GitHub

        ```shell
        curl https://raw.githubusercontent.com/fry69/files-to-prompt-ts/v0.4.0/files-to-prompt.ts > ftp.ts
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
- `--nbconvert <toolname>`: Name or full path of the installed `nbconvert` tool, e.g. `jupyter-nbconvert`
- `--format [asciidoc | markdown]`: Output format for the `nbconvert` tool, defaults to `asciidoc`

Jupyter Notebook conversion gets triggered when the `--nbconvert <toolname>` option is set, otherwise `.ipynb` files will get included verbatim in their `JSON` format (including `base64` encoded images etc). Each file conversion will happen in a freshly created temporary directory which will get deleted after each conversion.

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

Recent test status (v0.4.0):

```
bun test v1.1.4 (fbe2fe0c)

files-to-prompt.test.ts:
✓ files-to-prompt.ts > should include single file passed on the command line [11.11ms]
✓ files-to-prompt.ts > should include multiple files passed on the command line [6.59ms]
✓ files-to-prompt.ts > should include files in directories passed on the command line [7.34ms]
✓ files-to-prompt.ts > should include files a few levels deep in a directory structure [6.66ms]
✓ files-to-prompt.ts > should exclude files matching patterns passed via --ignore [6.51ms]
✓ files-to-prompt.ts > should exclude files matching patterns passed via multiple --ignore [6.40ms]
✓ files-to-prompt.ts > should fail when --ignore gets passed without an argument [6.55ms]
✓ files-to-prompt.ts > should exclude files matching patterns in .gitignore [6.64ms]
✓ files-to-prompt.ts > should exclude directory matching patterns in .gitignore [7.79ms]
✓ files-to-prompt.ts > should exclude directory matching patterns in .gitignore in different directories [6.73ms]
✓ files-to-prompt.ts > should include hidden files and directories when --include-hidden is passed [6.87ms]
✓ files-to-prompt.ts > should ignore .gitignore files when --ignore-gitignore is passed [7.38ms]
✓ files-to-prompt.ts > should skip binary files [6.53ms]
✓ files-to-prompt.ts > should fail silently if isBinaryFile() gets called with invalid path [0.20ms]
✓ files-to-prompt.ts > should skip FIFOs [15.02ms]
✓ files-to-prompt.ts > should fail with error message if path does not exist [5.77ms]
✓ files-to-prompt.ts > should parse file paths with parseFilePathsFromStdin() correctly [0.22ms]
✓ files-to-prompt.ts > should de-duplicate file paths with parseFilePathsFromStdin() [0.05ms]
✓ files-to-prompt.ts > should parse file paths with one file path per line [0.06ms]
✓ files-to-prompt.ts > should handle mixed input formats [0.03ms]
✓ files-to-prompt.ts > should handle empty lines in stdin data [0.02ms]
✓ files-to-prompt.ts > should handle binary data in stdin [0.06ms]
✓ files-to-prompt.ts > should handle common text/code files in stdin [0.05ms]
✓ files-to-prompt.ts > should handle long file paths in stdin [0.21ms]
✓ files-to-prompt.ts > should ignore file paths with the null character [0.03ms]
✓ files-to-prompt.ts > should ignore file paths with control characters [0.34ms]
✓ files-to-prompt.ts > should output version string when --version is passed [0.07ms]
✓ files-to-prompt.ts > should output error for unsupported options [0.06ms]
✓ files-to-prompt.ts > should output to a file when --output is passed [6.44ms]
✓ files-to-prompt.ts > should output to a file when -o is passed [6.37ms]
✓ files-to-prompt.ts > should output error if --output is passed without a file path [5.88ms]
✓ files-to-prompt.ts > should output error if -o is passed without a file path [5.88ms]
✓ files-to-prompt.ts > should output error if output file cannot be written [6.87ms]
✓ files-to-prompt.ts > should convert .ipynb files to ASCII when --nbconvert --format asciidoc is passed [694.64ms]
✓ files-to-prompt.ts > should convert .ipynb files to Markdown when --nbconvert --format markdown is passed [498.13ms]
--------------------|---------|---------|-------------------
File                | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|---------|-------------------
All files           |   89.66 |   86.83 |
 files-to-prompt.ts |   89.66 |   86.83 | 52,65,80,91-94,120,163,184-185,201,327-338,459-460,469-470,473-474,489-491,509-512
--------------------|---------|---------|-------------------

 35 pass
 0 fail
 81 expect() calls
Ran 35 tests across 1 files. [1383.00ms]
```

## Compatibility

The script is mostly compatible with [Deno](https://deno.com/), see [issues](https://github.com/fry69/files-to-prompt-ts/issues) for details.
Transpilation to pure Javascript / [Node](https://nodejs.org/en) is (currently) not supported.

## Contributing

If you find any issues or have suggestions for improvements, feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/fry69/files-to-prompt-ts).

## License

This project is licensed under the [MIT License](LICENSE).

## Disclaimer

Large Language Models were used to create this tool. All generated code was curated by me before inclusion and nearly all codepaths get thorougly tested. Despite best efforts and intentions, there may be bugs.
