const fs = require('fs');
let code = fs.readFileSync('routes/auth.js', 'utf8');
code = code.replace("const { encrypt } = require('../utils/encryption');", "const { encrypt } = require('../utils/encryption');\nconst auth = require('../middleware/auth');");
code = code.replace("return next(e);", "return next(new Error('FRONTEND_URL not defined'));");
fs.writeFileSync('routes/auth.js', code);
console.log('Auth fixed');
