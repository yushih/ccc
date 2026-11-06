import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { ARCHITECT_INSTRUCTIONS, INITIAL_PROMPT } from '../src/prompts'
const graph = { baseRevision: 0, nodes: [
  { id: 'owner', kind: 'person', label: 'Owner', description: 'Approves transfers' },
  { id: 'wallet', kind: 'wallet', label: 'Hardware wallet', description: 'Keeps signing material offline' },
], edges: [{ id: 'approval', source: 'owner', target: 'wallet', label: 'Approves' }] }
const result = (text: string, architecture: unknown = graph) => ({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ text, architecture }) }] }] })
async function mockNetwork(page: Page) {
  await page.route('**/*', route => {
    const url = new URL(route.request().url())
    if (url.hostname === '127.0.0.1') return route.continue()
    return route.abort('blockedbyclient')
  })
  await page.route('https://api.openai.com/v1/models', route => route.fulfill({ json: { data: [{ id: 'gpt-6-luna' }] } }))
  await page.route('https://api.openai.com/v1/responses', route => {
    const input = route.request().postDataJSON().input
    const opening = input.length === 1 && input[0].content === INITIAL_PROMPT
    return route.fulfill({ json: opening ? result('Welcome to CCC.', null) : result('Let’s start with an offline signer.') })
  })
}
async function connect(page: Page) {
  await page.goto('/')
  await page.getByLabel('API key', { exact: true }).fill('fake-browser-key')
  await page.getByRole('button', { name: 'Connect to OpenAI' }).click()
  await expect(page.getByText('Welcome to CCC.', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Message', { exact: true })).toBeFocused()
}
async function send(page: Page, text = 'I need offline custody') {
  await page.getByLabel('Message', { exact: true }).fill(text)
  await page.getByRole('button', { name: 'Send message' }).click()
}
test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1920, height: 1000 }); await mockNetwork(page) })
test('setup to architecture to disconnect, with accessible controls', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.screenshot({ path: testInfo.outputPath('setup.png') })
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await connect(page)
  await send(page)
  await expect(page.getByText('Let’s start with an offline signer.')).toBeVisible()
  await expect(page.locator('.react-flow__node')).toHaveCount(2)
  await page.getByRole('button', { name: 'Owner person', exact: true }).click()
  await expect(page.getByText('Approves transfers', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Approves connection', exact: true }).click()
  await expect(page.getByText('Owner → Hardware wallet')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('conversation.png') })
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.getByRole('button', { name: 'Disconnect', exact: true }).click()
  await expect(page.getByLabel('API key', { exact: true })).toHaveValue('')
  await expect(page.getByText('Your architecture starts here')).toBeVisible()
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0])
})
test('a rejected key can be corrected and retried', async ({ page }) => {
  await page.route('https://api.openai.com/v1/models', route => route.fulfill({ status: 401, json: { error: { message: 'private raw error' } } }))
  await page.goto('/'); await page.getByLabel('API key', { exact: true }).fill('fake')
  await page.getByRole('button', { name: 'Connect to OpenAI' }).click()
  await expect(page.getByRole('alert')).toContainText('rejected this API key')
  await expect(page.getByLabel('Message', { exact: true })).toHaveCount(0)
  await page.route('https://api.openai.com/v1/models', route => route.fulfill({ json: { data: [] } }))
  await page.getByRole('button', { name: 'Connect to OpenAI' }).click()
  await expect(page.getByLabel('Message', { exact: true })).toBeVisible()
})
test('model access errors preserve the session and retry does not duplicate messages', async ({ page }) => {
  await connect(page)
  await page.route('https://api.openai.com/v1/responses', route => route.fulfill({ status: 403, json: {} }))
  await send(page)
  await expect(page.getByRole('alert')).toContainText('configured model')
  await expect(page.getByLabel('API key', { exact: true })).toHaveCount(0)
  await page.route('https://api.openai.com/v1/responses', route => route.fulfill({ json: result('Recovered', null) }))
  await page.getByRole('button', { name: 'Retry response' }).click()
  await expect(page.getByText('Recovered', { exact: true })).toBeVisible()
  await expect(page.getByText('I need offline custody', { exact: true })).toHaveCount(1)
})
test('invalid graph leaves the previous architecture visible', async ({ page }) => {
  await connect(page); await send(page)
  await expect(page.locator('.react-flow__node')).toHaveCount(2)
  await page.route('https://api.openai.com/v1/responses', route => route.fulfill({ json: result('Updated explanation', { ...graph, baseRevision: 1, edges: [{ id: 'bad', source: 'owner', target: 'missing', label: '' }] }) }))
  await send(page, 'Add a recovery path')
  await expect(page.getByText('Updated explanation')).toBeVisible()
  await expect(page.getByText(/previous diagram is unchanged/)).toBeVisible()
  await expect(page.locator('.react-flow__node')).toHaveCount(2)
  await expect(page.getByText('REV 01')).toBeVisible()
})
test('stopping and disconnecting ignore delayed responses', async ({ page }) => {
  await connect(page)
  let release!: () => void
  const gate = new Promise<void>(resolve => { release = resolve })
  await page.route('https://api.openai.com/v1/responses', async route => { await gate; await route.fulfill({ json: result('Too late') }).catch(() => {}) })
  await send(page)
  await page.getByRole('button', { name: 'Stop response' }).click()
  await page.getByRole('button', { name: 'Disconnect' }).click()
  release()
  await expect(page.getByLabel('API key', { exact: true })).toBeVisible()
  await expect(page.getByText('Too late', { exact: true })).toHaveCount(0)
})
test('reload clears the session', async ({ page }) => {
  await connect(page); await page.reload()
  await expect(page.getByLabel('API key', { exact: true })).toHaveValue('')
})
test('panel dimensions preserve 80em and narrow-screen horizontal access', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Geometry regression is covered in Chromium')
  await page.goto('/')
  const left = page.getByRole('region', { name: 'AI conversation', exact: true })
  expect((await left.boundingBox())?.width).toBe(1280)
  expect((await page.getByRole('region', { name: 'Solution architecture', exact: true }).boundingBox())?.width).toBe(640)
  await page.setViewportSize({ width: 900, height: 800 })
  expect((await left.boundingBox())?.width).toBe(1280)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeGreaterThan(900)
  await page.getByRole('heading', { name: 'Solution architecture' }).scrollIntoViewIfNeeded()
  expect(await page.evaluate(() => window.scrollX)).toBeGreaterThan(0)
})
test('graph supports drag, zoom and fit without changing semantic data', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Pointer geometry is covered in Chromium')
  await connect(page); await send(page)
  const node = page.locator('.react-flow__node').first()
  await expect(node).toBeVisible()
  const before = await node.getAttribute('style')
  const box = (await node.boundingBox())!
  await page.mouse.move(box.x + 50, box.y + 20); await page.mouse.down(); await page.mouse.move(box.x + 110, box.y + 80, { steps: 8 }); await page.mouse.up()
  await expect(node).not.toHaveAttribute('style', before!)
  const viewport = page.locator('.react-flow__viewport')
  const transform = await viewport.getAttribute('style')
  await page.getByRole('button', { name: 'Zoom In', exact: true }).click()
  await expect(viewport).not.toHaveAttribute('style', transform!)
  await page.getByRole('button', { name: 'Fit View', exact: true }).click()
  await expect(page.getByText('REV 01')).toBeVisible()
})

