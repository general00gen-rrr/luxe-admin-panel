export async function writeJSONToGitHub(filePath: string, content: any[], message: string) {
  const base64Content = Buffer.from(JSON.stringify(content, null, 2)).toString('base64')
  
  const getRes = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/${filePath}`,
    { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, 'User-Agent': 'luxe-cms' } }
  )
  const current = getRes.ok ? await getRes.json() : null

  const res = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'luxe-cms'
      },
      body: JSON.stringify({
        message,
        content: base64Content,
        sha: current?.sha,
        branch: process.env.GITHUB_BRANCH,
      }),
    }
  )
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message)
  }
  return res.json()
}
