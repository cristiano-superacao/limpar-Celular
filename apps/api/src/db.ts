import { PrismaClient } from "../generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { getEnv } from "./env";

function toSqlitePath(databaseUrl: string): string {
	// Aceita "file:./dev.db" (Prisma) e converte para caminho do better-sqlite3.
	if (databaseUrl.startsWith("file:")) {
		return databaseUrl.slice("file:".length);
	}
	return databaseUrl;
}

const env = getEnv();
const sqlitePath = toSqlitePath(env.DATABASE_URL);
const adapter = new PrismaBetterSqlite3({ url: sqlitePath });

export const db = new PrismaClient({ adapter });
