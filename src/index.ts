#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import chalk from 'chalk'
import matter from 'gray-matter'

export type FrontMatterAdapter = Record<string, string>

export interface ConvertFileOptions {
  adapter?: FrontMatterAdapter
}

export interface ConvertDirectoryOptions extends ConvertFileOptions {
  deep?: boolean
  output?: string
}

export interface ConvertPathOptions extends ConvertDirectoryOptions {
  forceFile?: boolean
}

export interface CliOptions {
  input: string
  deep: boolean
  adapter: FrontMatterAdapter
  helpRequested: boolean
  output?: string
}

/**
 * Convert a single Markdown file into an MDX file with exported metadata.
 */
export async function convertFile(
  inputPath: string,
  outputPath: string,
  { adapter = {} }: ConvertFileOptions = {},
): Promise<void> {
  const content = await fs.readFile(inputPath, 'utf8')
  const { data, content: body } = matter(content)

  const mappedMetadata = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [adapter[key] ?? key, value]),
  )

  const metadataExport = `export const metadata = ${JSON.stringify(mappedMetadata, null, 2)};\n\n`
  const result = `${metadataExport + body.trimStart()}\n`

  await fs.writeFile(outputPath, result)
  console.log(
    chalk.green('✓'),
    chalk.dim('Converted:'),
    chalk.cyan(path.basename(inputPath)),
    chalk.dim('→'),
    chalk.cyan(path.basename(outputPath)),
  )
}

interface ConvertDirectoryInternalOptions extends ConvertDirectoryOptions {
  inputRoot: string
}

/**
 * Traverse a directory and convert all `.md` files.
 */
export async function convertDirectory(
  directory: string,
  { adapter = {}, deep = false, output }: ConvertDirectoryOptions = {},
): Promise<void> {
  await convertDirectoryInternal(directory, {
    adapter,
    deep,
    output,
    inputRoot: directory,
  })
}

async function convertDirectoryInternal(
  directory: string,
  { adapter = {}, deep = false, output, inputRoot }: ConvertDirectoryInternalOptions,
): Promise<void> {
  const entries = await fs.readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      if (deep) {
        await convertDirectoryInternal(fullPath, {
          adapter,
          deep,
          output,
          inputRoot,
        })
      }
      continue
    }

    if (entry.isFile() && path.extname(entry.name) === '.md') {
      let outputPath: string

      if (output) {
        const relative = path.relative(inputRoot, fullPath)
        const relativeDir = path.dirname(relative)
        const baseDir = relativeDir === '.' ? output : path.join(output, relativeDir)
        await fs.mkdir(baseDir, { recursive: true })
        outputPath = path.join(baseDir, `${path.basename(entry.name, '.md')}.mdx`)
      }
      else {
        outputPath = path.join(directory, `${path.basename(entry.name, '.md')}.mdx`)
        await fs.mkdir(path.dirname(outputPath), { recursive: true })
      }

      await convertFile(fullPath, outputPath, { adapter })
    }
  }
}

/**
 * Convert a path which can be a single Markdown file or a directory.
 */
export async function convertPath(
  input: string,
  { adapter = {}, deep = false, forceFile = false, output }: ConvertPathOptions = {},
): Promise<void> {
  const stat = await fs.stat(input).catch(() => null)

  if (!stat)
    throw new Error(`Path not found: ${input}`)

  if (stat.isFile() || forceFile) {
    if (path.extname(input) !== '.md')
      throw new Error(`Input file must have .md extension: ${input}`)

    let outputPath: string

    if (output) {
      if (path.extname(output) === '.mdx') {
        outputPath = output
      }
      else {
        outputPath = path.join(output, `${path.basename(input, '.md')}.mdx`)
      }
    }
    else {
      outputPath = path.join(path.dirname(input), `${path.basename(input, '.md')}.mdx`)
    }

    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await convertFile(input, outputPath, { adapter })
    return
  }

  if (stat.isDirectory()) {
    await convertDirectory(input, { adapter, deep, output })
    return
  }

  throw new Error(`Unsupported path type: ${input}`)
}

function parseAdapterValue(value: string, adapter: FrontMatterAdapter): void {
  const separatorIndex = value.indexOf(':')

  if (separatorIndex <= 0 || separatorIndex === value.length - 1) {
    throw new Error(`Invalid adapter mapping "${value}". Use the form "source:target".`)
  }

  const source = value.slice(0, separatorIndex).trim()
  const target = value.slice(separatorIndex + 1).trim()

  if (!source || !target)
    throw new Error(`Invalid adapter mapping "${value}". Source and target cannot be empty.`)

  adapter[source] = target
}

/**
 * Parse CLI arguments into structured options.
 */
export function parseCliArgs(args: string[]): CliOptions {
  const adapter: FrontMatterAdapter = {}
  const positional: string[] = []
  let deep = false
  let helpRequested = false
  let output: string | undefined

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]

    if (arg === '--deep') {
      deep = true
      continue
    }

    if (arg === '--no-deep') {
      deep = false
      continue
    }

    if (arg === '--help' || arg === '-h') {
      helpRequested = true
      continue
    }

    if (arg === '--adapter' || arg === '-a') {
      const next = args[i + 1]
      if (!next)
        throw new Error('Expected value for --adapter flag (format: "source:target").')

      parseAdapterValue(next, adapter)
      i += 1
      continue
    }

    if (arg === '--out' || arg === '-o') {
      const next = args[i + 1]
      if (!next)
        throw new Error('Expected value for --out flag.')

      output = next
      i += 1
      continue
    }

    if (arg.startsWith('--out=')) {
      const value = arg.slice('--out='.length)
      if (!value)
        throw new Error('Expected value for --out flag.')

      output = value
      continue
    }

    if (arg.startsWith('--adapter=')) {
      parseAdapterValue(arg.slice('--adapter='.length), adapter)
      continue
    }

    positional.push(arg)
  }

  const input = positional[0] ?? './'

  return {
    input,
    deep,
    adapter,
    helpRequested,
    output,
  }
}

function printHelp(): void {
  console.log(`Usage: md-to-mdx [directory] [options]

Options:
  --deep            Recursively process sub-directories.
  --no-deep         Disable recursive traversal (default).
  --adapter a:b     Map front-matter field "a" to "b". Repeatable.
  --out path        Write output to a directory (or .mdx file when converting one file).
  -h, --help        Show this help message.
`)
}

/**
 * CLI entry point.
 */
export async function runCli(args = process.argv.slice(2)): Promise<void> {
  let options: CliOptions

  try {
    options = parseCliArgs(args)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(chalk.red.bold('✗'), chalk.bold('Error:'), message)
    console.log()
    printHelp()
    process.exitCode = 1
    return
  }

  if (options.helpRequested) {
    printHelp()
    return
  }

  try {
    console.log(chalk.bold.cyan('md-to-mdx'), chalk.dim('Converting Markdown to MDX...'))
    console.log()

    const resolvedPath = path.resolve(process.cwd(), options.input)
    const resolvedOutput = options.output
      ? path.resolve(process.cwd(), options.output)
      : undefined
    await convertPath(resolvedPath, {
      deep: options.deep,
      adapter: options.adapter,
      output: resolvedOutput,
    })

    console.log()
    console.log(chalk.green.bold('✓'), chalk.bold('Conversion complete!'))
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(chalk.red.bold('✗'), chalk.bold('Error:'), message)
    process.exitCode = 1
  }
}

const entryPath = process.argv[1]
if (entryPath && import.meta.url === pathToFileURL(entryPath).href)
  runCli()
