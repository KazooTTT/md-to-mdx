# md-to-mdx

[English](./README.md) | [中文](./README.zh-CN.md)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![License][license-src]][license-href]

将包含 Front Matter 的 Markdown 文件转换为带有 `export const metadata` 的 MDX 文件，方便在 React/Next.js 等框架中直接使用。

## 特性

- 保留 Front Matter 并导出为 `metadata` 对象。
- 支持批量转换目录中的 `.md` 文件，可按需递归子目录。
- 保持正文内容不变，最大限度兼容现有 Markdown/MDX 生态。

## 快速开始

无需安装，直接运行：

```bash
npx md-to-mdx ./content --deep
```

命令行参数：

- `directory`（位置参数，默认 `./`）：需要转换的目录。
- `--deep` / `--no-deep`：是否递归处理子目录。
- `--adapter 原字段:新字段`：转换 Front Matter 字段名，可重复使用。
- `--out ./output`：将生成的文件输出到指定目录（单文件模式可传 `.mdx` 文件路径）。
- `-h` / `--help`：显示帮助信息。

工具会在原目录旁生成 `.mdx` 文件，并自动注入 `export const metadata = { ... }`。

只想处理某个单独的 Markdown？直接指向该文件即可：

```bash
npx md-to-mdx ./posts/about.md
```

希望输出到独立目录？使用 `--out` 指定：

```bash
npx md-to-mdx ./content --deep --out ./converted
```

### 安装到项目或全局

```bash
# 项目内开发依赖
pnpm add -D md-to-mdx

# 全局安装
pnpm add -g md-to-mdx
```

安装后可直接通过 `pnpm md-to-mdx ./notes` 或全局的 `md-to-mdx ./notes` 运行。

## 许可证

[MIT](./LICENSE.md) License © [KazooTTT](https://github.com/kazoottt)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/md-to-mdx?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/md-to-mdx
[npm-downloads-src]: https://img.shields.io/npm/dm/md-to-mdx?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/md-to-mdx
[bundle-src]: https://img.shields.io/bundlephobia/minzip/md-to-mdx?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=md-to-mdx
[license-src]: https://img.shields.io/github/license/kazoottt/md-to-mdx.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/kazoottt/md-to-mdx/blob/main/LICENSE.md
