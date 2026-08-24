export function allowMethods(req: any, res: any, methods: string[]) {
  if (!methods.includes(req.method)) {
    res.setHeader('Allow', methods.join(', '))
    res.status(405).json({ error: 'Método não permitido.' })
    return false
  }
  return true
}

export function noStore(res: any) {
  res.setHeader('Cache-Control', 'no-store, max-age=0')
}

export function messageFromError(error: unknown) {
  return error instanceof Error ? error.message : 'Erro inesperado no servidor.'
}
