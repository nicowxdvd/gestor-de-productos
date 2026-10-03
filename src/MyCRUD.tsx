import { useState } from "react"
import { useCreateProductsMutation, useDeleteProductMutation, useProductsQuery, useUpdateProductMutation } from "./hooks/useProducts"
import { PAGE_SIZE } from "./api/products"
import type { Product, ProductInput } from "./types/products"
import { ProductsTable } from "./components/ProductsTable"
import { ProductFormModal } from "./components/ProductFormModal"
import { ErrorState } from "./components/ErrorState"
import { getErrorMessage } from "./api/errors"



export const MyCRUD = () => {

  const [page, setPage] = useState(1)

  const { data, error, isLoading, isError, isFetching, isPlaceholderData, refetch } = useProductsQuery(page)
  const totalPages    = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))
  const createProduct = useCreateProductsMutation()
  const updateProduct = useUpdateProductMutation()
  const deleteProduct = useDeleteProductMutation()

  const [modalOpen, setModalOpen ]          = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [submitError, setSubmitError]       = useState<string | null>(null)
  const [deleteError, setDeleteError]       = useState<string | null>(null)



  function changePage(next: number) {
    setDeleteError(null)
    setPage(next)
  }



  function openCreateModal(){
    setSubmitError(null)
    setEditingProduct(null)
    setModalOpen(true)
  }



  function openEditModal(product: Product) {
    setSubmitError(null)
    setEditingProduct(product)
    setModalOpen(true)
  }



  function closeModal() {
    setSubmitError(null)
    setModalOpen(false)
    setEditingProduct(null)
  }



  function handleSubmit(input: ProductInput){
    const onSuccess = () =>{
      closeModal()
    }

    const onError = (err: Error) =>{
      setSubmitError(getErrorMessage(err, 'No se pudo guardar el producto. Intentá de nuevo.'))
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
        setDeleteError(null)
        if (page > 1 && data?.items.length === 1)
          setPage(page - 1)
      },
      onError: (err) => setDeleteError(getErrorMessage(err, 'No se pudo eliminar el producto. Intentá de nuevo.')),
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
        {isError && !data && (
          <ErrorState
            title      = "No se pudieron cargar los productos"
            message    = {getErrorMessage(error, 'Error desconocido')}
            onRetry    = {() => refetch()}
            isRetrying = {isFetching}
          />
        )}
        {isError && data && (
          <div className="mb-4 flex items-center justify-between rounded border border-yellow-500/50 bg-yellow-950/30 p-3 text-sm text-yellow-300">
            <span>Mostrando datos anteriores: {getErrorMessage(error, 'Error desconocido')}</span>
            <button type="button" onClick={() => refetch()} disabled={isFetching} className="rounded bg-slate-700 px-3 py-1 hover:bg-slate-600 disabled:opacity-50">Reintentar</button>
          </div>
        )}
        {deleteError && (
          <div className="mb-4 flex items-center justify-between rounded border border-red-500/50 bg-red-950/30 p-3 text-sm text-red-400">
            <span>{deleteError}</span>
            <button type="button" onClick={() => setDeleteError(null)} aria-label="Cerrar">×</button>
          </div>
        )}

        {
          data && (
            <ProductsTable
              products        = {data.items}
              onEdit          = {openEditModal}
              onDelete        = {handleDelete}
              pendingDeleteId = {deleteProduct.isPending ? (deleteProduct.variables ?? null) : null}
            
            />
          )
        }

        {
          (data || isError) && (
            <div className="mt-4 flex items-center justify-end gap-3 text-sm">
              <button
                type      = "button"
                onClick   = {() => changePage(page - 1)}
                disabled  = {page === 1 || isPlaceholderData}
                className = "rounded bg-slate-700 px-4 py-2 hover:bg-slate-600 disabled:opacity-50">
                Anterior
              </button>
              <span className="text-slate-300">Página {page}{data && ` de ${totalPages}`}</span>
              <button
                type      = "button"
                onClick   = {() => changePage(page + 1)}
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
          submitError={submitError}
        />
      )}

    </main>
  )
}
