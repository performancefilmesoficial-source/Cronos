---
description: Deploy automático de app na VPS via Coolify com configuração de DNS na Hostinger
---

# Deploy Automático com Coolify e DNS Manual
Este workflow automatiza o deploy de aplicações web em uma VPS usando o Coolify, com a configuração de DNS sendo feita manualmente na Hostinger.

## ✅ Pré-requisitos
- Repositório GitHub remoto atualizado.
- **Dockerfile** na raiz do projeto ou subpasta.
- IP da VPS e UUIDs do Servidor/Projeto Coolify (o Antigravity buscará isso via MCP).

## 🚀 Passos do Workflow

### 1. Sincronização com GitHub
// turbo
Garantir que o código local está no GitHub.
```powershell
git add .
git commit -m "Preparando para deploy"
git push origin main
```
### 2. Criar Aplicação no Coolify
Se for um novo app:
1. O Antigravity usará `coolify-mcp_application` com `action='create_github'`.
2. Configuração: `build_pack='dockerfile'`, `ports_exposes='80'`.

### 3. Deploy Inicial
1. O Antigravity iniciará o deploy com `coolify-mcp_deploy`.
2. Monitoramento via `coolify-mcp_deployment` até o status `finished`.

### 4. Configurar DNS Manual (Hostinger)
**Ação do Usuário:**
Como o MCP da Hostinger não está disponível, você deve:
1. Acessar o Painel da Hostinger -> DNS / Nameservers.
2. Criar um **Registro tipo A**.
3. **Nome**: O subdomínio (ex: `app`) ou `@` para o domínio principal.
4. **Aponta para (IP)**: O IP da sua VPS (o Antigravity informará qual é).

### 5. Configurar Domínio e SSL no Coolify
1. O Antigravity **DEVE** tentar atualizar o campo `fqdn` automaticamente via `coolify-mcp_application`.
2. **Fallback Proativo**: Se a atualização automática via MCP falhar (ex: erro de validação), o Antigravity deve avisar o usuário imediatamente e fornecer o link direto para a página de configuração do App no Coolify: `https://[IP-DA-VPS]:8000/project/[PROJECT-UUID]/environment/[ENV-NAME]/application/[APP-UUID]#configuration`.
3. **Ação Manual**: No campo **Domains**, cole a URL completa com HTTPS (ex: `https://seu-dominio.com`), clique em **Save** e em seguida em **Redeploy**.
## 🏁 Validação
1. Acesse a URL final com HTTPS e confirme se o site está online.