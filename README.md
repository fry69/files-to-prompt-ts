# files-to-prompt

A command-line tool to concatenate a directory full of files into a single prompt for use with Large Language Models (LLMs).

## Description

`files-to-prompt` is a utility that allows you to combine multiple text or code files into a single, continuous stream of content. This can be useful when working with LLMs, where you may want to provide a comprehensive set of information as input to the model, rather than individual files.

The tool supports processing both individual files and entire directories, and provides options to include or exclude hidden files, ignore `.gitignore` rules, and specify custom patterns to ignore.

## Installation

To use `files-to-prompt`, you'll need to have [Bun](https://bun.sh/) installed on your system. Once you have Bun set up, you can install the tool by cloning the repository and running the following command:

```
bun install
```

## Usage

To use `files-to-prompt`, run the following command:

```
bun run files-to-prompt.ts <paths...> [options]
```

Replace `<paths...>` with one or more paths to files or directories you want to process. The tool will recursively process all files within the specified directories.

Available options:

- `--include-hidden`: Include files and folders starting with `.` (default: `false`)
- `--ignore-gitignore`: Ignore `.gitignore` files and include all files (default: `false`)
- `-i, --ignore <pattern>`: Specify one or more patterns to ignore (can be used multiple times)

Example usage:

```
bun run files-to-prompt.ts ./my-project --include-hidden -i *.log -i *.tmp
```

This will concatenate all files (including hidden files) in the `./my-project` directory, excluding any files matching the `*.log` or `*.tmp` patterns.

## Contributing

If you find any issues or have suggestions for improvements, feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/your-username/files-to-prompt).

## License

This project is licensed under the [MIT License](LICENSE).