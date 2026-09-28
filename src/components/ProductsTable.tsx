import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import type { Product } from "../types/products"




interface ProductsTableProps{
  products: Product[]
  onEdit: (Product: Product) => void
  onDelete:(id: number) => void
  pendingDeleteId: number | null
}



const columnHelper      = createColumnHelper<Product>()
const currencyFormatter = new Intl.NumberFormat('es-CL', {
  style                 : 'currency',
  currency              : 'CLP',
  maximumFractionDigits : 0,
})

export const ProductsTable = ({ products, onEdit, onDelete, pendingDeleteId }: ProductsTableProps) => {
  const columns = [
    columnHelper.accessor('name', {header: 'Nombre'}),
    columnHelper.accessor('price',{header: 'Precio', cell: (info) => currencyFormatter.format(info.getValue()) }),
    columnHelper.accessor('stock',{header: 'Stock'}),
    columnHelper.display({id:'actions', header:'Action', 
      cell: (info) => (
        <div className="flex gap-2">
          <button type="button" className="rounded bg-slate-700 px-3 py-1 text-sm hover:bg-slate-600" onClick={() => onEdit(info.row.original)}>Editar</button>
          <button type="button" onClick={() => onDelete(info.row.original.id)} disabled={pendingDeleteId === info.row.original.id} className="rounded bg-red-700 px-3 py-1 text-sm hover:bg-red-600 disabled:opacity-50">
            {pendingDeleteId === info.row.original.id ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      )
    }),
  ]

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel()
  })


  return (
    <table className="w-full border-collapse text-left">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="border-b border-slate-700">
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="p-3 text-sm font-semibold text-slate-300">
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="border-b border-slate-800">
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="p-3 text-sm">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}


