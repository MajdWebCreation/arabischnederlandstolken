import "server-only";

/**
 * Postgres never records not-null metadata for *view* columns - not even
 * for a view's own primary-key passthrough or a column that only ever
 * arrives via an inner join - so `supabase gen types typescript` marks
 * every column of every view as nullable, regardless of what the
 * underlying base tables actually guarantee. There is no view/SQL
 * definition that changes this; it is a Postgres/codegen limitation, not a
 * schema weakness.
 *
 * This asserts a value that a specific, verified base-table constraint (a
 * NOT NULL column reached only through inner joins - see the call site's
 * comment for which constraint) guarantees is present, so the rest of the
 * app can use the correctly-typed, non-null value instead of re-deriving
 * "is this really nullable?" at every render site. It throws rather than
 * silently trusting, so a real future schema change that actually
 * introduces a null here fails loudly instead of rendering "null" in the
 * portal or admin UI.
 */
export function assertNonNull<T>(value: T | null, field: string): T {
  if (value === null) {
    throw new Error(
      `Expected "${field}" to be non-null (base-table invariant violated - see lib/supabase/invariants.ts)`,
    );
  }
  return value;
}
