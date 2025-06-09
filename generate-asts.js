const fs = require('fs');
const path = require('path');
const glob = require('fast-glob');
const parser = require('@babel/parser');

// Babel parser options
const parseOptions = {
  sourceType: 'module',
  plugins: [
    'jsx',
    'typescript',
    'classProperties',
    'objectRestSpread',
    'optionalChaining',
    'decorators-legacy',
    'dynamicImport',
    'nullishCoalescingOperator',
  ],
};

const OUTPUT_DIR = path.resolve(process.cwd(), 'asts');

async function generateASTs(projectDir) {
  const pattern = `${projectDir}/**/*.{js,ts,jsx,tsx}`;
  const files = await glob(pattern, {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/asts/**'],
  });

  for (const file of files) {
    try {
      const code = fs.readFileSync(file, 'utf8');
      const ast = parser.parse(code, parseOptions);

      // Compute relative path and output location
      const relativePath = path.relative(projectDir, file);
      const outputFilePath = path.join(OUTPUT_DIR, relativePath + '.ast.json');

      // Ensure the output directory exists
      fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });

      // Write AST to file
      fs.writeFileSync(outputFilePath, JSON.stringify(ast, null, 2));
      console.log(`✅ AST saved: ${outputFilePath}`);
    } catch (err) {
      console.warn(`❌ Error parsing ${file}: ${err.message}`);
    }
  }
}

generateASTs(process.cwd());
