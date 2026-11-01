/** What a server action returns so the client can report it. `limit` marks a plan-limit block. */
export type ActionResult = { ok: true; message: string } | { ok: false; message: string; limit?: boolean };
