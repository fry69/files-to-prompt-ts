# files-to-prompt-ts

A command-line tool to concatenate a directory full of files into a single prompt for use with Large Language Models (LLMs).

## Description

`files-to-prompt` is a stand-alone script that allows you to combine multiple text or code files into a single, continuous stream of content. This can be useful when working with LLMs, where you may want to provide a comprehensive set of information as input to the model, rather than individual files.

The tool supports processing both individual files and entire directories, and provides options to include or exclude hidden files, ignore `.gitignore` rules, and specify custom patterns to ignore. Only a simple subset of `.gitignore` patterns are supported.

This is a TypeScript port of the original `files-to-prompt` tool written in Python by Simon Willison, which is available at [https://github.com/simonw/files-to-prompt](https://github.com/simonw/files-to-prompt).

## Installation

To use `files-to-prompt`, you'll need to have [Bun](https://bun.sh/) installed on your system ([Node](https://nodejs.org/) may work too with minor modifications).

Copy the `files-to-prompt.ts` script to a location where it is accessible from your system's `$PATH`, then make it executable (`chmod +x files-to-prompt.ts`).

## Usage

Run `files-to-prompt.ts` like a standard command:

```
files-to-prompt.ts <paths...> [options]
```

Replace `<paths...>` with one or more paths to files or directories you want to process. The tool will recursively process all files within the specified directories.

Available options:

- `--include-hidden`: Include files and folders starting with `.` (default: `false`)
- `--ignore-gitignore`: Ignore `.gitignore` files and include all files (default: `false`)
- `-i, --ignore <pattern>`: Specify one or more patterns to ignore (can be used multiple times)

Example usage:

```
files-to-prompt.ts ./my-project --include-hidden -i *.lockdb -i *.env | llm -s "Update README.md to current state of the project"
```

This will concatenate all files (including hidden files) in the `./my-project` directory, excluding any files matching the `*.lockdb` or `*.env` patterns, and then send the result to the `llm` command, which adds a system prompt and sends it to an LLM model for processing.

## Testing

This tool includes a set of tests to ensure it works as expected. You can run the tests using the following command:

```
bun test
```

## Contributing

If you find any issues or have suggestions for improvements, feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/fry69/files-to-prompt-ts).

## License

This project is licensed under the [MIT License](LICENSE).
