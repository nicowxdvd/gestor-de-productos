import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProducts, createProduct, updateProduct, deleteProduct } from "../api/products";
import type { ProductInput } from "../types/products";

const PRODUCT_KEY = ['products'];

export function useProductsQuery(page: number){
    return useQuery({
        queryKey: [...PRODUCT_KEY, page],
        queryFn: () => fetchProducts(page),
        placeholderData: keepPreviousData
    })
}



export function useCreateProductsMutation(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input : ProductInput) => createProduct(input),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: PRODUCT_KEY})
        }
    })
}



export function useUpdateProductMutation(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({id, input}:{id:number, input : ProductInput}) => updateProduct(id, input),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: PRODUCT_KEY})
        }
    })
}


export function useDeleteProductMutation(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => deleteProduct(id),
        onSuccess: ()=>{
            queryClient.invalidateQueries({queryKey: PRODUCT_KEY})
        }
    })
}

