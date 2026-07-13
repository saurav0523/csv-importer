const fs = require('fs');
const file = './src/components/ImportModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { search: /bg-white/g, replace: 'bg-white dark:bg-ink-900 dark:text-white' },
  { search: /bg-slate-50\b/g, replace: 'bg-slate-50 dark:bg-ink-950 dark:text-slate-300' },
  { search: /bg-slate-100\b/g, replace: 'bg-slate-100 dark:bg-ink-800' },
  { search: /border-slate-100/g, replace: 'border-slate-100 dark:border-ink-800' },
  { search: /border-slate-200/g, replace: 'border-slate-200 dark:border-ink-700' },
  { search: /text-slate-800/g, replace: 'text-slate-800 dark:text-slate-100' },
  { search: /text-slate-700/g, replace: 'text-slate-700 dark:text-slate-200' },
  { search: /text-slate-600/g, replace: 'text-slate-600 dark:text-slate-300' },
];

replacements.forEach(r => {
  content = content.replace(r.search, r.replace);
});

// Fix duplicate text colors from the blind replace
content = content.replace(/dark:text-white dark:text-white/g, 'dark:text-white');

fs.writeFileSync(file, content, 'utf8');
console.log('ImportModal patched for dark mode.');
