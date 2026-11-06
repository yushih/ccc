import DOMPurify from 'dompurify'
import { Effect } from 'effect'
import { error } from '../providers/errors'
import styles from './App.module.css'

export default function AssistantHtml({ html }: { html: string }) {
  const clean = Effect.runSync(Effect.try({ try: () => DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'pre', 'blockquote', 'a'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    ALLOWED_URI_REGEXP: /^https?:\/\//i,
  }), catch: () => error('response', 'The response could not be displayed.') }).pipe(Effect.orElseSucceed(() => '')))
  return <div className={styles.assistantHtml} dangerouslySetInnerHTML={{ __html: clean || '<p>The response contained no displayable text.</p>' }} />
}
