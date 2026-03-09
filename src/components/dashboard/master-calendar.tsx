"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MasterCalendar() {
    const [date, setDate] = React.useState<Date | undefined>(new Date())

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Calendário Geral</h2>
                <div className="flex gap-2">
                    {/* Filtros profissionais aqui */}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                <Card className="col-span-1 md:col-span-2 bg-black/20 border-white/5">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500">Visão Mensal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border-none w-full flex justify-center"
                            classNames={{
                                month: "w-full space-y-4",
                                table: "w-full border-collapse space-y-1",
                                head_row: "flex w-full justify-between mb-4",
                                row: "flex w-full mt-1 justify-between gap-1",
                                cell: "text-center text-sm p-0 flex-1 relative h-20 border border-white/5 rounded-xl hover:bg-white/5 transition-colors",
                                day: "h-full w-full p-2 font-normal text-left flex flex-col items-start justify-start",
                            }}
                            components={{
                                DayContent: ({ date: d }: { date: Date }) => (
                                    <div className="w-full h-full flex flex-col items-start gap-1">
                                        <span className="text-[10px] font-bold text-zinc-600">{d.getDate()}</span>
                                        {/* Posts reais aparecerão aqui vindo do banco */}
                                    </div>
                                )
                            } as any}
                        />
                    </CardContent>
                </Card>

                <Card className="bg-black/20 border-white/5">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500">Agenda do Dia</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center h-[300px] text-center">
                        <div className="p-4 rounded-full bg-white/5 mb-4">
                            <h4 className="text-2xl font-black text-white">{date?.getDate()}</h4>
                        </div>
                        <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Nenhuma demanda para este dia.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
