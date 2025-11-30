const fs = require('fs');
const path = require('path');

const colorReplacements = {
    '#5cb85c': '#000000',
    '#4a9d4a': '#333333',
    '#6cc76c': '#000000',
    '#7cb342': '#000000',
    '#9ccc65': '#cccccc',
    '#f0f8f0': '#f4f4f4',
    '#1a2a1a': '#1a1a1a',
    'rgba(92, 184, 92': 'rgba(0, 0, 0',
    'rgba(92,184,92': 'rgba(0,0,0'
};

function replaceInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        for (const [oldColor, newColor] of Object.entries(colorReplacements)) {
            if (content.includes(oldColor)) {
                content = content.split(oldColor).join(newColor);
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${path.basename(filePath)}`);
            return 1;
        }
        return 0;
    } catch (err) {
        console.error(`❌ Error processing ${filePath}:`, err.message);
        return 0;
    }
}

function processDirectory(dir) {
    let count = 0;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            count += processDirectory(filePath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            count += replaceInFile(filePath);
        }
    }

    return count;
}

const componentsDir = path.join(__dirname, 'src', 'components');
console.log('🔄 Replacing all green colors with black/white...\n');
const filesModified = processDirectory(componentsDir);
console.log(`\n✨ Done! Modified ${filesModified} files.`);
