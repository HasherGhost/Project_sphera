const fs = require('fs');
const path = require('path');

const dir = './';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');

    // 1. Remove the old head IIFE theme setter
    content = content.replace(/\(function\s*\(\)\s*\{\s*try\s*\{\s*var\s*t\s*=\s*localStorage\.getItem\('su-theme'(?:[\s\S]*?\}\)\(\);)/g, '');

    // 2. Inject <script src="theme.js"></script> before </head> if not exists
    if (!content.includes('src="theme.js"')) {
        content = content.replace('</head>', '    <script src="theme.js"></script>\n</head>');
    }

    // 3. Remove inline theme logic blocks based on known comment blocks
    // Covers `/* ── Theme ── */` and the UTF-8 glitched versions `/* Ã¢â€ â‚¬Ã¢â€ â‚¬ Theme Ã¢â€ â‚¬Ã¢â€ â‚¬ */`
    content = content.replace(/\/\*[\s\S]*?Theme[\s\S]*?\*\/[\s\S]*?(?=(\/\*|<\/script>))/gi, (match) => {
        // Double check it's definitely the theme block so we don't over-delete
        if(match.includes('themeKey') || match.includes('toggleTheme') || match.includes('applyTheme') || match.includes('data-theme')) {
            return '';
        }
        return match;
    });

    // 4. For feed.html which has a plain `function toggleTheme()` block
    content = content.replace(/function toggleTheme\(\)\s*\{[\s\S]*?html\.setAttribute\('data-theme', newTheme\);[\s\S]*?\}\s*(<\/script>)?/g, (m, p1) => {
        return p1 ? p1 : ''; // preserve </script> if it was matched
    });

    fs.writeFileSync(path.join(dir, file), content, 'utf8');
    console.log(`Processed ${file}`);
});
