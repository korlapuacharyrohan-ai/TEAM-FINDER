const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'BACKEND', 'teamfinder-backend', 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

for (const file of files) {
  let content = fs.readFileSync(path.join(routesDir, file), 'utf8');
  
  // Update signature to include next, if not already
  content = content.replace(/async \(\s*req\s*,\s*res\s*\)\s*=>/g, 'async (req, res, next) =>');

  // Regex to match: catch (errorVar) { ... res.status(500|503).json(...) ... }
  // We want to replace res.status(xxx).json(...) with next(errorVar);
  
  content = content.replace(/catch\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*\{([\s\S]*?)res\.status\((?:500|503)\)\.json\([^)]*\);?\s*\}/g, (match, errName, inside) => {
    return `catch (${errName}) {${inside}next(${errName});\n  }`;
  });

  fs.writeFileSync(path.join(routesDir, file), content);
}
console.log('Routes fixed.');