test('validation automatically sends the shared opening prompt and retains it in context', async ({ page }) => {
  const requests: { instructions: string; input: { role: string; content: string }[] }[] = []
  page.on('request', request => { if (request.url().endsWith('/v1/responses')) requests.push(request.postDataJSON()) })
  await connect(page)
  expect(requests).toHaveLength(1)
  expect(requests[0].instructions).toBe(ARCHITECT_INSTRUCTIONS)
  expect(requests[0]).not.toHaveProperty('architecture')
  await expect(page.getByText(ARCHITECT_INSTRUCTIONS, { exact: true })).toHaveCount(0)
  expect(requests[0].input).toEqual([{ role: 'user', content: INITIAL_PROMPT }])
  await expect(page.getByText(INITIAL_PROMPT, { exact: true })).toHaveCount(0)
  await send(page)
  await expect(page.getByText('Let’s start with an offline signer.')).toBeVisible()
  expect(requests[1].instructions).toBe(ARCHITECT_INSTRUCTIONS)
  expect(requests[1]).not.toHaveProperty('architecture')
  expect(requests[1].input).toEqual([
    { role: 'user', content: INITIAL_PROMPT },
    { role: 'assistant', content: 'Welcome to CCC.' },
    { role: 'user', content: 'I need offline custody' },
  ])
})
