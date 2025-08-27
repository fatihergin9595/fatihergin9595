// src/services/membership.ts
export type MembershipResult =
  | { status: 'match'; message?: string }
  | { status: 'mismatch' | 'not_found' | 'ambiguous' | 'error'; message?: string };

export async function checkMembership(login: string, phone90: string): Promise<MembershipResult> {
  const resp = await fetch('/.netlify/functions/membership-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, phone: phone90 }),
  });

  const text = await resp.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* noop */ }

  if (!resp.ok) {
    return { status: 'error', message: json?.message || `HTTP ${resp.status}: ${text?.slice?.(0, 200) ?? ''}` };
  }

  // YALNIZCA beklenen status değerlerini kabul et
  const okStatuses = new Set(['match','mismatch','not_found','ambiguous','error']);
  const s = json?.status;
  if (typeof s !== 'string' || !okStatuses.has(s)) {
    return { status: 'error', message: 'Beklenmeyen yanıt.' };
  }
  return json as MembershipResult;
}