import { useEffect, useState, type ComponentType } from 'react'
import { ArchivePage } from '../features/archive/ArchivePage'
import { BackdropPage } from '../features/backdrop/BackdropPage'
import { HigherLowerPage } from '../features/higher-lower/HigherLowerPage'
import { HomePage } from '../features/home/HomePage'
import { MapperPage } from '../features/mapper/MapperPage'
import { TriviaPage } from '../features/trivia/TriviaPage'
import { buttonClass } from '../shared/components/buttonClass'
import { ArrowRight } from '../shared/components/icons'
import { dayKeyOfPuzzle, puzzleNumberOf, type DayKey } from '../shared/daily/day'
import { useToday } from '../shared/daily/useToday'
import { gameById, parseRoute, type GameId, type GamePageProps, type Route } from './games'
import { Link } from './Link'
import { usePathname } from './router'
import { SiteFooter } from './SiteFooter'

const GAME_PAGES: Record<GameId, ComponentType<GamePageProps>> = {
  trivia: TriviaPage,
  backdrop: BackdropPage,
  'higher-lower': HigherLowerPage,
  mapper: MapperPage,
}

const SITE_NAME = 'osu! daily'

/** Future puzzle numbers don't exist yet, so they are a missing page. */
function resolveRoute(route: Route, today: DayKey): Route {
  if (route.page === 'game' && route.puzzleNumber !== undefined && route.puzzleNumber > puzzleNumberOf(today)) {
    return { page: 'not-found' }
  }
  return route
}

function pageTitle(route: Route): string {
  if (route.page === 'game') return `${gameById(route.gameId).name} · ${SITE_NAME}`
  if (route.page === 'archive') return `Archive · ${SITE_NAME}`
  if (route.page === 'not-found') return `Not found · ${SITE_NAME}`
  return `${SITE_NAME}: daily osu! mini-games`
}

function GameRoute({ gameId, puzzleNumber, today }: { gameId: GameId; puzzleNumber?: number; today: DayKey }) {
  // Pin the day when the page opens, so a game in progress at midnight isn't swapped out.
  const [openedOn] = useState(today)
  const isArchive = puzzleNumber !== undefined && puzzleNumber < puzzleNumberOf(openedOn)
  const day = isArchive ? dayKeyOfPuzzle(puzzleNumber) : openedOn
  const Page = GAME_PAGES[gameId]
  return (
    <>
      <Page key={`${gameId}:${day}`} day={day} today={today} isArchive={isArchive} />
      {!isArchive && day !== today && <NewPuzzleNotice href={gameById(gameId).path} />}
    </>
  )
}

/** Shown when the UTC day rolls over while a game is open. A full load picks up the new day. */
function NewPuzzleNotice({ href }: { href: string }) {
  return (
    <div role="status" className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md animate-rise items-center gap-4 rounded-2xl bg-raised p-2 pl-4 shadow-2xl shadow-black/60 ring-1 ring-line">
      <p className="flex-1 font-medium">A new puzzle is out.</p>
      <a href={href} className={buttonClass('primary', 'min-h-12 px-4 text-base')}>
        Play
        <ArrowRight />
      </a>
    </div>
  )
}

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-5xl font-bold tracking-tight">Miss.</h1>
      <p className="mt-4 text-lg text-muted">That page isn’t here.</p>
      <Link to="/" className={buttonClass('primary', 'mt-8')}>
        Today’s games
        <ArrowRight />
      </Link>
    </div>
  )
}

export function App() {
  const pathname = usePathname()
  const today = useToday()
  const route = resolveRoute(parseRoute(pathname), today)
  const title = pageTitle(route)

  useEffect(() => {
    document.title = title
  }, [title])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-pink focus:px-4 focus:py-2 focus:font-semibold focus:text-pink-ink"
      >
        Skip to content
      </a>
      {route.page !== 'game' && <SiteHeader />}
      <main id="main" className="flex-1">
        {route.page === 'home' && <HomePage today={today} />}
        {route.page === 'archive' && <ArchivePage today={today} />}
        {route.page === 'game' && <GameRoute gameId={route.gameId} puzzleNumber={route.puzzleNumber} today={today} />}
        {route.page === 'not-found' && <NotFound />}
      </main>
      <SiteFooter narrow={route.page === 'game'} />
    </div>
  )
}

function SiteHeader() {
  return (
    <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:h-20 sm:px-6">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight" aria-label="osu! daily home">
        <Mark />
        <span>
          osu! <span className="text-pink">daily</span>
        </span>
      </Link>
      <Link to="/archive" className="rounded-full px-4 py-2 font-medium text-muted transition-colors hover:bg-white/5 hover:text-fg">
        Archive
      </Link>
    </header>
  )
}

/** Original mark: a filled dot inside a ring, like a target to click. */
function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
      <circle cx="16" cy="16" r="13" fill="none" stroke="var(--color-pink)" strokeWidth="3.5" />
      <circle cx="16" cy="16" r="5.5" fill="var(--color-fg)" />
    </svg>
  )
}
