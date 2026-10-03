import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MyCRUD } from './MyCRUD.tsx'
import { ApiError } from './api/errors.ts'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const isClientError = error instanceof ApiError && error.status !== null && error.status < 500
        return !isClientError && failureCount < 1
      },
    },
    mutations: { retry: false },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
       <MyCRUD />
    </QueryClientProvider>
  </StrictMode>,
)
