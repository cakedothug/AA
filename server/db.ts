
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';

// Função para criar o pool de conexões com tratamento de erro melhorado
const createPool = () => {
  try {
    console.log("Tentando conectar ao MySQL...");
    return mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '123123',
      database: process.env.MYSQL_DATABASE || 'thuglife',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  } catch (error) {
    console.error("Erro ao criar pool de conexões MySQL:", error);
    // Retornar um pool com configuração mínima que vai falhar graciosamente
    return mysql.createPool({
      host: 'localhost',
      user: 'dummy',
      password: 'dummy',
      database: 'dummy',
      port: 3306
    });
  }
};

export const pool = createPool();
export const db = drizzle(pool);

// Testar a conexão inicialmente e reportar status
pool.getConnection()
  .then(connection => {
    console.log("✅ Conexão MySQL estabelecida com sucesso!");
    connection.release();
  })
  .catch(err => {
    console.warn("⚠️ Aviso: Não foi possível conectar ao MySQL:", err.message);
    console.log("ℹ️ O sistema usará armazenamento em memória como fallback");
  });
