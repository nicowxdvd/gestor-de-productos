import z from "zod";

export const productSchema = z.object({
    id       : z.number(),
    name     : z.string().trim().min(1, { error: 'El nombre es obligatorio' }),
    price    : z.number({ error: 'El precio debe ser un número' }).positive({ error: 'El precio debe ser mayor a 0' }),
    stock    : z.number({ error: 'El stock debe ser un número' }).int({ error: 'El stock debe ser un número entero' }).nonnegative({ error: 'El stock no puede ser negativo' }),
    category : z.string().trim().min(1, { error: 'La categoría es obligatoria' })
})

export const productInputSchema = productSchema.omit({ id: true })

export type Product      = z.infer<typeof productSchema>
export type ProductInput = z.infer<typeof productInputSchema>

export type ProductsPage = {
    items : Product[]
    total : number
}
