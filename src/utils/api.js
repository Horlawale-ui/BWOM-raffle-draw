export async function verifyPrize(apiUrl, name) {
  const response = await fetch(`${apiUrl}?name=${encodeURIComponent(name.trim())}`)

  if (!response.ok) {
    throw new Error('Unable to verify prize status')
  }

  return response.json()
}
