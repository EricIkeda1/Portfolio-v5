import type { PortfolioProject } from '@/lib/portfolio'
import { isMobileProject } from '@/lib/projectPresentation'
import { ProjectCover } from './ProjectCover'

export function DeviceShowcase({ project, compact = false }: { project?: PortfolioProject; compact?: boolean }) {
  const mobile = project ? isMobileProject(project) : false
  const cover = (phone = false) => project ? <ProjectCover project={project} index={0} mobile={phone} eager={!compact} /> : <div className="device-loading">EYI<span>Projetos & experiências digitais</span></div>
  return <div className={`device-showcase ${compact ? 'is-compact' : ''} ${mobile ? 'mobile-project' : 'web-project'}`}>
    {mobile ? <div className="phone-device secondary-phone" aria-hidden="true"><div className="phone-camera" /><div className="phone-screen">{cover(true)}</div></div> : <div className="laptop-device"><div className="laptop-display"><div className="device-camera" aria-hidden="true" /><div className="laptop-screen">{cover()}</div></div><div className="laptop-base" aria-hidden="true" /></div>}
    <div className="phone-device primary-phone" aria-hidden={!mobile}><div className="phone-camera" /><div className="phone-screen">{cover(true)}</div></div>
  </div>
}
