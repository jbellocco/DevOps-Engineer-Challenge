const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando compilación...');

// Verificar si existe la carpeta dist
if (fs.existsSync('./dist')) {
  console.log('✅ Carpeta dist existe');
  
  // Listar archivos en dist
  const files = fs.readdirSync('./dist', { recursive: true });
  console.log('📁 Archivos compilados:');
  files.forEach(file => console.log(`  - ${file}`));
  
  // Verificar archivo principal
  if (fs.existsSync('./dist/index.js')) {
    console.log('✅ index.js compilado correctamente');
  } else {
    console.log('❌ index.js no encontrado');
  }
} else {
  console.log('❌ Carpeta dist no existe - compilación falló');
}

// Verificar package.json
if (fs.existsSync('./package.json')) {
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  console.log(`📦 App: ${pkg.name} v${pkg.version}`);
}
