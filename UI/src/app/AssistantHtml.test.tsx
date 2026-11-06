import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import AssistantHtml from './AssistantHtml'

it('renders semantic formatting and safe links while removing executable and embedded HTML', () => {
  const { container } = render(<AssistantHtml html={`<p style="position:fixed" onclick="alert(1)">Use <strong>offline</strong> backups.</p>
    <ul><li><em>Keep separate</em></li></ul><pre><code>2 of 3</code></pre>
    <a href="https://example.com/reference" title="Reference" target="_blank">Reference</a>
    <a href="javascript:alert(1)">Unsafe</a><a href="data:text/html,bad">Data</a><a href="/relative">Relative</a>
    <script>alert(1)</script><img src="https://example.com/tracker" onerror="alert(1)">
    <iframe src="https://example.com"></iframe><form><input autofocus></form><svg onload="alert(1)"></svg>`} />)
  expect(screen.getByText('offline').tagName).toBe('STRONG')
  expect(screen.getByRole('listitem')).toHaveTextContent('Keep separate')
  expect(screen.getByRole('link', { name: 'Reference' })).toHaveAttribute('href', 'https://example.com/reference')
  expect(screen.getByRole('link', { name: 'Reference' })).not.toHaveAttribute('target')
  for (const label of ['Unsafe', 'Data', 'Relative']) expect(screen.getByText(label)).not.toHaveAttribute('href')
  expect(container.querySelector('script, img, iframe, form, input, svg, [style], [onclick], [onerror], [autofocus]')).toBeNull()
})
it('shows a readable fallback when all model content is removed', () => {
  render(<AssistantHtml html="<script>alert(1)</script>" />)
  expect(screen.getByText('The response contained no displayable text.')).toBeVisible()
})
