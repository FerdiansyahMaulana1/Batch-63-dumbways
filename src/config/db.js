//config/db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',         
  host: 'localhost',
  database: 'Day10', 
  password: "",
  port: 5432,                
});

export default pool;

