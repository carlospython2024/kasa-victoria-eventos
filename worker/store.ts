// A store belongs to one request. D1 batches commit all queued writes together.
// Reads happen before commit; version guards reject stale decisions atomically.
export function createStore(db: D1Database) {
  let pending: D1PreparedStatement[] | undefined;
  let guards: D1PreparedStatement[] = [];
  const prepare = (sql: string) => ({
    async get(...args: any[]) {
      return db
        .prepare(sql)
        .bind(...args)
        .first();
    },
    async all(...args: any[]) {
      return (
        await db
          .prepare(sql)
          .bind(...args)
          .all()
      ).results;
    },
    async run(...args: any[]) {
      const statement = db.prepare(sql).bind(...args);
      if (pending) {
        pending.push(statement);
        return;
      }
      return statement.run();
    },
  });
  return {
    prepare,
    async guardUpload(id: string) {
      if (!pending) throw new Error("Upload writes require a transaction");
      guards.push(
        db
          .prepare(
            `INSERT INTO mutation_guard(ok) SELECT CASE WHEN
        (SELECT count(*) FROM media WHERE order_id=?) < 40
        AND (SELECT json_extract(data,'$.stage') FROM orders WHERE id=?) IN ('collecting','designing')
        THEN 1 ELSE 0 END`,
          )
          .bind(id, id),
      );
    },
    async guardOrder(id: string, version: number) {
      if (!pending) throw new Error("Order writes require a transaction");
      guards.push(
        db
          .prepare(
            `INSERT INTO mutation_guard(ok) SELECT CASE WHEN
        (SELECT json_extract(data,'$.version') FROM orders WHERE id=?)=?
        OR (?=0 AND NOT EXISTS(SELECT 1 FROM orders WHERE id=?))
        THEN 1 ELSE 0 END`,
          )
          .bind(id, version, version, id),
      );
    },
    async transaction(fn: () => Promise<void>) {
      if (pending) throw new Error("Nested transactions are not supported");
      pending = [];
      guards = [];
      try {
        await fn();
        await db.batch([
          ...guards,
          ...pending,
          db.prepare("DELETE FROM mutation_guard"),
        ]);
      } catch (error: any) {
        if (
          /mutation_guard|payment_references|UNIQUE constraint failed: settings/.test(
            error.message,
          )
        )
          throw Object.assign(
            new Error(
              "Los datos cambiaron. Actualiza la página antes de continuar.",
            ),
            { status: 409 },
          );
        throw error;
      } finally {
        pending = undefined;
        guards = [];
      }
    },
  };
}
