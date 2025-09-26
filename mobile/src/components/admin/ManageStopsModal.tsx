import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from "react-native"
import { Button } from "../ui/Button"
import { Picker } from "../ui/Picker"
import { Input } from "../ui/Input"
import { Alert } from "../ui/Alert"
import { useRoute, useRouteMutations } from "../../hooks/queries/useRoutes"
import { useStops, useStopMutations } from "../../hooks/queries/useStops"
import type { Stop } from "../../types/api"

import { Colors } from "../../constants/Colors"
import { Layout } from "../../constants/Layout"

type Props = { visible: boolean; routeId: string | null; onClose: () => void }
type LocalRouteStop = { stopId: string; order: number; minutesFromStart: number; stop?: Stop }

export const ManageStopsModal: React.FC<Props> = ({ visible, routeId, onClose }) => {
    const { data: route } = useRoute(routeId)
    const { data: allStops = [] } = useStops()
    const { setStopsM } = useRouteMutations()
    const { createM: createStopM } = useStopMutations()

    const [err, setErr] = useState<string | null>(null)
    const [ok, setOk] = useState<string | null>(null)
    const [lst, setLst] = useState<LocalRouteStop[]>([])

    useEffect(() => {
        if (!visible || !route) { setLst([]); return }
        const fromApi = (route.stops ?? []).map((rs) => ({
            stopId: rs.stop.id,
            order: rs.order,
            minutesFromStart: rs.minutesFromStart ?? 0,
            stop: rs.stop,
        }))
        setLst(fromApi.sort((a, b) => a.order - b.order))
    }, [visible, route?.id])

    const stopOptions = useMemo(
        () => allStops.map((s) => ({ label: s.city ? `${s.name} (${s.city})` : s.name, value: s.id })),
        [allStops]
    )

    const persist = async (next: LocalRouteStop[], note = "Saved") => {
        if (!routeId) return
        try {
            const payload = {
                stops: next.map(({ stopId, order, minutesFromStart }) => ({ stopId, order, minutesFromStart })),
            }
            await setStopsM.mutateAsync({ routeId, data: payload })
            setOk(note)
        } catch (e: any) {
            setErr(e?.message ?? "Failed to save")
        }
    }

    const addExisting = async (stopId: string, minutesStr: string) => {
        const minutes = parseInt(minutesStr || "0", 10)
        const nextOrder = (lst[lst.length - 1]?.order ?? 0) + 1
        const newItem: LocalRouteStop = {
            stopId,
            order: nextOrder,
            minutesFromStart: isNaN(minutes) ? 0 : minutes,
            stop: allStops.find(s => s.id === stopId),
        }
        const next = [...lst, newItem]
        setLst(next)
        await persist(next, "Stop added")
    }

    const createAndAdd = async (name: string, city?: string, code?: string) => {
        if (!name.trim()) { setErr("Stop name is required"); return }
        try {
            const created = await createStopM.mutateAsync({
                name: name.trim(),
                city: city?.trim() || undefined,
                code: code?.trim() || undefined,
            })
            await addExisting((created as any).id, "0")
        } catch (e: any) {
            setErr(e?.message ?? "Failed to create stop")
        }
    }

    const updateMinutes = async (stopId: string, minutesStr: string) => {
        const minutes = parseInt(minutesStr || "0", 10)
        const next = lst.map(i => i.stopId === stopId ? { ...i, minutesFromStart: isNaN(minutes) ? 0 : minutes } : i)
        setLst(next)
        await persist(next, "Updated")
    }

    const move = async (stopId: string, dir: "up" | "down") => {
        const idx = lst.findIndex(i => i.stopId === stopId)
        if (idx < 0) return
        const swapIdx = dir === "up" ? idx - 1 : idx + 1
        if (swapIdx < 0 || swapIdx >= lst.length) return
        const next = [...lst]
        ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
        const renum = next.map((i, i2) => ({ ...i, order: i2 + 1 }))
        setLst(renum)
        await persist(renum, "Reordered")
    }

    const remove = async (stopId: string) => {
        const next = lst.filter(i => i.stopId !== stopId).map((i, idx) => ({ ...i, order: idx + 1 }))
        setLst(next)
        await persist(next, "Removed")
    }

    const [pickId, setPickId] = useState("")
    const [pickMinutes, setPickMinutes] = useState("0")
    const [newName, setNewName] = useState("")
    const [newCity, setNewCity] = useState("")
    const [newCode, setNewCode] = useState("")

    const close = () => onClose()

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={close}><Text style={styles.cancel}>Close</Text></TouchableOpacity>
                    <Text style={styles.title}>Manage Stops</Text>
                    <View style={{ width: 60 }} />
                </View>

                <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.block}>
                        <Text style={styles.blockTitle}>Stops in route</Text>

                        {lst.length === 0 ? (
                            <Text style={{ color: Colors.textSecondary }}>No stops yet.</Text>
                        ) : (
                            lst.map((i) => (
                                <View key={i.stopId} style={{ marginBottom: Layout.spacing.md }}>
                                    <View style={styles.row}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.stopName}>
                                                {i.stop?.name ?? i.stopId}{i.stop?.city ? ` (${i.stop.city})` : ""}
                                            </Text>
                                            <Text style={styles.subtle}>Order: {i.order}</Text>
                                        </View>
                                        <View style={styles.minsBox}>
                                            <Input
                                                label="Minutes"
                                                value={String(i.minutesFromStart)}
                                                onChangeText={(t) => updateMinutes(i.stopId, t)}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.actionsRow}>
                                        <Button title="↑" variant="outline" onPress={() => move(i.stopId, "up")} style={[styles.action, styles.small]} />
                                        <Button title="↓" variant="outline" onPress={() => move(i.stopId, "down")} style={[styles.action, styles.small]} />
                                        <Button title="Remove" variant="outline" onPress={() => remove(i.stopId)} style={[styles.action, styles.large]} />
                                    </View>
                                </View>
                            ))
                        )}
                    </View>

                    <View style={styles.block}>
                        <Text style={styles.blockTitle}>Add existing stop</Text>
                        <Picker label="Stop" value={pickId} options={stopOptions} onValueChange={setPickId} placeholder="Select stop" />
                        <Input label="Minutes from start" value={pickMinutes} onChangeText={setPickMinutes} keyboardType="numeric" />
                        <Button title="Add" onPress={() => pickId && addExisting(pickId, pickMinutes)} />
                    </View>

                    <View style={styles.block}>
                        <Text style={styles.blockTitle}>Create new stop</Text>
                        <Input label="Name" value={newName} onChangeText={setNewName} placeholder="Central Station" />
                        <Input label="City (optional)" value={newCity} onChangeText={setNewCity} placeholder="Kyiv" />
                        <Input label="Code (optional)" value={newCode} onChangeText={setNewCode} placeholder="KV-CEN" />
                        <Button title="Create & Add" onPress={() => createAndAdd(newName, newCity, newCode)} />
                    </View>
                </ScrollView>

                <Alert visible={!!err} title="Error" message={err ?? ""} type="error" onClose={() => setErr(null)} />
                <Alert visible={!!ok} title="Success" message={ok ?? ""} type="success" onClose={() => setOk(null)} />
            </View>
        </Modal>
    )
}

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.surfaceSecondary,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.sm + Layout.spacing.xs,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    cancel: {
        fontSize: Layout.fontSize.md,
        color: Colors.info,
    },
    title: {
        fontSize: Layout.fontSize.lg,
        fontWeight: "600",
        color: Colors.text,
    },
    content: {
        flex: 1,
        padding: Layout.spacing.md,
    },
    block: {
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        padding: Layout.spacing.sm + Layout.spacing.xs,
        marginBottom: Layout.spacing.sm + Layout.spacing.xs,
    },
    blockTitle: {
        fontSize: Layout.fontSize.md,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: Layout.spacing.sm,
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: Layout.spacing.sm,
        marginBottom: 10,
    },
    stopName: {
        fontSize: Layout.fontSize.sm,
        fontWeight: "600",
        color: Colors.text,
    },
    subtle: {
        fontSize: Layout.fontSize.xs,
        color: Colors.textSecondary,
    },
    minsBox: {
        width: 110,
    },

    actionsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Layout.spacing.md,
        marginTop: Layout.spacing.sm,
    },
    action: {
        height: 44,
        borderRadius: Layout.borderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.accent,
        backgroundColor: Colors.surface,
        alignItems: "center",
        justifyContent: "center",
        flexBasis: 0,
    },
    small: {
        flex: 1,
        paddingHorizontal: Layout.spacing.sm,
    },
    large: {
        flex: 2,
        paddingHorizontal: Layout.spacing.md,
    },
})
