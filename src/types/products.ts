import z from "zod";

export const productSchema = z.object({
    id       : z.number(),
    name     : z.string().min(1),
    price    : z.number().positive(),
    stock    : z.number().int().nonnegative(),
    category : z.string().min(1)
})

export const productInputSchema = productSchema.omit({ id: true })

export type Product = z.infer<typeof productSchema>
export type ProductInput = z.infer<typeof productInputSchema>

export type ProductsPage = {
    items : Product[]
    total : number
}
