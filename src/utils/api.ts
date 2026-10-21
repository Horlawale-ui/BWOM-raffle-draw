export interface PrizeApiResponse {
  status: 'success' | 'already_spun' | 'not_found';
  prize?: string;
  name?: string;
  delivered?: boolean;
}

export async function verifyPrize(apiUrl: string, name: string): Promise<PrizeApiResponse> {
  const safeBaseUrl = (apiUrl || '').trim();

  if (!safeBaseUrl || !/^https?:\/\//i.test(safeBaseUrl)) {
    throw new Error('Missing or invalid Apps Script URL');
  }

  const url = `${safeBaseUrl}?name=${encodeURIComponent(name.trim())}`;

  // Simple GET request without custom headers:
  // Google Apps Script redirects (302) to googleusercontent.com.
  // Standard simple GET avoids CORS preflight OPTIONS rejection.
  const response = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error('Unable to verify prize status');
  }

  return (await response.json()) as PrizeApiResponse;
}