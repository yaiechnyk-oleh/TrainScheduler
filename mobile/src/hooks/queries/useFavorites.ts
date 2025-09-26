import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addFavorite, getFavorites, removeFavorite } from "../../services/favorites.api"
import type { Favorite } from "../../types/api"

export const favoritesKey = ["favorites"] as const

type AnyFavorite = Partial<Favorite> & {
    id?: string
    routeId?: string
    route?: { id?: string } | null
}

const getRouteId = (f: AnyFavorite | undefined | null) =>
    f?.routeId ?? f?.route?.id ?? null

export function useFavorites() {
    return useQuery({
        queryKey: favoritesKey,
        queryFn: () => getFavorites(),
        select: (raw: AnyFavorite[] = []) =>
            raw
                .map((f) => ({
                    ...f,
                    routeId: getRouteId(f) || "",
                }))
                .filter((f) => !!f.routeId) as Favorite[],
    })
}

export function useFavoritesMutations() {
    const qc = useQueryClient()

    const addM = useMutation({
        mutationFn: (routeId: string) => addFavorite(routeId),

        // optimistic update
        onMutate: async (routeId) => {
            await qc.cancelQueries({ queryKey: favoritesKey })
            const previous = qc.getQueryData<AnyFavorite[]>(favoritesKey)

            const optimistic: AnyFavorite = {
                id: `optimistic_${Date.now()}`,
                routeId,
                route: { id: routeId } as any,
            }

            qc.setQueryData<AnyFavorite[]>(favoritesKey, (old = []) => {
                if (old.some((f) => getRouteId(f) === routeId)) return old
                return [optimistic, ...old]
            })

            return { previous }
        },

        onError: (_err, _vars, ctx) => {
            if (ctx?.previous) qc.setQueryData(favoritesKey, ctx.previous)
        },

        onSettled: () => {
            qc.invalidateQueries({ queryKey: favoritesKey })
        },
    })

    const removeM = useMutation({
        mutationFn: (routeId: string) => removeFavorite(routeId),

        onMutate: async (routeId) => {
            await qc.cancelQueries({ queryKey: favoritesKey })
            const previous = qc.getQueryData<AnyFavorite[]>(favoritesKey)

            qc.setQueryData<AnyFavorite[]>(favoritesKey, (old = []) =>
                old.filter((f) => getRouteId(f) !== routeId),
            )

            return { previous }
        },

        onError: (_err, _vars, ctx) => {
            if (ctx?.previous) qc.setQueryData(favoritesKey, ctx.previous)
        },

        onSettled: () => {
            qc.invalidateQueries({ queryKey: favoritesKey })
        },
    })

    return { addM, removeM }
}
