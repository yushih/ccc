import { useEffect, useReducer, useRef, useState } from 'react'
import { Effect, Either } from 'effect'
import { createOpenAI } from '../providers/openai'
import { createSession } from '../providers/session'
import { ModelProvider, type Provider, type Message } from '../providers/types'
import type { AppError } from '../providers/errors'
import { initialState, reducer } from './state'
import { INITIAL_PROMPT } from '../prompts'
import { emptyArchitecture, type Architecture } from '../features/architecture/schema'
import styles from './App.module.css'
import Diagram from '../features/architecture/Diagram'

const defaultProvider = createOpenAI(import.meta.env.VITE_OPENAI_MODEL ?? '')
export default function App({ provider = defaultProvider }: { provider?: Provider }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const [session] = useState(createSession)
  const [draft, setDraft] = useState('')
  const keyInput = useRef<HTMLInputElement>(null)
  const composer = useRef<HTMLTextAreaElement>(null)
  const transcript = useRef<HTMLDivElement>(null)
  const active = useRef<AbortController | null>(null)
  const sequence = useRef(0)
  const connected = state.phase === 'ready' || state.phase === 'responding'
  const busy = state.phase === 'responding'

  function cancel() { sequence.current++; active.current?.abort(); active.current = null }
  function disconnect(message?: string) {
    cancel(); session.clear(); setDraft(''); if (keyInput.current) keyInput.current.value = ''
    dispatch({ type: 'reset', error: message })
  }
  useEffect(() => () => { sequence.current++; active.current?.abort(); session.clear() }, [session])
  useEffect(() => { if (connected) composer.current?.focus(); else keyInput.current?.focus() }, [connected])

  useEffect(() => { if (transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight }, [state.messages, busy])

  function run<A>(effect: Effect.Effect<A, AppError, ModelProvider>, success: (value: A) => void, authenticated = connected) {
    const id = ++sequence.current
    const controller = new AbortController(); active.current = controller
    void Effect.runPromise(effect.pipe(Effect.provideService(ModelProvider, provider), Effect.either), { signal: controller.signal }).then(result => {
      if (id !== sequence.current || controller.signal.aborted) return
      active.current = null
      if (Either.isRight(result)) success(result.right)
      else if (result.left.kind === 'authentication' && authenticated) disconnect(result.left.message)
      else dispatch({ type: 'failure', message: result.left.message })
    }).catch(() => {
      if (id !== sequence.current || controller.signal.aborted) return
      active.current = null
      dispatch({ type: 'failure', message: 'Something went wrong. Please retry.' })
    })
  }
  function connect() {
    if (active.current) return
    const candidate = keyInput.current?.value.trim() ?? ''
    if (!candidate) { dispatch({ type: 'failure', message: 'Enter an API key to continue.' }); return }
    dispatch({ type: 'validating' })
    run(session.connect(candidate), () => {
      if (keyInput.current) keyInput.current.value = ''
      dispatch({ type: 'connected' })
      respond([{ role: 'user', content: INITIAL_PROMPT, origin: 'app' }], emptyArchitecture())
    })
  }
  function send(retry = false) {
    if (active.current || !connected || (!retry && !draft.trim())) return
    const messages: Message[] = retry ? state.messages : [...state.messages, { role: 'user', content: draft.trim() }]
    respond(messages, state.architecture)
  }
  function respond(messages: Message[], architecture: Architecture) {
    dispatch({ type: 'start', messages })
    run(session.respond({ messages, architecture }), result => {
      setDraft(''); dispatch({ type: 'result', ...result }); composer.current?.focus()
    }, true)
  }

  return <main className={styles.shell}>
    <section className={styles.conversation} aria-label="AI conversation">
      <header className={styles.header}><a className={styles.brand} href="./" aria-label="CCC home">ccc<span className={styles.brandDot}>.</span></a><span className={styles.product}>COMPLETELY CUSTOMIZED CUSTODY</span><span className={styles.stage}>ARCHITECT</span></header>
      {!connected ? <div className={styles.setup}>
        <div className={styles.eyebrow}>YOUR CUSTODY, YOUR TERMS</div>
        <h1>A considered approach<br />to custody.</h1>
        <p className={styles.lead}>Start a conversation. Shape a solution around your needs, your resources, and the way you work.</p>
        <form onSubmit={event => { event.preventDefault(); connect() }} className={styles.form}>
          <label htmlFor="provider">Model provider</label>
          <select id="provider" defaultValue="openai" disabled={state.phase === 'validating'}><option value="openai">OpenAI</option></select>
          <label htmlFor="key">API key</label>
          <input id="key" ref={keyInput} type="password" autoComplete="off" spellCheck={false} placeholder="Enter your OpenAI API key" disabled={state.phase === 'validating'} aria-describedby="key-note" />
          <p id="key-note" className={styles.note}>Your key is held in memory for this session and sent directly from your browser to OpenAI. It is cleared when you disconnect or reload.</p>
          {state.error && <p className={styles.error} role="alert">{state.error}</p>}
          <button className={styles.primary} disabled={state.phase === 'validating'}>{state.phase === 'validating' ? 'Validating…' : 'Connect to OpenAI'}<span aria-hidden="true">↗</span></button>
          {state.phase === 'validating' && <><p role="status" className={styles.note}>Checking your credentials…</p><button type="button" className={styles.textButton} onClick={() => disconnect()}>Cancel validation</button></>}
        </form>
      </div> : <div className={styles.chat}>
        <div className={styles.chatHeader}><div><span className={styles.online} />OpenAI <span className={styles.muted}> / Architect session</span></div><button className={styles.textButton} onClick={() => disconnect()}>Disconnect</button></div>
        <div ref={transcript} className={styles.transcript} role="log" aria-label="Conversation" aria-live="polite">
          <div className={styles.introduction}><span className={styles.eyebrow}>LET’S DESIGN YOUR CUSTODY</span><h1>Your custody conversation</h1></div>
          {state.messages.map((message, index) => message.origin === 'app' ? null : <article className={message.role === 'user' ? styles.userMessage : styles.assistantMessage} key={index}><span className={styles.messageRole}>{message.role === 'user' ? 'YOU' : 'ARCHITECT'}</span><p>{message.content}</p></article>)}
          {busy && <p role="status" className={styles.thinking}>Considering your requirements…</p>}
        </div>
        <div className={styles.composerArea}>
          {state.error && <p className={styles.error} role="alert">{state.error}</p>}
          {state.warning && <p className={styles.note} role="status">{state.warning}</p>}
          {state.retry && <button className={styles.textButton} onClick={() => send(true)}>Retry response</button>}
          <form className={styles.composer} onSubmit={event => { event.preventDefault(); send() }}>
            <label htmlFor="message" className={styles.srOnly}>Message</label>
            <textarea id="message" ref={composer} value={draft} readOnly={busy} placeholder="Describe your needs or ask a question…" rows={3} maxLength={20000} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send() } }} />
            {busy ? <button type="button" className={styles.primary} onClick={() => { cancel(); dispatch({ type: 'stop' }) }}>Stop response</button> : <button className={styles.primary} aria-label="Send message">Send <span aria-hidden="true">↑</span></button>}
          </form><p className={styles.composerHint}>Enter to send · Shift + Enter for a new line</p>
        </div>
      </div>}
      <footer className={styles.footer}><span>DESIGNED AROUND YOU</span><span>CCC / 01</span></footer>
    </section>
    <section className={styles.architecture} aria-label="Solution architecture">
      <header className={styles.diagramHeader}><div><span className={styles.eyebrow}>THE BIG PICTURE</span><h2>Solution architecture</h2></div><span className={styles.revision}>REV {String(state.architecture.revision).padStart(2, '0')}</span></header>
      {state.architecture.nodes.length > 0 ? <Diagram architecture={state.architecture} /> : <div className={styles.emptyDiagram}><div className={styles.emptyIcon} aria-hidden="true">◇</div><h3>Your architecture starts here</h3><p>As the conversation takes shape, so will your solution. Explore its components and how they connect.</p><span className={styles.waiting}>AWAITING YOUR REQUIREMENTS</span></div>}
      <footer className={styles.diagramFooter}>A shared view of your solution.</footer>
    </section>
  </main>
}
