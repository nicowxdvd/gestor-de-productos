import { useState } from "react"
import { useCreateProductsMutation, useDeleteProductMutation, useProductsQuery, useUpdateProductMutation } from "./hooks/useProducts"
import { PAGE_SIZE } from "./api/products"
import type { Product, ProductInput } from "./types/products"
import { ProductsTable } from "./components/ProductsTable"
import { ProductFormModal } from "./components/ProductFormModal"



export const MyCRUD = () => {

  const [page, setPage] = useState(1)

  const { data, isLoading, isError, isPlaceholderData } = useProductsQuery(page)
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))
  const createProduct = useCreateProductsMutation()
  const updateProduct = useUpdateProductMutation()
  const deleteProduct = useDeleteProductMutation()

  const [modalOpen, setModalOpen ]          = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [actionError, setActionError]       = useState<string | null>(null)



  function openCreateModal(){
    setEditingProduct(null)
    setModalOpen(true)
  }



  function openEditModal(product: Product) {
    setEditingProduct(product)
    setModalOpen(true)
  }



  function closeModal() {
    setModalOpen(false)
    setEditingProduct(null)
  }



  function handleSubmit(input: ProductInput){
    const onSuccess = () =>{
      setActionError(null)
      closeModal()
    }

    const onError = () =>{
      setActionError('No se pudo guardar el producto. Intentá de nuevo.')
    }

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, input }, { onSuccess, onError })
    } else {
      createProduct.mutate(input, { onSuccess, onError })
    }

  }

  

  function handleDelete(id:number){
    deleteProduct.mutate(id,{
      onSuccess: () => {
        setActionError(null)
        if (page > 1 && data?.items.length === 1) setPage(page - 1)
      },
      onError: () => setActionError('No se pudo eliminar el producto. Intentá de nuevo.'),
    })
  }

  

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Productos</h1>
          <button type="button" onClick={openCreateModal} className="rounded bg-purple-600 px-4 py-2 text-sm hover:bg-purple-500">Nuevo Producto</button>
        </div>
        
        {isLoading && <p className="text-slate-400">Cargando productos...</p>}
        {isError && <p className="text-red-400">Error al cargar productos.</p>}
        {actionError && <p className="mb-4 text-red-400">{actionError}</p>}

        {
          data && (
            <ProductsTable
              products={data.items}
              onEdit={openEditModal}
              onDelete={handleDelete}
              pendingDeleteId={deleteProduct.isPending ? (deleteProduct.variables ?? null) : null}
            
            />
          )
        }

        {
          data && (
            <div className="mt-4 flex items-center justify-end gap-3 text-sm">
              <button
                type      = "button"
                onClick   = {() => setPage(page - 1)}
                disabled  = {page === 1 || isPlaceholderData}
                className = "rounded bg-slate-700 px-4 py-2 hover:bg-slate-600 disabled:opacity-50">
                Anterior
              </button>
              <span className="text-slate-300">Página {page} de {totalPages}</span>
              <button
                type      = "button"
                onClick   = {() => setPage(page + 1)}
                disabled  = {page >= totalPages || isPlaceholderData}
                className = "rounded bg-slate-700 px-4 py-2 hover:bg-slate-600 disabled:opacity-50">
                Siguiente
              </button>
            </div>
          )
        }


      </div>

      {
        modalOpen && (
        <ProductFormModal
          key       ={editingProduct?.id ?? 'new'}
          product   ={editingProduct}
          onClose   ={closeModal}
          onSubmit  ={handleSubmit}
          isPending ={createProduct.isPending || updateProduct.isPending}
        />
      )}

    </main>
  )
}
