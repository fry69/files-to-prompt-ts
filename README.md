# files-to-prompt-ts

[![JSR](https://jsr.io/badges/@fry69/files-to-prompt-ts)](https://jsr.io/@fry69/files-to-prompt-ts)
[![JSR Score](https://jsr.io/badges/@fry69/files-to-prompt-ts/score)](https://jsr.io/@fry69/files-to-prompt-ts)

A command-line tool to concatenate files and directories in a structured way to a single prompt for use with large language models and other applications.

## Description

`files-to-prompt.ts` is a stand-alone, dependency free[^1] script that combines multiple text or code files into a single, continuous stream of content. This can be useful when working with LLMs, where you may want to provide a comprehensive set of information as input to the model, rather than individual files.

This is a TypeScript port of the original `files-to-prompt` tool written in Python by Simon Willison, which is available at [https://github.com/simonw/files-to-prompt](https://github.com/simonw/files-to-prompt).

[^1]: The script needs a TypeScript engine to run, of course.

## Features

- Extracts the contents of text files and presents them in a formatted way
- Supports including or excluding hidden files and directories
- Allows ignoring files based on patterns or .gitignore rules
- Converts Jupyter Notebook (.ipynb) files to ASCII or Markdown
- Supports redirecting output to a file
- Runs on the Bun runtime environment

## Installation

To use the `files-to-prompt.ts` tool, you'll need to have the Bun TypeScript engine installed on your system. You can download and install Bun from the official website: [https://bun.sh/](https://bun.sh/)

Once you have Bun installed, you can clone the repository and run the tool:

```bash
git clone https://github.com/fry69/files-to-prompt.ts.git
cd files-to-prompt.ts
bun run files-to-prompt.ts [options] [paths]
```

Alternatively you can download the script directly:
- from jsr.io:
```shell
curl https://jsr.io/@fry69/files-to-prompt-ts/0.4.1/files-to-prompt.ts > ftp.ts
```
- from GitHub:
```shell
curl https://raw.githubusercontent.com/fry69/files-to-prompt-ts/v0.4.1/files-to-prompt.ts > ftp.ts
```

Don't forget to make the script executable with `chmod +x ftp.ts` and move it to a location where it is accessible from your system's `$PATH` (optional).

## Usage

### Command-line Arguments

The tool accepts the following command-line arguments:

```
--version                 Output the version of the tool
--include-hidden          Include hidden files and directories
--ignore-gitignore        Ignore .gitignore files
-i, --ignore <pattern>    Ignore files matching the specified pattern
-o, --output <file>       Redirect output to the specified file
--nbconvert <command>     Specify the nbconvert command to use for .ipynb files
--format <format>         Specify the format to convert .ipynb files to ('asciidoc' or 'markdown')
[paths]                   One or more file or directory paths to process
```

### Input from Stdin

The tool can also accept file paths from stdin. The input can be in the following formats:

- One file path per line
- File paths with a colon separator, as in the output of grep or ripgrep

### Output Configuration

By default, the tool outputs the file contents to the console. You can redirect the output to a file using the `--output` or `-o` option.

### Notebook Conversion

If the `--nbconvert` option is provided, the tool will attempt to convert any `.ipynb` (Jupyter Notebook) files to the specified format (`--format asciidoc` or `--format markdown`) using the provided `nbconvert` command name or path. By default `asciidoc` will be used.

Without conversion (or if the provided command cannot be found) `.ipynb` files will get included verbatim in their `JSON` format (including `base64` encoded images etc).

Internally each file conversion happens in a freshly created temporary directory (via `mktemp` API), which gets deleted automatically after successful (or unsucessful) completion.

### Example usage:

```
ftp.ts ./my-project --include-hidden -i *.lockdb -i *.env | \
    llm -s "Check the provided code for spelling errors, inconsistencies, dead code and other minor issues I might have overlooked."
```

This will concatenate all files (including hidden files) in the `./my-project` directory, excluding any files matching the `*.lockdb` or `*.env` patterns, and then send the result to the [llm](https://llm.datasette.io/en/stable/) command, which adds a system prompt and sends it to a LLM API for processing.

## Example output format

```
$ ./ftp.ts testfolder/
testfolder/file3.txt
---
File 3 contents

---
Warning: Skipping binary file testfolder/binary.data
```

> **Note:** Warnings and errors will get sent to `stderr`, piping the output to another command is safe. The script tries its best to keep the output stream clean.

## Testing

This repository includes a comprehensive test script to ensure `files-to-prompt.ts` works as expected. You can run the tests using the following command:

```
bun test --coverage
```

Recent test status (v0.4.1):

```
bun test v1.1.4 (fbe2fe0c)

files-to-prompt.test.ts:
✓ files-to-prompt.ts > should include single file passed on the command line [12.20ms]
✓ files-to-prompt.ts > should include multiple files passed on the command line [6.69ms]
✓ files-to-prompt.ts > should include files in directories passed on the command line [7.57ms]
✓ files-to-prompt.ts > should include files a few levels deep in a directory structure [6.65ms]
✓ files-to-prompt.ts > should exclude files matching patterns passed via --ignore [6.76ms]
✓ files-to-prompt.ts > should exclude files matching patterns passed via multiple --ignore [6.67ms]
✓ files-to-prompt.ts > should fail when --ignore gets passed without an argument [7.08ms]
✓ files-to-prompt.ts > should exclude files matching patterns in .gitignore [6.98ms]
✓ files-to-prompt.ts > should exclude directory matching patterns in .gitignore [8.02ms]
✓ files-to-prompt.ts > should exclude directory matching patterns in .gitignore in different directories [6.94ms]
✓ files-to-prompt.ts > should include hidden files and directories when --include-hidden is passed [8.40ms]
✓ files-to-prompt.ts > should ignore .gitignore files when --ignore-gitignore is passed [6.62ms]
✓ files-to-prompt.ts > should skip binary files [6.71ms]
✓ files-to-prompt.ts > should fail silently if isBinaryFile() gets called with invalid path [1.15ms]
✓ files-to-prompt.ts > should skip FIFOs [13.40ms]
✓ files-to-prompt.ts > should fail with error message if path does not exist [5.77ms]
✓ files-to-prompt.ts > should parse file paths with parseFilePathsFromStdin() correctly [1.14ms]
✓ files-to-prompt.ts > should de-duplicate file paths with parseFilePathsFromStdin() [0.06ms]
✓ files-to-prompt.ts > should parse file paths with one file path per line [0.07ms]
✓ files-to-prompt.ts > should handle mixed input formats [0.04ms]
✓ files-to-prompt.ts > should handle empty lines in stdin data [0.03ms]
✓ files-to-prompt.ts > should handle binary data in stdin [0.08ms]
✓ files-to-prompt.ts > should handle common text/code files in stdin [0.04ms]
✓ files-to-prompt.ts > should handle long file paths in stdin [0.26ms]
✓ files-to-prompt.ts > should ignore file paths with the null character [0.04ms]
✓ files-to-prompt.ts > should ignore file paths with control characters [0.05ms]
✓ files-to-prompt.ts > should output version string when --version is passed [0.08ms]
✓ files-to-prompt.ts > should output error for unsupported options [0.07ms]
✓ files-to-prompt.ts > should output to a file when --output is passed [7.54ms]
✓ files-to-prompt.ts > should output to a file when -o is passed [6.60ms]
✓ files-to-prompt.ts > should output error if --output is passed without a file path [5.87ms]
✓ files-to-prompt.ts > should output error if -o is passed without a file path [5.85ms]
✓ files-to-prompt.ts > should output error if output file cannot be written [7.01ms]
✓ files-to-prompt.ts > should include .ipynb files verbatim whitout --nbconvert [6.52ms]
✓ files-to-prompt.ts > should include .ipynb files verbatim when --nbconvert is set to invalid command [11.90ms]
[NbConvertApp] Converting notebook /var/folders/p4/fjmnrwzs0qv1m7qlvqc98dvh0000gn/T/files-to-prompt-aFa6VX/notebook.ipynb to asciidoc
[NbConvertApp] Writing 63 bytes to /var/folders/p4/fjmnrwzs0qv1m7qlvqc98dvh0000gn/T/files-to-prompt-aFa6VX/notebook.asciidoc
✓ files-to-prompt.ts > should convert .ipynb files to ASCII when --nbconvert --format asciidoc is passed [806.83ms]
[NbConvertApp] Converting notebook /var/folders/p4/fjmnrwzs0qv1m7qlvqc98dvh0000gn/T/files-to-prompt-BRB6Km/notebook.ipynb to markdown
[NbConvertApp] Writing 37 bytes to /var/folders/p4/fjmnrwzs0qv1m7qlvqc98dvh0000gn/T/files-to-prompt-BRB6Km/notebook.md
✓ files-to-prompt.ts > should convert .ipynb files to Markdown when --nbconvert --format markdown is passed [806.51ms]
--------------------|---------|---------|-------------------
File                | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|---------|-------------------
All files           |   89.66 |   87.06 |
 files-to-prompt.ts |   89.66 |   87.06 | 52,65,80,91-94,120,163,184-185,201,327-338,459-460,475-476,479-480,495-497,515-518
--------------------|---------|---------|-------------------

 37 pass
 0 fail
 87 expect() calls
Ran 37 tests across 1 files. [1.83s]
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
