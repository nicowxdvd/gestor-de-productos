import { useState } from 'react'
import { productInputSchema, type Product, type ProductInput } from '../types/products'


interface ProductFormModalProps {
    product     : Product | null
    onClose     : () => void
    onSubmit    : (input: ProductInput) => void
    isPending   : boolean

}



interface FormState{
    name        : string
    price       : string
    stock       : string
    category    : string
}



const emptyForm: FormState = {
    name        :'', 
    price       :'', 
    stock       :'', 
    category    :''
}



function parseEsArNumber(value: string): number{
     return Number(value.trim().replace(/\./g, '').replace(',', '.'))
}



function toFormState(product: Product | null) : FormState{
    if(!product)
        return emptyForm

    return {
        name        : product.name,
        price       : String(product.price),
        stock       : String(product.stock),
        category    : product.category,
    }
}



export const ProductFormModal = ({product, onClose, onSubmit, isPending}: ProductFormModalProps) => {
    const [form, setForm]     = useState<FormState>(()=> toFormState(product))
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    function handleChange(field: keyof FormState, value:string){
        setForm( (prev) => ({...prev, [field]:value}))
    }


    function handleSubmit(event: React.FormEvent){
        event.preventDefault()
        const result = productInputSchema.safeParse({
            name     : form.name,
            price    : parseEsArNumber(form.price),
            stock    : Number(form.stock),
            category : form.category,
        })

        if(!result.success){
            const fieldErrors: Partial<Record<keyof FormState, string>> = {}
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof FormState
                fieldErrors[field] = issue.message
            }
            setErrors(fieldErrors)
            return
        }

        setErrors({})
        onSubmit(result.data)
    }

    return (
         <div className="fixed inset-0 flex items-center justify-center bg-black/60">
            <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-slate-900 p-6 shadow-xl">
                <h2 className="mb-4 text-lg font-semibold">{product ? 'Editar producto' : 'Nuevo producto'}</h2>

                <div className="mb-3">
                    <label className="mb-1 block text-sm text-slate-300">Nombre</label>
                    <input
                        value     = {form.name}
                        onChange  = {(e) => handleChange('name', e.target.value)}
                        className = "w-full rounded border border-slate-700 bg-slate-800 p-2 text-sm"
                    />
                    { errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                </div>

                <div className="mb-3">
                    <label className="mb-1 block text-sm text-slate-300">Precio</label>
                    <input
                        value     = {form.price}
                        onChange  = {(e) => handleChange('price', e.target.value)}
                        className = "w-full rounded border border-slate-700 bg-slate-800 p-2 text-sm"
                    />
                    {errors.price && <p className="mt-1 text-xs text-red-400">{errors.price}</p>}
                    </div>

                    <div className   = "mb-3">
                    <label className = "mb-1 block text-sm text-slate-300">Stock</label>
                    <input
                        value={form.stock}
                        onChange  = {(e) => handleChange('stock', e.target.value)}
                        className = "w-full rounded border border-slate-700 bg-slate-800 p-2 text-sm"
                    />
                    {errors.stock && <p className="mt-1 text-xs text-red-400">{errors.stock}</p>}
                    </div>

                    <div className   = "mb-4">
                    <label className = "mb-1 block text-sm text-slate-300">Categoría</label>
                    <input
                        value     = {form.category}
                        onChange  = {(e) => handleChange('category', e.target.value)}
                        className = "w-full rounded border border-slate-700 bg-slate-800 p-2 text-sm"
                    />
                    {errors.category && <p className="mt-1 text-xs text-red-400">{errors.category}</p>}
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        type      = "button"
                        onClick   = {onClose}
                        disabled  = {isPending}
                        className = "rounded bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600 disabled:opacity-50">
                        Cancelar
                    </button>
                    <button
                        type      = "submit"
                        disabled  = {isPending}
                        className = "rounded bg-purple-600 px-4 py-2 text-sm hover:bg-purple-500 disabled:opacity-50">
                        {isPending ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </form>

        </div>
    )
}
