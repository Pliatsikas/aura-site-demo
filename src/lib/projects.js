import 'server-only';

import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const PROJECTS_DIR = path.join(process.cwd(), 'src/content/projects');
const PROJECT_FILE_PATTERN = /\.(js|jsx|mjs|ts|tsx)$/;

function evaluateCommonJsModule(source, filePath) {
  const module = { exports: {} };
  const exports = module.exports;

  const script = new vm.Script(source, { filename: filePath });
  const context = vm.createContext({
    module,
    exports,
    console,
    __filename: filePath,
    __dirname: path.dirname(filePath),
  });

  script.runInContext(context);
  return module.exports;
}

async function readProjectFile(fileName) {
  const filePath = path.join(PROJECTS_DIR, fileName);
  const source = await fs.readFile(filePath, 'utf8');
  const projectModule = evaluateCommonJsModule(source, filePath);
  return projectModule.default ?? projectModule;
}

export async function getProjects() {
  const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
  const projects = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && PROJECT_FILE_PATTERN.test(entry.name))
      .map((entry) => readProjectFile(entry.name))
  );

  return projects
    .filter(Boolean)
    .sort((left, right) => {
      const orderDiff = (left.order ?? 0) - (right.order ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return String(left.title ?? '').localeCompare(String(right.title ?? ''));
    });
}

export function getFeaturedProject(projects) {
  return projects.find((project) => project.featured3D) ?? projects[0] ?? null;
}
