const fs = require('fs');
const path = require('path');
const srcDir = path.join(process.cwd(), 'src');

function getFiles(dir) {
    let files = [];
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

// Mapping of dark classes to their light mode equivalent + dark mode version
// example: "bg-slate-900" -> "bg-white dark:bg-slate-900"
const classMap = {
    'bg-[#020617]': 'bg-slate-50 dark:bg-[#020617]',
    'bg-[#0f172a]': 'bg-white dark:bg-[#0f172a]',
    'bg-slate-900': 'bg-white dark:bg-slate-900',
    'bg-slate-800': 'bg-slate-100 dark:bg-slate-800',
    'bg-slate-700': 'bg-slate-200 dark:bg-slate-700',
    'bg-slate-900/40': 'bg-white/40 dark:bg-slate-900/40',
    'bg-slate-900/60': 'bg-white/60 dark:bg-slate-900/60',
    'bg-slate-900/80': 'bg-white/80 dark:bg-slate-900/80',
    'bg-slate-800/20': 'bg-slate-100/40 dark:bg-slate-800/20',
    'bg-slate-800/40': 'bg-slate-100/60 dark:bg-slate-800/40',
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
    'hover:bg-slate-700': 'hover:bg-slate-300 dark:hover:bg-slate-700',
    'hover:bg-slate-800/60': 'hover:bg-slate-200/60 dark:hover:bg-slate-800/60',
    'hover:text-white': 'hover:text-slate-900 dark:hover:text-white',
    'hover:text-slate-200': 'hover:text-slate-800 dark:hover:text-slate-200',
    'hover:text-slate-300': 'hover:text-slate-700 dark:hover:text-slate-300',
    'border-slate-800': 'border-slate-200 dark:border-slate-800',
    'border-slate-700': 'border-slate-300 dark:border-slate-700',
    'border-slate-800/40': 'border-slate-200/60 dark:border-slate-800/40',
    'border-slate-800/50': 'border-slate-200/80 dark:border-slate-800/50',
    'border-slate-800/60': 'border-slate-200 dark:border-slate-800/60',
    'border-slate-800/80': 'border-slate-300 dark:border-slate-800/80',
    'from-[#020617]': 'from-slate-50 dark:from-[#020617]',
    'to-slate-950': 'to-slate-100 dark:to-slate-950',
    'via-slate-900': 'via-white dark:via-slate-900',
    'shadow-black/60': 'shadow-slate-200 dark:shadow-black/60',
    'border-[#0f172a]': 'border-white dark:border-[#0f172a]',
    'border-[#020617]': 'border-slate-50 dark:border-[#020617]',
};

// Also let's sort keys by length descending to replace "bg-slate-900/40" before "bg-slate-900"
const keys = Object.keys(classMap).sort((a, b) => b.length - a.length);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Use a function to ensure we don't replace things that already have `dark:` in front of them
    keys.forEach(k => {
        // Regex: look behind to ensure NO "dark:" immediately precedes it
        // and it's surrounded by word boundaries or quotes/spaces
        // actually javascript regex without lookbehind for "dark:"
        // `(?:(?<!dark:)${escapeRegExp(k)})`
        const escapedK = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const rx = new RegExp(`(?<!dark:)(?<!bg-)(?<!text-)\\b${escapedK}(?!\\/[0-9])\\b`, 'g');
        content = content.replace(rx, classMap[k]);
    });

    // some custom fix for [#020617] that lack word boundary because of bracket
    keys.forEach(k => {
        if(k.includes('[')) {
            const escapedK = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const rx = new RegExp(`(?<!dark:)\\b${escapedK}`, 'g');
            content = content.replace(rx, classMap[k]);
        }
    });

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${path.basename(file)}`);
    }
});
