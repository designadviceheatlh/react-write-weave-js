
# Como publicar este pacote no NPM

Siga os passos abaixo para publicar este componente como um pacote no NPM:

1. Certifique-se de ter uma conta no NPM (https://www.npmjs.com/signup)

2. Faça login na sua conta NPM via terminal:
   ```
   npm login
   ```

3. Prepare o pacote para publicação:
   - Verifique se o nome em `package-editor.json` está disponível e é único
   - Atualize o campo "author" com seu nome
   - Certifique-se que a versão está correta (inicie com 0.1.0)

4. Crie um arquivo package.json baseado no package-editor.json:
   ```
   cp package-editor.json package.json
   ```

5. Instale as dependências de desenvolvimento necessárias:
   ```
   npm install --save-dev @rollup/plugin-commonjs @rollup/plugin-node-resolve @rollup/plugin-typescript rollup rollup-plugin-peer-deps-external rollup-plugin-postcss typescript
   ```

6. Execute o build do pacote:
   ```
   npm run build
   ```

7. Teste o pacote localmente (opcional mas recomendado):
   ```
   npm link
   ```
   E então em um projeto de teste:
   ```
   npm link react-text-editor-component
   ```

8. Quando estiver tudo pronto, publique o pacote:
   ```
   npm publish
   ```

9. Para atualizações futuras:
   - Atualize a versão no package.json seguindo o versionamento semântico
   - Execute o build
   - Publique novamente

## Notas importantes

- Siga o versionamento semântico (MAJOR.MINOR.PATCH):
  - MAJOR: mudanças incompatíveis com versões anteriores
  - MINOR: funcionalidades novas compatíveis com versões anteriores
  - PATCH: correções de bugs compatíveis com versões anteriores

- Para testar mudanças antes de publicar oficialmente, você pode usar uma tag beta:
  ```
  npm publish --tag beta
  ```

- Certifique-se que a qualidade do código está boa e os testes estão passando antes de publicar
