// src/services/membership.ts
export type MembershipResult =
  | { status: 'match'; message?: string }
  | { status: 'mismatch' | 'not_found' | 'ambiguous' | 'error'; message?: string };

export async function checkMembership(login: string, phone90: string): Promise<MembershipResult> {
  console.log('[membership] calling function with', { login, phone90 });

  const resp = await fetch('/.netlify/functions/membership-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, phone: phone90 }),
  });

  const text = await resp.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* ignore */ }

  if (!resp.ok) {
    return { status: 'error', message: json?.message || `HTTP ${resp.status}: ${text?.slice?.(0, 200) ?? ''}` };
  }

  const ok = new Set(['match','mismatch','not_found','ambiguous','error']);
  const s = json?.status;
  if (typeof s !== 'string' || !ok.has(s)) {
    return { status: 'error', message: 'Beklenmeyen yanıt.' };
  }
  return json as MembershipResult;
}
