const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'main.css');

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace standard green with Twitter Blue
    content = content.replace(/#5CB85C/gi, '#1d9bf0');
    content = content.replace(/#5cb85c/gi, '#1d9bf0');

    // Replace darker green (hover) with Darker Blue
    content = content.replace(/#3d8b3d/gi, '#1a8cd8');

    // Replace any other potential greens if found (approximate)
    // content = content.replace(/green/gi, '#1d9bf0'); // Too risky

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully replaced colors in main.css');
} catch (err) {
    console.error('Error processing file:', err);
}
