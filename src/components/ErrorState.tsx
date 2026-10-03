interface ErrorStateProps {
    title      : string
    message    : string
    onRetry    : () => void
    isRetrying : boolean
}



export const ErrorState = ({ title, message, onRetry, isRetrying }: ErrorStateProps) => {
    return (
        <div className = "rounded border border-red-500/50 bg-red-950/30 p-4">
            <h2 className = "font-semibold text-red-400">{title}</h2>
            <p className = "mt-1 text-sm text-slate-300">{message}</p>
            <button
                type = "button"
                onClick = {onRetry}
                disabled = {isRetrying}
                className = "mt-3 rounded bg-purple-600 px-4 py-2 text-sm hover:bg-purple-500 disabled:opacity-50">
                {isRetrying ? 'Reintentando...' : 'Reintentar'}
            </button>
        </div>
    )
}
