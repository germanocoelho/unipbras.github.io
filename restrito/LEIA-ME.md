# Área restrita da UNIPBRAS

`dados.enc.json` guarda os dados sensíveis (povo dos dirigentes, contatos pessoais,
pendências internas) **criptografados** com AES-256-GCM. A chave é derivada da senha da
área administrativa (PBKDF2-SHA256, 310 mil iterações). Sem a senha, o arquivo é ilegível,
mesmo estando neste repositório público.

Para atualizar: decifre na área administrativa do site (botão "⚙ ADM" → "Exportar dados"),
edite o JSON e gere o arquivo de novo com:

    node restrito/cifra.js dados.json restrito/dados.enc.json "SENHA"

Nunca salve o JSON decifrado neste repositório.
