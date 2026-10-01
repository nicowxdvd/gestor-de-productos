import { productSchema, type Product,  type ProductInput, type ProductsPage } from "../types/products"

const BASE_URL = 'https://my-json-server.typicode.com/nicowxdvd/gProducts/products'

export const PAGE_SIZE = 10


export async function fetchProducts(page: number): Promise<ProductsPage>{
    const res = await fetch(`${BASE_URL}?_page=${page}&_limit=${PAGE_SIZE}`)
    if(!res.ok)
        throw new Error('No se pudo obtener los productos')

    const totalHeader = res.headers.get('X-Total-Count')
    const total = totalHeader === null || totalHeader.trim() === '' ? NaN : Number(totalHeader)
    if(!Number.isFinite(total))
        throw new Error('Falta el header X-Total-Count en la respuesta')

    const data = await res.json()
    return { items: productSchema.array().parse(data), total }

}



export async function createProduct( input:ProductInput ): Promise<Product> {
    const res = await fetch(BASE_URL,{
        method  :'POST',
        headers : { 'Content-Type': 'application/json' },
        body    : JSON.stringify(input)
    })

    if(!res.ok)
        throw new Error('No se pudo crear el producto')

    const data = await res.json()
    return productSchema.parse(data)
}



export async function updateProduct(id:number, input: ProductInput): Promise<Product> {
    const res = await fetch(`${BASE_URL}/${id}`,{
        method  : 'PUT',
        headers : { 'Content-Type': 'application/json' },
        body    : JSON.stringify(input)
    })

    if(!res.ok)
        throw new Error('No se pudo actualizar el producto')

    const data = await res.json()
    return productSchema.parse(data) 
    
}



export async function deleteProduct(id:number): Promise<void>{
    const res = await fetch(`${BASE_URL}/${id}`,{
        method: 'DELETE'
    })

    if(!res.ok)
        throw new Error('No se pudo eliminar el producto')
}