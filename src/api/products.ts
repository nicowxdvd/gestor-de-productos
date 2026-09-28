import { productSchema, type Product,  type ProductInput } from "../types/products"

const BASE_URL = 'https://my-json-server.typicode.com/nicowxdvd/gProducts/products'


export async function fetchProducts(): Promise<Product[]>{
    const res = await fetch(BASE_URL)
    if(!res.ok)
        throw new Error('No se pudo obtener los productos')

    const data = await res.json()
    return productSchema.array().parse(data)

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