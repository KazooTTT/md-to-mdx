# md-to-mdx

[English](./README.md) | [中文](./README.zh-CN.md)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![License][license-src]][license-href]

Convert Markdown files with front-matter into ready-to-use MDX files that export the parsed metadata.

## Highlights

- Preserves front-matter and exposes it as `export const metadata = …` in the generated MDX.
- Converts entire folders in one go; optionally recurse into sub-directories.
- Keeps the original Markdown body untouched for maximum compatibility with MDX tooling.

## Quick Start

Run the CLI without installing anything:

```bash
npx md-to-mdx ./content --deep
```

Options:

- `directory` (positional, default `./`): Folder that contains your `.md` files.
- `--deep` / `--no-deep`: Enable or disable recursive traversal of sub-directories.
- `--adapter title:name`: Map front-matter fields into new names. Repeat the flag as needed.
- `--out ./output`: Write converted files to this directory (or pass a `.mdx` file path for single-file mode).
- `-h`, `--help`: Print usage information.

Each Markdown file is converted to an `.mdx` file alongside the original and includes an `export const metadata` block.

Want to process a single file? Just pass the `.md` path:

```bash
npx md-to-mdx ./posts/about.md
```

Prefer writing to a separate folder? Specify `--out`:

```bash
npx md-to-mdx ./content --deep --out ./converted
```

### Install Locally or Globally

```bash
# project devDependency
pnpm add -D md-to-mdx

# global install
pnpm add -g md-to-mdx
```

Then invoke with `pnpm md-to-mdx ./notes` (workspace) or `md-to-mdx ./notes`.

## License

[MIT](./LICENSE) License © [KazooTTT](https://github.com/kazoottt)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/md-to-mdx?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/md-to-mdx
[npm-downloads-src]: https://img.shields.io/npm/dm/md-to-mdx?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/md-to-mdx
[bundle-src]: https://img.shields.io/bundlephobia/minzip/md-to-mdx?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=md-to-mdx
[license-src]: https://img.shields.io/github/license/kazoottt/md-to-mdx.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/kazoottt/md-to-mdx/blob/main/LICENSE.md
