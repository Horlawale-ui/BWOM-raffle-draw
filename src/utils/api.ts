export interface PrizeApiResponse {
  status: 'success' | 'already_spun' | 'not_found';
  prize?: string;
  name?: string;
}

export async function verifyPrize(apiUrl: string, name: string): Promise<PrizeApiResponse> {
  const safeBaseUrl = (apiUrl || '').trim();

  if (!safeBaseUrl || !/^https?:\/\//i.test(safeBaseUrl)) {
    throw new Error('Missing or invalid Apps Script URL');
  }

  const url = `${safeBaseUrl}?name=${encodeURIComponent(name.trim())}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
    credentials: 'omit',
  });

  if (!response.ok) {
    throw new Error('Unable to verify prize status');
  }

  return (await response.json()) as PrizeApiResponse;
}