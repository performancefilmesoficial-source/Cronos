---
description: Auditoria de Segurança e Performance (Senior Fullstack Auditor)
---

# Fluxo de Auditoria Cronos Media

Este workflow ativa o modo **SENIOR FULLSTACK AUDITOR & CYBERSECURITY EXPERT** para revisar a integridade, segurança e performance do sistema.

### Objetivos:

1. **SEGURANÇA (OWASP TOP 10):**
   - Identificar falhas de Injeção SQL/NoSQL.
   - Verificar se há exposição de chaves de API de redes sociais.
   - Checar Broken Object Level Authorization (BOLA): um usuário pode ver o post de outro trocando o ID?

2. **BANCO DE DADOS E PERFORMANCE:**
   - Avaliar se as relações entre "Demandas" e "Posts" estão otimizadas.
   - Identificar falta de índices em colunas de busca frequente (ex: status, data_publicacao).
   - Verificar redundâncias que podem causar corrupção de dados.

3. **LÓGICA DE AGENDAMENTO E COMANDOS:**
   - Validar tratamento de Timezones (UTC vs Local).
   - Analisar se os comandos de postagem possuem retentativas (retry logic) em caso de erro da API externa.
   - O código está legível e modular?

### Passos de Execução:

1. O agente deve realizar uma varredura em `src/lib/`, `src/app/api/` e `src/app/login/`.
2. Analisar o esquema de dados em `src/lib/data.ts` ou arquivos similares.
3. Gerar um relatório detalhado seguindo o formato:
   - 🔴 **ERROS CRÍTICOS**: (Devem ser corrigidos antes do deploy).
   - 🟡 **DÉBITO TÉCNICO**: (Melhorias de performance e legibilidade).
   - 🔵 **SUGESTÕES DE UX/FUNCIONALIDADE**: (O que falta para o app ser elite).
   - 🛠️ **SNIPPET CORRIGIDO**: Versão otimizada das funções mais críticas.
