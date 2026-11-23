import { useEffect, useState } from 'react'
import { useTranslation } from '../i18n/LanguageContext'

export default function DeveloperRoles() {
  const { t } = useTranslation()
  const roles = ['Desenvolvedor mobile', 'Desenvolvedor front-end', 'Desenvolvedor full stack', 'Desenvolvedor back-end'].map(t)
  const serialized = JSON.stringify(roles)
  const [text, setText] = useState(roles[0])
  useEffect(() => {
    const words: string[] = JSON.parse(serialized)
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    let timer: ReturnType<typeof setTimeout> | undefined
    let index = 0, length = words[0].length, deleting = true
    const tick = () => {
      if (media.matches || document.hidden) return
      length += deleting ? -1 : 1
      setText(words[index].slice(0, length))
      let delay = deleting ? 35 : 75
      if (length === 0) { deleting = false; index = (index + 1) % words.length; delay = 300 }
      else if (length === words[index].length && !deleting) { deleting = true; delay = 2000 }
      timer = setTimeout(tick, delay)
    }
    const sync = () => {
      clearTimeout(timer)
      if (media.matches) { setText(words.join(' · ')); return }
      setText(words[index].slice(0, length))
      if (!document.hidden) timer = setTimeout(tick, 2000)
    }
    sync()
    media.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    return () => { clearTimeout(timer); media.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync) }
  }, [serialized])
  return <p className="pf-roles"><span className="pf-rating-sr">{roles.join(', ')}</span><span aria-hidden="true">{text}<span className="pf-type-cursor"/></span></p>
}
