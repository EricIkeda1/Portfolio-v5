import type { PortfolioProject } from '@/lib/portfolio'
import { ProjectCover } from './ProjectCover'

export function DeviceShowcase({ project, compact = false }: { project?: PortfolioProject; compact?: boolean }) {
  return <div className={`device-showcase ${compact ? 'is-compact' : ''}`}>
    <div className="device-aura" aria-hidden="true" />
    <div className="laptop-device"><div className="laptop-display"><div className="device-camera" aria-hidden="true" /><div className="laptop-screen">{project ? <ProjectCover project={project} index={0} eager={!compact} /> : <div className="device-loading">EYI<span>Projetos & experiências digitais</span></div>}</div></div><div className="laptop-base" aria-hidden="true" /></div>
    <div className="phone-device" aria-hidden="true"><div className="phone-camera" /><div className="phone-screen">{project ? <ProjectCover project={project} index={0} mobile eager={!compact} /> : <div className="device-loading">EYI</div>}</div></div>
    {project && <span className="device-project-label">{project.name}<span>Design que encontra a prática.</span></span>}
  </div>
}
