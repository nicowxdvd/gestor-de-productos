# SPEC 01 — Paginación en el listado de productos

> **Estado:** Implementado
> **Depende de:** ninguna (no hay otras specs en `specs/`)
> **Fecha:** 2026-09-30
> **Objetivo:** Paginar el listado de productos pidiendo una página a la vez al endpoint remoto y navegando con botones "Anterior" / "Siguiente".

---

## Alcance

**Incluye:**

- `fetchProducts` recibe el número de página, envía `_page` y `_limit` al endpoint y lee el total desde el header `X-Total-Count`.
- Tamaño de página fijo: constante `PAGE_SIZE = 10`.
- Query key por página (`['products', page]`) con `placeholderData: keepPreviousData`.
- Estado de la página actual con `useState` en `src/MyCRUD.tsx`.
- Controles "Anterior" / "Siguiente" y texto "Página X de Y", renderizados en `src/MyCRUD.tsx`.
- Retroceder una página cuando se borra el último producto de la última página.
- Ampliar `db.json` a 25 productos de prueba.

**Fuera de alcance (para futuras specs):**

- Selector de tamaño de página.
- Números de página clickeables.
- Página en la URL (query param o enrutado).
- Búsqueda, filtros u ordenamiento.
- Extraer los controles a un componente propio.
- Tests automatizados (el repo no tiene test runner).

---

## Modelo de datos

Se agrega un tipo para la respuesta paginada en `src/types/products.ts`. `Product` y `ProductInput` no cambian.

```ts
export type ProductsPage = {
    items : Product[]
    total : number
}
```

Convenciones:

- `page` empieza en 1, igual que `_page` de json-server.
- `total` es el valor numérico de `X-Total-Count`.
- Páginas totales: `Math.ceil(total / PAGE_SIZE)`.
- `PAGE_SIZE = 10` se define en `src/api/products.ts` y se exporta.

Datos de prueba: `db.json` pasa de 3 a 25 productos (ids 1 a 25, misma forma `{ id, name, price, stock, category }`). Con `PAGE_SIZE = 10` quedan 3 páginas: 10, 10 y 5 productos.

---

## Plan de implementación

1. Ampliar `db.json` a 25 productos. Prueba manual: el JSON es válido y tiene ids 1 a 25 sin repetir.
2. Agregar el tipo `ProductsPage` en `src/types/products.ts`.
3. Cambiar `fetchProducts(page)` en `src/api/products.ts`: pide `?_page=${page}&_limit=${PAGE_SIZE}`, parsea `items` con `productSchema.array()` y `total` desde `X-Total-Count`. Lanza `Error` si el header falta o no es numérico. Exportar `PAGE_SIZE`.
4. Cambiar `useProductsQuery(page)` en `src/hooks/useProducts.ts`: key `['products', page]` y `placeholderData: keepPreviousData`. Las mutaciones siguen invalidando `['products']`, que cubre todas las páginas.
5. En `src/MyCRUD.tsx`: agregar `const [page, setPage] = useState(1)`, llamar `useProductsQuery(page)` y pasar `data.items` a `ProductsTable`. Prueba manual: `npm run dev` muestra los primeros 10 productos.
6. En `src/MyCRUD.tsx`: renderizar "Anterior", "Siguiente" y "Página X de Y". "Anterior" se deshabilita en la página 1. "Siguiente" se deshabilita en la última página. Ambos se deshabilitan mientras `isPlaceholderData` es `true`.
7. En `src/MyCRUD.tsx`: en `handleDelete`, si la página actual es mayor que 1 y tiene un solo item, hacer `setPage(page - 1)` en `onSuccess`.

---

## Criterios de aceptación

- [ ] `npm run build` termina sin errores de tipos.
- [ ] `npm run lint` termina sin errores nuevos.
- [ ] Al cargar la app se hace una request con `_page=1&_limit=10` y la tabla muestra 10 productos.
- [ ] El texto muestra "Página 1 de 3" con los 25 productos de prueba.
- [ ] "Anterior" está deshabilitado en la página 1.
- [ ] Al pulsar "Siguiente" dos veces se llega a la página 3, que muestra 5 productos, y "Siguiente" queda deshabilitado.
- [ ] Al cambiar de página la tabla anterior sigue visible hasta que llega la nueva, sin mostrar "Cargando productos...".
- [ ] Durante esa transición los botones de navegación están deshabilitados.
- [ ] Crear, editar o borrar un producto invalida el listado y vuelve a pedir la página actual.
- [ ] Si la página actual tiene un solo item y es mayor que 1, borrarlo muestra la página anterior en vez de una página vacía.
- [ ] Si `X-Total-Count` falta, `isError` es `true` y se muestra "Error al cargar productos.".

---

## Decisiones

- **Sí:** `fetchProducts` devuelve `{ items, total }`. Sin el total no se pueden calcular las páginas ni deshabilitar "Siguiente".
- **No:** deducir el fin de la lista por página incompleta. Falla cuando la última página viene justo llena.
- **Sí:** `PAGE_SIZE` fijo en 10. Es lo más simple y no pide UI extra.
- **No:** selector de tamaño de página. Va en otra spec si hace falta.
- **Sí:** botones "Anterior" / "Siguiente" y "Página X de Y".
- **No:** números de página clickeables. Más UI sin necesidad con tan pocos datos.
- **Sí:** estado de la página con `useState` en `MyCRUD.tsx`, coherente con el resto del estado del contenedor.
- **No:** página en la URL. Agregaría enrutado o manejo manual de `history`.
- **Sí:** `placeholderData: keepPreviousData` para evitar el parpadeo de "Cargando...".
- **Sí:** retroceder una página al borrar el último item de la última página.
- **Sí:** los controles se renderizan en `MyCRUD.tsx`, sin archivo nuevo. Son pocas líneas y evita crear un componente que no se confirmó.
- **Sí:** error explícito si falta `X-Total-Count`. Un total inventado ocultaría un problema del servidor.
- **Sí:** ampliar `db.json` a 25 productos. Con 3 no se puede verificar la paginación.

---

## Riesgos

| Riesgo | Mitigación |
| ------ | ---------- |
| `my-json-server.typicode.com` sirve `db.json` desde la rama por defecto de GitHub, así que los datos nuevos no se ven hasta publicarlos ahí. | Hacer push del `db.json` ampliado a la rama por defecto del repo `nicowxdvd/gProducts` antes de verificar los criterios con 25 productos. |
| El servidor remoto no persiste POST, PUT ni DELETE. | El criterio de retroceso al borrar se verifica por el comportamiento del código (la página queda vacía tras la invalidación) y no por datos reales. |
| `X-Total-Count` depende de que CORS lo exponga (`access-control-expose-headers`). | Ya está expuesto hoy. Si deja de estarlo, `fetchProducts` falla con error explícito. |

---

## Qué **no** entra en esta spec

- Selector de tamaño de página.
- Números de página clickeables.
- Página en la URL.
- Búsqueda, filtros u ordenamiento.
- Componente de paginación separado.
- Tests automatizados.

Cada uno, si se hace, va en su propia spec.
