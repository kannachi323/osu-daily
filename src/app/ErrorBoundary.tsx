import { Component, type ReactNode } from 'react'
import { buttonClass } from '../shared/components/buttonClass'

interface ErrorBoundaryState {
  failed: boolean
}

/** Catches render errors so a bug shows a way out instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error(error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Something broke.</h1>
        <p className="mt-4 text-lg text-muted">Your progress is saved. Reloading usually fixes it.</p>
        <button type="button" onClick={() => window.location.reload()} className={buttonClass('primary', 'mt-8')}>
          Reload
        </button>
      </main>
    )
  }
}
