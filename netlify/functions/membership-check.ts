// netlify/functions/membership-check.ts
import type { Handler } from '@netlify/functions';

/** ---- Yardımcılar ---- **/

// TR'ye sabit normalizasyon: Sonuç "90XXXXXXXXXX" (12 hane)
function normalizeTR(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('90')) return digits;          // 90XXXXXXXXXX
  if (digits.length === 11 && digits.startsWith('0')) return '90' + digits.slice(1); // 0XXXXXXXXXX
  if (digits.length === 10 && digits.startsWith('5')) return '90' + digits;    // 5XXXXXXXXX
  return null; // geçersiz
}

type GetClientsResp = {
  HasError: boolean;
  Data?: { Count: number; Objects: Array<{ Id: number; Login: string }> };
  AlertMessage?: string;
};

type GetClientByIdResp = {
  HasError: boolean;
  Data?: { Id: number; Phone: string | null; MobilePhone: string | null; Status?: number; IsLocked?: boolean };
  AlertMessage?: string;
};

const API_BASE = process.env.API_BASE ?? 'https://backofficewebadmin.betconstruct.com/api/en';
const API_KEY  = process.env.API_KEY;

/** ---- Handler ---- **/
export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    if (!API_KEY) {
      return { statusCode: 500, body: 'Server misconfig: API_KEY missing' };
    }

    const body = JSON.parse(event.body || '{}') as { login?: string; phone?: string };
    const login = (body.login || '').trim();
    const userPhone = normalizeTR(body.phone);

    if (!login || !userPhone) {
      return { statusCode: 400, body: JSON.stringify({ status: 'error', message: 'Geçerli login ve telefon (90XXXXXXXXXX) gerekli.' }) };
    }

    // 1) GetClients → Id bul
    const getClientsPayload = {
      // Minimal payload: senin paylaştığın şemaya sadık kalarak pratik alanlar
      Login: login,
      SkeepRows: 0,
      MaxRows: 20,
      OrderedItem: 1,
      IsOrderedDesc: true,
      IsStartWithSearch: false,
      MaxCreatedLocalDisable: true,
      MinCreatedLocalDisable: true,

      // İsteğe bağlı alanlar boş bırakılabilir
      Id: '', FirstName: '', LastName: '', PersonalId: '', Email: '', Phone: '', ZipCode: null,
      MiddleName: '', MobilePhone: '', NickName: '', DocumentNumber: '', Time: '', TimeZone: '',
      Gender: null, City: '', RegionId: null, Status: null, IsLocked: null, IsVerified: null, IsTest: null,
      CurrencyId: null, OwnerId: null, ExternalId: '', RegistrationSource: null, ClientCategory: null,
      IsEmailSubscribed: null, IsSMSSubscribed: null, SelectedPepStatuses: '', AMLRisk: '',
      MinCreatedLocal: null, MaxCreatedLocal: null, MinLastTimeLoginDateLocal: null, MaxLastTimeLoginDateLocal: null,
      MinLastWrongLoginDateLocal: null, MaxLastWrongLoginDateLocal: null, MaxWrongLoginAttempts: null, MinWrongLoginAttempts: null,
      MinBalance: null, MaxBalance: null, MinLoyaltyPointBalance: null, MaxLoyaltyPointBalance: null,
      MinVerificationDateLocal: null, MaxVerificationDateLocal: null, MinFirstDepositDateLocal: null, MaxFirstDepositDateLocal: null,
      CasinoProfileId: null, SportProfitnessFrom: null, SportProfitnessTo: null, CasinoProfitnessFrom: null, CasinoProfitnessTo: null,
      BetShopGroupId: '', CashDeskId: null, IBAN: null, AffiliatePlayerType: null, BTag: null, PartnerClientCategoryId: null,
      OrderedItem: 1 // tekrar koymak sorun değil; bazı API'ler buna bakıyor
    };

    const commonHeaders = {
      'Content-Type': 'application/json',
      'Authentication': API_KEY
    } as Record<string, string>;

    const gcRes = await fetch(`${API_BASE}/Client/GetClients`, {
      method: 'POST',
      headers: commonHeaders,
      body: JSON.stringify(getClientsPayload),
    });

    const gcText = await gcRes.text();
    if (!gcRes.ok) {
      return { statusCode: gcRes.status, body: JSON.stringify({ status: 'error', message: `GetClients HTTP ${gcRes.status}: ${gcText.slice(0, 300)}` }) };
    }

    let gcJson: GetClientsResp;
    try { gcJson = JSON.parse(gcText); } catch {
      return { statusCode: 502, body: JSON.stringify({ status: 'error', message: 'GetClients JSON parse error' }) };
    }
    if (gcJson.HasError) {
      return { statusCode: 502, body: JSON.stringify({ status: 'error', message: gcJson.AlertMessage || 'GetClients returned HasError' }) };
    }

    const count = gcJson.Data?.Count ?? 0;
    const objs  = gcJson.Data?.Objects ?? [];
    if (count === 0 || objs.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ status: 'not_found', message: 'Bu kullanıcı adına ait hesap bulunamadı.' }) };
    }
    if (count > 1 || objs.length > 1) {
      return { statusCode: 200, body: JSON.stringify({ status: 'ambiguous', message: 'Birden fazla kayıt bulundu, lütfen kullanıcı adını netleştirin.' }) };
    }

    const id = objs[0].Id;

    // 2) GetClientById → Telefon al
    const byIdRes = await fetch(`${API_BASE}/Client/GetClientById?id=${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: commonHeaders,
    });

    const byIdText = await byIdRes.text();
    if (!byIdRes.ok) {
      return { statusCode: byIdRes.status, body: JSON.stringify({ status: 'error', message: `GetClientById HTTP ${byIdRes.status}: ${byIdText.slice(0, 300)}` }) };
    }

    let byIdJson: GetClientByIdResp;
    try { byIdJson = JSON.parse(byIdText); } catch {
      return { statusCode: 502, body: JSON.stringify({ status: 'error', message: 'GetClientById JSON parse error' }) };
    }
    if (byIdJson.HasError) {
      return { statusCode: 502, body: JSON.stringify({ status: 'error', message: byIdJson.AlertMessage || 'GetClientById returned HasError' }) };
    }

    const serverPhone = normalizeTR(byIdJson.Data?.MobilePhone ?? byIdJson.Data?.Phone ?? null);
    if (!serverPhone) {
      return { statusCode: 200, body: JSON.stringify({ status: 'mismatch', message: 'Telefon bilgisi bulunamadı veya geçersiz.' }) };
    }

    const match = serverPhone === userPhone;

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: match ? 'match' : 'mismatch',
        message: match ? 'Eşleşme bulundu.' : 'Kullanıcı adı ile telefon numarası eşleşmedi.'
      }),
      headers: { 'Content-Type': 'application/json' }
    };

  } catch (err: any) {
    return { statusCode: 500, body: JSON.stringify({ status: 'error', message: err?.message || 'Unexpected error' }) };
  }
};
