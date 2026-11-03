import { readFile } from 'node:fs/promises'

for (const name of ['clinic', 'architecture', 'restaurant']) {
  const file = new URL(`../src/assets/demo-images/${name}.svg`, import.meta.url)
  const content = await readFile(file, 'utf8')
  if (content.includes('git-lfs.github.com/spec/v1') || !content.startsWith('<svg ') || !content.includes('data:image/jpeg;base64,')) {
    throw new Error(`Imagem ${name} inválida. Copie o arquivo SVG completo do projeto; referências Git LFS não podem ser usadas no deploy.`)
  }
}
console.log('Imagens das demonstrações verificadas: arquivos completos, sem referências Git LFS.')

// Marca e capas distribuídas no código não podem ser ponteiros Git LFS.
for (const file of ['public/brand/eric-y-ikeda.png', 'public/projects/webshop-logo.png', 'public/projects/delivery-hero.jpg']) {
  const { readFile: readAsset } = await import('node:fs/promises');
  const bytes = await readAsset(file);
  if (bytes.length < 1000 || bytes.subarray(0, 100).toString().includes('git-lfs.github.com/spec')) throw new Error(`Ativo incompleto: ${file}`);
}
