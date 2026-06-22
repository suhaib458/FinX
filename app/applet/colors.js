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
const counts = {};

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const rx = new RegExp("(?:bg-|text-|border-|shadow-|from-|to-|via-|ring-|fill-|stroke-)(?:slate|indigo|blue|emerald|rose|purple|teal|cyan|gray|zinc|neutral|amber|orange|red|yellow|green|sky|fuchsia|pink|white|black)(?:-\\\\d+)?(?:/[0-9]+)?", "g");
    const matches = content.match(rx);
    if (matches) {
        matches.forEach(m => {
            counts[m] = (counts[m] || 0) + 1;
        });
    }
});

const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
console.log(sorted.slice(0, 30).map(x => `${x[0]}: ${x[1]}`).join('\n'));
