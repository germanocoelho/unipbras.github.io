// uso: node cifra.js entrada.json saida.enc.json "senha"
const crypto=require('crypto'),fs=require('fs');
const [,,ent,sai,senha]=process.argv;
const sal=crypto.randomBytes(16),iv=crypto.randomBytes(12),it=600000;
const chave=crypto.pbkdf2Sync(senha,sal,it,32,'sha256');
const c=crypto.createCipheriv('aes-256-gcm',chave,iv);
const dados=Buffer.concat([c.update(fs.readFileSync(ent)),c.final(),c.getAuthTag()]);
fs.writeFileSync(sai,JSON.stringify({v:1,alg:'AES-256-GCM',kdf:'PBKDF2-SHA256',it,sal:sal.toString('base64'),iv:iv.toString('base64'),dados:dados.toString('base64')}));
