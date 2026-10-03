import type { ZodType } from 'zod'

export type ApiErrorKind = 'http' | 'network' | 'parse' | 'schema'

export class ApiError extends Error {
    status : number | null
    kind   : ApiErrorKind

    constructor(message: string, status: number | null, kind: ApiErrorKind) {
        super(message)
        this.name   = 'ApiError'
        this.status = status
        this.kind   = kind
    }
}



function statusText(status: number): string {
    if (status === 404) return 'no encontrado'
    if (status >= 500)  return 'error del servidor'
    return 'solicitud inválida'
}



async function readErrorDetail(res: Response): Promise<string | null> {
    try {
        const text = await res.text()
        if (!text) return null

        try {
            const body = JSON.parse(text)
            if (typeof body?.message === 'string') return body.message
            if (typeof body?.error === 'string')   return body.error
        } catch {
            return text.slice(0, 200)
        }
        return null
    } catch {
        return null
    }
}



export async function request(url: string, init: RequestInit | undefined, fallbackMessage: string): Promise<Response> {
    let res: Response
    try {
        res = await fetch(url, init)
    } catch {
        throw new ApiError('No hay conexión con el servidor', null, 'network')
    }

    if (!res.ok) {
        const detail = (await readErrorDetail(res)) ?? statusText(res.status)
        throw new ApiError(`${fallbackMessage} (${res.status}): ${detail}`, res.status, 'http')
    }

    return res
}



export async function readJson(res: Response): Promise<unknown> {
    try {
        return await res.json()
    } catch {
        throw new ApiError('La respuesta del servidor no es JSON válido', res.status, 'parse')
    }
}



export function parseWith<T>(schema: ZodType<T>, data: unknown, status: number): T {
    const result = schema.safeParse(data)
    if (!result.success) {
        console.error('Respuesta con formato inesperado', result.error.issues)
        throw new ApiError('La respuesta del servidor tiene un formato inesperado', status, 'schema')
    }
    return result.data
}



export function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback
}
