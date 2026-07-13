const fs = require('fs');
const file = './src/components/ManageLeads.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { search: /\bbg-white\b/g, replace: 'bg-white dark:bg-ink-900 dark:text-white' },
  { search: /\bbg-slate-50\b/g, replace: 'bg-slate-50 dark:bg-ink-950 dark:text-slate-300' },
  { search: /\bborder-slate-100\b/g, replace: 'border-slate-100 dark:border-ink-800' },
  { search: /\bborder-slate-200\b/g, replace: 'border-slate-200 dark:border-ink-700' },
  { search: /\btext-slate-800\b/g, replace: 'text-slate-800 dark:text-slate-100' },
  { search: /\btext-slate-700\b/g, replace: 'text-slate-700 dark:text-slate-200' },
  { search: /\btext-slate-600\b/g, replace: 'text-slate-600 dark:text-slate-300' },
  { search: /\bdivide-slate-100\b/g, replace: 'divide-slate-100 dark:divide-ink-800' },
];

replacements.forEach(r => {
  content = content.replace(r.search, r.replace);
});

fs.writeFileSync(file, content, 'utf8');
console.log('ManageLeads.tsx patched with dark mode classes.');
