#!/usr/bin/env node
/**
 * 生成 API 类型的统一入口。
 *
 * 处理流程:
 * 1. 读 api-spec/openapi.json (后端主源, 可能是 Swagger 2.0 或 OpenAPI 3.x)
 * 2. 如果存在 api-spec/openapi.local.json (前端本地提议), 合并它的 paths/components
 * 3. Swagger 2.0 → 先转成 OpenAPI 3.x
 * 4. openapi-typescript 生成 src/types/api.ts
 *
 * local.json 使用场景: 后端还没实现某些接口, 前端基于 PRD 写 stub 先开发。
 * 待后端实现后, 从 local.json 删除并由主 openapi.json 提供。
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SOURCE = resolve(ROOT, 'api-spec/openapi.json');
const LOCAL = resolve(ROOT, 'api-spec/openapi.local.json');
const MERGED = resolve(ROOT, 'api-spec/.openapi.merged.json');
const CONVERTED = resolve(ROOT, 'api-spec/.openapi.v3.json');
const OUTPUT = resolve(ROOT, 'src/types/api.ts');

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf-8'));
}

function detectVersion(spec) {
  if (spec.openapi && /^3\./.test(spec.openapi)) return { kind: 'v3', version: spec.openapi };
  if (spec.swagger === '2.0') return { kind: 'v2', version: '2.0' };
  throw new Error(`无法识别 OpenAPI 版本: openapi=${spec.openapi} swagger=${spec.swagger}`);
}

function mergeLocal(main, local) {
  const merged = structuredClone(main);
  const proposedPaths = [];
  const { kind } = detectVersion(main);

  merged.paths = { ...(merged.paths || {}), ...(local.paths || {}) };
  for (const [path, item] of Object.entries(local.paths || {})) {
    for (const method of Object.keys(item)) {
      if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)) {
        proposedPaths.push(`${method.toUpperCase()} ${path}`);
      }
    }
  }

  if (kind === 'v3') {
    merged.components = merged.components || {};
    for (const key of Object.keys(local.components || {})) {
      merged.components[key] = { ...(merged.components[key] || {}), ...local.components[key] };
    }
  } else {
    merged.definitions = { ...(merged.definitions || {}), ...(local.definitions || {}) };
  }

  return { merged, proposedPaths };
}

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', cwd: ROOT });
}

function main() {
  mkdirSync(dirname(OUTPUT), { recursive: true });

  const mainSpec = readJson(SOURCE);
  let inputFile = SOURCE;

  if (existsSync(LOCAL)) {
    const localSpec = readJson(LOCAL);
    const { merged, proposedPaths } = mergeLocal(mainSpec, localSpec);
    writeFileSync(MERGED, JSON.stringify(merged, null, 2));
    inputFile = MERGED;
    console.log(`⚠️  已合并 openapi.local.json (前端提议接口, 后端未实现):`);
    proposedPaths.forEach((p) => console.log(`     - ${p}`));
    console.log(`    后端实现后请从 local 删除这些接口。`);
  }

  const spec = readJson(inputFile);
  const { kind, version } = detectVersion(spec);

  if (kind === 'v3') {
    console.log(`✓ 检测到 OpenAPI ${version}, 直接生成类型`);
    run(`npx openapi-typescript "${inputFile}" -o "${OUTPUT}"`);
  } else {
    console.log(`✓ 检测到 Swagger ${version}, 先转换为 OpenAPI 3.x`);
    run(`npx swagger2openapi "${inputFile}" -o "${CONVERTED}"`);
    run(`npx openapi-typescript "${CONVERTED}" -o "${OUTPUT}"`);
  }

  console.log(`✓ 类型已生成: ${OUTPUT}`);
}

main();
