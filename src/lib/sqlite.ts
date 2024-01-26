import { Database } from "sqlite3";

// Sqlite was written to aid testing.
export class Sqlite {
  static async each(db: Database, sql: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const rows: any[] = [];
      db.each(
        sql,
        (err, row) => {
          if (err) return reject(err);
          rows.push(row);
        },
        (err) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async run(db: Database, sql: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.run(sql, (result: any, err: Error) => {
        if (err) return reject(err);
        else resolve(result);
      });
    });
  }

  static async schema(db: Database): Promise<string[]> {
    return (await Sqlite.tables(db)).map((table) => table.sql);
  }

  static async tables(db: Database): Promise<any[]> {
    return Sqlite.each(
      db,
      "SELECT * FROM sqlite_master WHERE type ='table' AND  name NOT LIKE 'sqlite_%'"
    );
  }

  static async cloneDb(source: Database, target: Database) {
    const schema = await Sqlite.schema(source);
    await Promise.all(schema.map((sql) => Sqlite.each(target, sql)));
  }

  static async wipeDb(db: Database) {
    const tables = await Sqlite.tables(db);
    await Promise.all(
      tables.map((table) =>
        Sqlite.run(db, `DROP TABLE IF EXISTS ${table.tbl_name}`)
      )
    );
  }
}
