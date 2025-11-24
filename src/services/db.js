import * as SQLite from 'wa-sqlite';
import SQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite.mjs';
import { OPFSVFS } from 'wa-sqlite/src/VFS/OPFSVFS.js';

let db; // The global database connection object

/**
 * Initializes the SQLite database using wa-sqlite with IndexedDB persistence.
 */
async function initializeDB() {
    if (db) return db;

    // Load the WebAssembly module
    const module = await SQLiteESMFactory();
    const sqlite3 = SQLite.Factory(module);

    // Register the IndexedDB-backed Virtual File System (VFS)
    // 'idb-vfs' is the name we use when opening the database.
    sqlite3.vfs_register(new OPFSVFS(), true); // 'opfs' is the default name

    // Open the database file named 'notes.db' using the 'opfs' VFS.
    db = await sqlite3.open_v2(
        'notes.db',
        SQLite.SQLITE_OPEN_READWRITE | SQLite.SQLITE_OPEN_CREATE,
        'opfs' // 🎯 Use the registered OPFS VFS
    );

    // Set the connection object to use for executing queries
    db.sqlite3 = sqlite3;

    // Create the schema and FTS tables
    await createSchema(db);

    return db;
}

/**
 * Executes a query or set of queries.
 */
async function execute(dbInstance, sql, bind = {}) {
    if (!dbInstance) throw new Error("Database not initialized.");

    // Utility to handle parameter binding and execution
    const stmt = await dbInstance.sqlite3.prepare_v2(dbInstance, sql);
    await dbInstance.sqlite3.bind(stmt, bind);

    const result = [];
    while (await dbInstance.sqlite3.step(stmt) === SQLite.SQLITE_ROW) {
        // Collect results if it was a SELECT query
        result.push(dbInstance.sqlite3.row(stmt));
    }

    await dbInstance.sqlite3.finalize(stmt);
    return result;
}

/**
 * Creates the main notes table and the FTS5 virtual table with triggers.
 */
async function createSchema(dbInstance) {
    const sql = `
        -- 1. Main Data Table
        CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            notebody TEXT NOT NULL,
            date_created INTEGER NOT NULL,
            date_modified INTEGER NOT NULL
        );

        -- 2. FTS5 Virtual Table
        -- This table is optimized for searching.
        -- content_rowid links FTS back to the main notes table PK (id).
        -- content='notes' links the FTS table to the main notes table.
        CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
            notebody, 
            content='notes', 
            content_rowid='id' 
        );

        -- 3. Triggers for Automatic FTS Indexing
        -- These ensure the search index stays synchronized with the main table.

        -- INSERT Trigger
        CREATE TRIGGER IF NOT EXISTS notes_after_insert 
        AFTER INSERT ON notes BEGIN
            INSERT INTO notes_fts (rowid, notebody) 
            VALUES (new.id, new.notebody);
        END;

        -- UPDATE Trigger
        CREATE TRIGGER IF NOT EXISTS notes_after_update 
        AFTER UPDATE ON notes BEGIN
            -- The 'fts5' module handles the update logic implicitly when using content=
            INSERT INTO notes_fts(notes_fts, rowid, notebody) 
            VALUES('delete', old.id, old.notebody);
            INSERT INTO notes_fts(rowid, notebody) 
            VALUES(new.id, new.notebody);
        END;
        
        -- DELETE Trigger
        CREATE TRIGGER IF NOT EXISTS notes_after_delete 
        AFTER DELETE ON notes BEGIN
            INSERT INTO notes_fts(notes_fts, rowid, notebody) 
            VALUES('delete', old.id, old.notebody);
        END;
    `;

    // Execute all schema commands
    await dbInstance.sqlite3.exec(dbInstance, sql);
}

// Export the initialization and execution helpers
export const DBService = {
    init: initializeDB,
    exec: execute
};