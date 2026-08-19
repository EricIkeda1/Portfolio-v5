export type ProjectInput = {
  name: string
  type: string
  description: string
  tags: string[]
  highlights: string[]
  github: string
  color: string
  image_url: string | null
  sort_order: number
}

function stringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 20)
}

export function parseProjectInput(body: unknown): ProjectInput {
  const data = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  const name = String(data.name ?? '').trim()
  const type = String(data.type ?? '').trim()
  const description = String(data.description ?? '').trim()
  const github = String(data.github ?? '').trim()
  const color = String(data.color ?? '#4285FF').trim()
  const imageUrl = String(data.image_url ?? '').trim()
  const sortOrder = Number(data.sort_order ?? 1)

  if (!name || !type || !description || !github) {
    throw new Error('Nome, tipo, descrição e link do projeto são obrigatórios.')
  }

  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    throw new Error('A cor deve estar no formato hexadecimal, por exemplo #4285FF.')
  }

  if (!Number.isFinite(sortOrder) || sortOrder < 1) {
    throw new Error('A ordem do projeto deve ser maior ou igual a 1.')
  }

  return {
    name: name.slice(0, 160),
    type: type.slice(0, 120),
    description: description.slice(0, 5000),
    tags: stringArray(data.tags),
    highlights: stringArray(data.highlights),
    github: github.slice(0, 1000),
    color,
    image_url: imageUrl ? imageUrl.slice(0, 2000) : null,
    sort_order: Math.trunc(sortOrder),
  }
}
