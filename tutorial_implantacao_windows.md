# Tutorial de Implantação do Tokyo Edge Roleplay em Windows Server

## 1. Configuração Inicial do Windows Server

### Instalação do Node.js:
1. Baixe o instalador do Node.js 20.x no [site oficial](https://nodejs.org/en/download/)
2. Execute o instalador e siga as instruções
3. Verifique a instalação abrindo o PowerShell e digitando:
   ```powershell
   node -v
   npm -v
   ```

### Instalação do PostgreSQL:
1. Baixe o instalador do PostgreSQL no [site oficial](https://www.postgresql.org/download/windows/)
2. Execute o instalador e siga as instruções
3. Durante a instalação:
   - Defina uma senha para o usuário postgres
   - Mantenha a porta padrão (5432)
   - Selecione todos os componentes

4. Após a instalação, abra o "pgAdmin" (instalado com o PostgreSQL)
5. Crie um novo banco de dados:
   - Clique com o botão direito em "Databases" e selecione "Create" > "Database..."
   - Nome: `tokyoedgerp`
   - Clique em "Save"
   
6. Crie um novo usuário:
   - Expanda "Login/Group Roles"
   - Clique com o botão direito e selecione "Create" > "Login/Group Role..."
   - Na aba "General", defina o nome como `tokyoedge`
   - Na aba "Definition", defina uma senha
   - Na aba "Privileges", marque todas as opções
   - Clique em "Save"

7. Conceda permissões ao usuário:
   - Clique com o botão direito no banco de dados `tokyoedgerp`
   - Selecione "Properties"
   - Na aba "Security", adicione o usuário `tokyoedge` com todos os privilégios

## 2. Implantação do Código

### Instalação do Git (se ainda não estiver instalado):
1. Baixe o instalador do Git no [site oficial](https://git-scm.com/download/win)
2. Execute o instalador e siga as instruções

### Clonar o Repositório (ou Copiar os Arquivos):
```powershell
# Crie um diretório para o projeto
mkdir C:\TokyoEdgeRP
cd C:\TokyoEdgeRP

# Clone o repositório (ou copie os arquivos manualmente)
git clone [seu-repositorio] .
```

### Configuração do Projeto:
```powershell
# Instale as dependências
npm install

# Crie o arquivo .env
@"
DATABASE_URL=postgresql://tokyoedge:sua_senha@localhost:5432/tokyoedgerp
DISCORD_CLIENT_ID=seu_client_id
DISCORD_CLIENT_SECRET=seu_client_secret
SESSION_SECRET=uma_string_secreta_aleatoria
"@ | Out-File -FilePath .env -Encoding utf8

# Execute a migração do banco de dados
npm run db:push

# Construa o aplicativo
npm run build
```

## 3. Configuração para Execução Permanente

### Instalação do PM2:
```powershell
# Instale o PM2 globalmente
npm install -g pm2 pm2-windows-startup

# Configure o PM2 para iniciar com o Windows
pm2-startup install

# Inicie a aplicação com PM2
pm2 start npm --name "tokyoedgerp" -- run start

# Salve a configuração atual
pm2 save
```

## 4. Configuração do IIS para Proxy Reverso

### Instalação do IIS:
1. Abra o "Painel de Controle" > "Programas" > "Programas e Recursos"
2. Clique em "Ativar ou desativar recursos do Windows"
3. Marque "Internet Information Services" e expanda-o
4. Certifique-se de que "Ferramentas de Gerenciamento da Web" e "Serviços da World Wide Web" estejam selecionados
5. Clique em "OK"

### Instalação do URL Rewrite:
1. Baixe e instale o [URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)

### Configuração do Site no IIS:
1. Abra o "Gerenciador do IIS"
2. Clique com o botão direito em "Sites" e selecione "Adicionar site..."
3. Configure:
   - Nome do site: `TokyoEdgeRP`
   - Caminho físico: `C:\inetpub\wwwroot\TokyoEdgeRP` (crie essa pasta)
   - Endereço IP: `Todos não atribuídos`
   - Porta: `80`
   - Nome do host: deixe em branco ou configure seu domínio
4. Clique em "OK"

### Configuração do URL Rewrite para Proxy Reverso:
1. Selecione o site criado
2. Abra "URL Rewrite"
3. Clique em "Adicionar regra..." > "Regra em branco"
4. Configure:
   - Nome: `Proxy para Node.js`
   - Padrão: `(.*)`
   - Ação: `Rewrite`
   - URL de rewrite: `http://localhost:5000/{R:1}`
5. Clique em "Aplicar"

## 5. Configuração do Firewall do Windows

1. Abra o "Painel de Controle" > "Sistema e Segurança" > "Firewall do Windows Defender"
2. Clique em "Configurações avançadas"
3. Clique em "Regras de Entrada" > "Nova Regra..."
4. Selecione "Porta", clique em "Avançar"
5. Selecione "TCP" e digite "80" para a porta, clique em "Avançar"
6. Selecione "Permitir a conexão", clique em "Avançar"
7. Marque todas as opções, clique em "Avançar"
8. Digite um nome para a regra (ex: "HTTP"), clique em "Concluir"
9. Repita o processo para a porta 5000 se quiser acessar diretamente a aplicação Node.js

## Configuração do Discord OAuth2

Para configurar corretamente o Discord OAuth2 para funcionar em sua VPS Windows:

1. Acesse o [Portal de Desenvolvedor do Discord](https://discord.com/developers/applications)
2. Selecione sua aplicação "Tokyo Edge Roleplay"
3. No menu lateral, clique em "OAuth2"
4. Na seção "Redirects", adicione a seguinte URL:
   ```
   http://45.89.30.198/api/auth/discord/callback
   ```
   (Se você planeja usar um nome de domínio, adicione-o também)

## Manutenção do Servidor

Para gerenciar sua aplicação:

1. **Visualizar logs**:
   ```powershell
   pm2 logs
   ```

2. **Reiniciar a aplicação**:
   ```powershell
   pm2 restart tokyoedgerp
   ```

3. **Atualizar o código**:
   ```powershell
   cd C:\TokyoEdgeRP
   git pull
   npm install
   npm run build
   pm2 restart tokyoedgerp
   ```

## Configuração de Backup

Para criar backups regulares do banco de dados:

1. Crie um arquivo de script PowerShell `backup-db.ps1`:

```powershell
# Crie um arquivo chamado backup-db.ps1 em C:\TokyoEdgeRP
@"
`$BackupDir = "C:\Backups\TokyoEdgeRP"
`$Date = Get-Date -Format "yyyyMMdd_HHmmss"
`$FileName = "tokyoedgerp_`$Date.sql"

if (-not (Test-Path `$BackupDir)) {
    New-Item -ItemType Directory -Path `$BackupDir
}

# Caminho do pg_dump.exe (ajuste conforme a sua instalação)
`$PgDumpPath = "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe"

# Execute o backup
& `$PgDumpPath -U tokyoedge -d tokyoedgerp -f "`$BackupDir\`$FileName"

# Remova backups com mais de 7 dias
Get-ChildItem -Path `$BackupDir -File | Where-Object { `$_.LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item
"@ | Out-File -FilePath C:\TokyoEdgeRP\backup-db.ps1 -Encoding utf8
```

2. Configure uma Tarefa Agendada:
   - Abra o "Agendador de Tarefas"
   - Clique em "Criar Tarefa Básica..."
   - Dê um nome como "Backup Tokyo Edge RP"
   - Selecione a frequência diária
   - Configure para 2:00 AM
   - Selecione "Iniciar um programa"
   - Escolha o PowerShell e adicione o caminho ao script como argumento:
     ```
     Program: powershell.exe
     Arguments: -ExecutionPolicy Bypass -File "C:\TokyoEdgeRP\backup-db.ps1"
     ```
   - Conclua o assistente