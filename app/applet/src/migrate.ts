import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = __dirname;

function getFiles(dir: string): string[] {
    let files: string[] = [];
    if (!fs.existsSync(dir)) return files;
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            files = files.concat(getFiles(fullPath));
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            files.push(fullPath);
        }
    });
    return files;
}

const files = getFiles(srcDir);

const classMap: Record<string, string> = {
    'bg-[#020617]': 'bg-slate-50 dark:bg-[#020617]',
    'bg-[#0f172a]': 'bg-white dark:bg-[#0f172a]',
    'bg-slate-950': 'bg-white dark:bg-slate-950',
    'bg-slate-900': 'bg-white dark:bg-slate-900',
    'bg-slate-800': 'bg-slate-100 dark:bg-slate-800',
    'bg-slate-700': 'bg-slate-200 dark:bg-slate-700',
    'bg-[#0f172a]/95': 'bg-white/95 dark:bg-[#0f172a]/95',
    'bg-[#0f172a]/40': 'bg-white/40 dark:bg-[#0f172a]/40',
    'bg-[#0f172a]/60': 'bg-white/60 dark:bg-[#0f172a]/60',
    'bg-[#0f172a]/80': 'bg-white/80 dark:bg-[#0f172a]/80',
    'bg-[#0f172a]/50': 'bg-white/50 dark:bg-[#0f172a]/50',
    'bg-slate-900/40': 'bg-white/40 dark:bg-slate-900/40',
    'bg-slate-900/50': 'bg-white/50 dark:bg-slate-900/50',
    'bg-slate-900/60': 'bg-white/60 dark:bg-slate-900/60',
    'bg-slate-900/80': 'bg-white/80 dark:bg-slate-900/80',
    'bg-slate-800/20': 'bg-slate-200/40 dark:bg-slate-800/20',
    'bg-slate-800/40': 'bg-slate-200/60 dark:bg-slate-800/40',
    'bg-slate-800/50': 'bg-slate-200/50 dark:bg-slate-800/50',
    'bg-slate-800/60': 'bg-slate-200/60 dark:bg-slate-800/60',
    'bg-slate-800/80': 'bg-slate-200/80 dark:bg-slate-800/80',
    'bg-slate-700/50': 'bg-slate-300/50 dark:bg-slate-700/50',
    'text-slate-100': 'text-slate-900 dark:text-slate-100',
    'text-slate-200': 'text-slate-800 dark:text-slate-200',
    'text-slate-300': 'text-slate-700 dark:text-slate-300',
    'text-slate-400': 'text-slate-600 dark:text-slate-400',
    'text-slate-500': 'text-slate-500 dark:text-slate-500',
    'text-white': 'text-slate-900 dark:text-white',
    // hover states
    'hover:bg-slate-800': 'hover:bg-slate-200 dark:hover:bg-slate-800',
    'hover:bg-slate-700': 'hover:bg-slate-200 dark:hover:bg-slate-700',
    'hover:bg-slate-800/60': 'hover:bg-slate-200/60 dark:hover:bg-slate-800/60',
    'hover:bg-slate-800/80': 'hover:bg-slate-200/80 dark:hover:bg-slate-800/80',
    'hover:text-white': 'hover:text-slate-900 dark:hover:text-white',
    'hover:text-slate-100': 'hover:text-slate-900 dark:hover:text-slate-100',
    'hover:text-slate-200': 'hover:text-slate-800 dark:hover:text-slate-200',
    'hover:text-slate-300': 'hover:text-slate-700 dark:hover:text-slate-300',
    'border-slate-800': 'border-slate-200 dark:border-slate-800',
    'border-slate-700': 'border-slate-300 dark:border-slate-700',
    'border-slate-800/40': 'border-slate-200/60 dark:border-slate-800/40',
    'border-slate-800/50': 'border-slate-200/80 dark:border-slate-800/50',
    'border-slate-800/60': 'border-slate-200 dark:border-slate-800/60',
    'border-slate-800/80': 'border-slate-300 dark:border-slate-800/80',
    'from-[#020617]': 'from-slate-50 dark:from-[#020617]',
    'from-slate-900': 'from-white dark:from-slate-900',
    'from-[#0f172a]': 'from-white dark:from-[#0f172a]',
    'to-slate-950': 'to-slate-100 dark:to-slate-950',
    'to-slate-900': 'to-slate-50 dark:to-slate-900',
    'via-slate-900': 'via-white dark:via-slate-900',
    'shadow-black/60': 'shadow-slate-300/60 dark:shadow-black/60',
    'border-[#0f172a]': 'border-white dark:border-[#0f172a]',
    'border-[#020617]': 'border-slate-50 dark:border-[#020617]',
};

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const keys = Object.keys(classMap).sort((a, b) => b.length - a.length);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    keys.forEach(k => {
        const escaped = escapeRegExp(k);
        let regexStr = `(?<!dark:)(?<!hover:)(?<!group-hover:)\\b${escaped}(?!/|-)`;
        if(k.includes('[')) {
            regexStr = `(?<!dark:)(?<!hover:)(?<!group-hover:)${escaped}(?!/|-)`;
        }
        const regex = new RegExp(regexStr, 'g');
        content = content.replace(regex, classMap[k]);
    });

    content = content.replace(/hover:hover:/g, 'hover:');
    
    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${path.basename(file)}`);
    }
});
