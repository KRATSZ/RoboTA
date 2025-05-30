// main application wrapper component
import { useRef, useEffect } from 'react'
import cx from 'classnames'
import { useLocation } from 'react-router-dom'
import { DefinitionRoute } from '../../definitions'
import { useFilters } from '../../filters'
import { Nav, Breadcrumbs } from '../Nav'
import { Sidebar } from '../Sidebar'
import { Page } from './Page'
import { LabwareList } from '../LabwareList'
import { LabwareDetails } from '../LabwareDetails'
import styles from './styles.module.css'

import type { DefinitionRouteRenderProps } from '../../definitions'

export function AppComponent(props: DefinitionRouteRenderProps): JSX.Element {
  const { definition } = props
  const location = useLocation()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const filters = useFilters(location)
  const isDetailPage = Boolean(definition)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    window.scrollTo(0, 0)
  }, [location.pathname, location.search])

  return (
    <div
      className={cx(styles.app, {
        [styles.is_detail_page]: isDetailPage,
      })}
    >
      <Nav />
      <Breadcrumbs show={isDetailPage} />
      <Page
        scrollRef={scrollRef}
        isDetailPage={isDetailPage}
        sidebar={<Sidebar filters={filters} />}
        content={
          definition ? (
            <LabwareDetails definition={definition} />
          ) : (
            <LabwareList filters={filters} />
          )
        }
      />
    </div>
  )
}

export function App(): JSX.Element {
  return <DefinitionRoute render={props => <AppComponent {...props} />} />
}
