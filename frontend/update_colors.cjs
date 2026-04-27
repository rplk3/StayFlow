const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const newColors = `/* ───────── Global Color System ───────── */
const C = {
    // Semantic Tokens
    primary: '#0F2D52', action: '#1D6FE8', accent: '#F59E0B', 
    success: '#16A34A', alert: '#C0392B', bg: '#F4F6F9', 
    card: '#FFFFFF', text: '#1A1A2E',
    
    // Legacy mapping to prevent breakages
    900: '#0F2D52', 800: '#0F2D52', 700: '#0F2D52', 600: '#1D6FE8',
    500: '#1D6FE8', 400: '#1D6FE8', 300: '#60A5FA', 200: '#BFDBFE',
    100: '#DBEAFE', 50: '#F0F9FF',
};`;

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    if (content.includes('const C = {') && !content.includes('Global Color System')) {
        content = content.replace(/\/\* ───────── Color palette.*?\};\r?\n/s, newColors + '\n');
        content = content.replace(/const C = \{\s*900: '#012A4A'.*?\};\r?\n/s, newColors + '\n');
        changed = true;
    }
    
    // Update the checkmark color from gray to blue in checkout steps
    // "Completed checkout steps should show a blue checkmark circle, not a grey one"
    if (content.includes('step >= s.num ? \'text-white shadow-lg\' : \'bg-gray-200 text-gray-500\'')) {
        // Wait, the active/completed checkmark already has 'bg-gradient-to-r' with C[700] and C[500].
        // If it's step > s.num, maybe it's using grey?
        // In Checkout.jsx:
        // style={step >= s.num ? { background: \`linear-gradient(135deg, \${C[700]}, \${C[500]})\`, boxShadow: \`0 4px 14px \${C[500]}44\` } : {}}
        // The checkmark is inside a div.
    }
    
    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log('Updated:', filePath);
    }
  }
});
