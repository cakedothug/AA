declare module 'express-mysql-session' {
  import { Store } from 'express-session';
  
  interface MySQLStoreOptions {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    createDatabaseTable?: boolean;
    schema?: {
      tableName?: string;
      columnNames?: {
        session_id?: string;
        expires?: string;
        data?: string;
      };
    };
    // outras opções que possam ser necessárias
  }
  
  interface MySQLStore {
    new (options: MySQLStoreOptions): Store;
  }
  
  function MySQLStoreFactory(session: any): MySQLStore;
  export = MySQLStoreFactory;
}