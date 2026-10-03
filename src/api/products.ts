import { productSchema, type Product,  type ProductInput, type ProductsPage } from "../types/products"
import { ApiError, parseWith, readJson, request } from "./errors"

const BASE_URL         = 'https://my-json-server.typicode.com/nicowxdvd/gProducts/products'
export const PAGE_SIZE = 10


export async function fetchProducts(page: number): Promise<ProductsPage>{
    const res = await request(`${BASE_URL}?_page=${page}&_limit=${PAGE_SIZE}`, undefined, 'No se pudo obtener los productos')

    const totalHeader = res.headers.get('X-Total-Count')
    const total = totalHeader === null || totalHeader.trim() === '' ? NaN : Number(totalHeader)
    if(!Number.isFinite(total))
        throw new ApiError('Falta el header X-Total-Count en la respuesta', res.status, 'schema')

    const data = await readJson(res)
    return { items: parseWith(productSchema.array(), data, res.status), total }

}



export async function createProduct( input:ProductInput ): Promise<Product> {
    const res = await request(BASE_URL, {
        method  : 'POST',
        headers : { 'Content-Type': 'application/json' },
        body    : JSON.stringify(input)
    }, 'No se pudo crear el producto')

    const data = await readJson(res)
    return parseWith(productSchema, data, res.status)
}



export async function updateProduct(id:number, input: ProductInput): Promise<Product> {
    const res = await request(`${BASE_URL}/${id}`, {
        method  : 'PUT',
        headers : { 'Content-Type': 'application/json' },
        body    : JSON.stringify(input)
    }, 'No se pudo actualizar el producto')

    const data = await readJson(res)
    return parseWith(productSchema, data, res.status)

}



export async function deleteProduct(id:number): Promise<void>{
    await request(`${BASE_URL}/${id}`, { method: 'DELETE' }, 'No se pudo eliminar el producto')
}
