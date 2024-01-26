import { Database } from "sqlite3";
import { Sqlite } from "./sqlite";
import md5 from "md5";
import { Runnable } from "mocha";

export async function makeTestBaseDatabase(
  runnable: Runnable
): Promise<string> {
  const prismaDirectory = __dirname + "/../../prisma/";

  const baseDb = new Database(prismaDirectory + "test.db");

  const prefix = md5(runnable.titlePath().join("/"));
  const filename = `${prefix}.test.db`;
  const testDb = new Database(prismaDirectory + filename);

  await Sqlite.wipeDb(testDb);
  await Sqlite.cloneDb(baseDb, testDb);

  return `file:${filename}`;
}
