import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join('./tmp', 'cache.db'));
db.pragma('journal_mode = WAL');

// initalise table
db.prepare(`
  CREATE TABLE IF NOT EXISTS cache (
    query TEXT PRIMARY KEY,
    data TEXT,
    created_at INTEGER
  )
`).run();

const getStmt = db.prepare('SELECT data FROM cache WHERE query = ? AND created_at > ?');
const saveStmt = db.prepare('INSERT OR REPLACE INTO cache (query, data, created_at) VALUES (?, ?, ?)');
const cleanupStmt = db.prepare('DELETE FROM cache WHERE created_at < ?');

const CACHE_EXPIRY_HOURS = 24;

setInterval(() => {
  const expiryTime = Date.now() - (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
  cleanupStmt.run(expiryTime);
}, 60 * 60 * 1000);

process.on('SIGINT', () => {
  db.close();
  process.exit();
});

function getFromCache(query: string){
  if(!query || typeof query !== 'string' || query.length > 500){ return null; }

  try {
    const expiryTime = Date.now() - (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
    const result: any = getStmt.get(query, expiryTime);
    return result ? JSON.parse(result.data) : null;
  } catch (error) {
    console.error('Cache retrieval error:', error);
    return null;
  }
}

function saveToCache(query: string, data: any){
  if (!query || typeof query !== 'string' || query.length > 500 || !data) {
    return;
  }

  try {
    const serializedData = JSON.stringify(data);
    saveStmt.run(query, serializedData, Date.now());
  } catch (error) {
    console.error('Cache save error:', error);
  }
}

export { getFromCache, saveToCache };