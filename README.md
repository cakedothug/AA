# Tokyo Edge Roleplay

Um servidor de roleplay brasileiro moderno e imersivo.

## 📋 Visão Geral
Sistema completo de gestão para servidor de roleplay desenvolvido com React, Express e MySQL. O projeto possui área administrativa, sistema de notícias, aplicações para staff e gerenciamento de usuários.

## 🛠️ Tecnologias Principais
- Frontend: React + TypeScript + Vite
- Backend: Express + TypeScript
- Banco de Dados: MySQL
- Estilização: TailwindCSS + shadcn/ui
- Autenticação: Passport.js
- Gerenciamento de Estado: TanStack Query

## 📁 Estrutura do Projeto
```
├── client/            # Frontend React
│   ├── src/          
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── hooks/      # Custom hooks React
│   │   ├── lib/        # Utilitários e configurações
│   │   └── pages/      # Páginas da aplicação
├── server/           # Backend Express
│   ├── db-init.ts    # Inicialização do banco
│   ├── mysql.ts      # Configuração MySQL
│   ├── routes.ts     # Rotas da API
│   └── storage.ts    # Camada de acesso aos dados
```

## 🚀 Como Executar

1. Instale as dependências:
```bash
npm install
```

2. Configure o banco MySQL:
- Host: localhost
- Usuário: root
- Senha: 123123
- Banco: thuglife
- Porta: 3306

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 🔑 Credenciais Padrão
- **Admin**
  - Usuário: thuglife
  - Senha: thuglife

## 📦 Principais Funcionalidades

### Área Pública
- Landing page com informações do servidor
- Sistema de notícias
- Formulário de aplicação para staff
- Página da equipe
- Estatísticas do servidor

### Área Administrativa
- Dashboard com métricas
- Gerenciamento de notícias
- Análise de aplicações para staff
- Configurações do servidor
- Gestão de usuários

## 🔄 Workflows
- `Start Dev Server`: Inicia o ambiente de desenvolvimento
- `Start application`: Executa a aplicação em produção

## 📝 Variáveis de Ambiente
O projeto utiliza as seguintes configurações de banco:
```
DB_HOST=localhost
DB_USER=root
DB_PASS=123123
DB_NAME=thuglife
DB_PORT=3306
```

## 🛣️ Principais Rotas

### API
- `/api/auth/*` - Autenticação
- `/api/news/*` - Sistema de notícias
- `/api/applications/*` - Gestão de aplicações
- `/api/admin/*` - Rotas administrativas

### Frontend
- `/` - Home
- `/news` - Notícias
- `/team` - Equipe
- `/application` - Formulário de aplicação
- `/admin/*` - Painel administrativo

## ⚙️ Configuração de Produção
O projeto está configurado para deploy automático no Replit, utilizando:
- Build: `npm run build`
- Start: `NODE_ENV=production node dist/server/index.js`

## 🤝 Contribuição
1. Mantenha o padrão de código TypeScript
2. Siga as convenções de commits
3. Teste todas as alterações localmente
4. Documente novas funcionalidades

## 🔒 Segurança
- Todas as senhas são hasheadas com bcrypt
- Sessões são gerenciadas com express-session
- Proteção CSRF implementada
- Validação de dados com Zod

## 📞 Suporte
Para suporte técnico ou dúvidas, acesse o Discord: https://discord.gg/NZAAaAmQtC
# AA