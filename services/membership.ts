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
  let json: any = {};
  try { json = text ? JSON.parse(text) : {}; } catch { /* noop */ }

  if (!resp.ok) {
    return { status: 'error', message: `Sunucu hatası: ${resp.status} ${text?.slice?.(0, 200) ?? ''}` };
  }
  return json as MembershipResult;
}
    