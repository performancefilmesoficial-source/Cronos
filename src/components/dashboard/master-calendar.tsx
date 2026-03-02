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
                    {/* Filters placeholders */}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                {/* Simple Calendar View for now - will expand to full scheduler later */}
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle>Visão Mensal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border w-full flex justify-center"
                            classNames={{
                                month: "w-full space-y-4",
                                table: "w-full border-collapse space-y-1",
                                head_row: "flex w-full justify-between",
                                row: "flex w-full mt-2 justify-between",
                                cell: "text-center text-sm p-0 flex-1 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 h-24 border border-border/50",
                                day: "h-full w-full p-0 font-normal aria-selected:opacity-100 hover:bg-muted/50 transition-colors",
                            }}
                            components={{
                                DayContent: (props: any) => {
                                    const day = props.date.getDate()
                                    // Mock logic to show events on specific days
                                    const hasReels = day % 3 === 0
                                    const hasDesign = day % 4 === 0

                                    return (
                                        <div className="w-full h-full flex flex-col items-start p-1 relative group">
                                            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{day}</span>

                                            <div className="flex flex-col gap-1 w-full mt-1">
                                                {hasReels && (
                                                    <div className="text-[10px] bg-orange-500/20 text-orange-300 px-1 rounded truncate w-full">
                                                        Reels Nike
                                                    </div>
                                                )}
                                                {hasDesign && (
                                                    <div className="text-[10px] bg-blue-500/20 text-blue-300 px-1 rounded truncate w-full">
                                                        Carrossel
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                }
                            } as any}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Demandas do dia {date?.getDate()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">Nenhuma demanda selecionada.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
