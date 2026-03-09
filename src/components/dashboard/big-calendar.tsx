"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

import { DemandCard } from "./demand-card"
import { Demand } from "@/lib/data"

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

import { NewDemandDialog } from "@/components/demands/new-demand-dialog"
import { Plus } from "lucide-react"

interface BigCalendarProps {
    demands: Demand[]
    onUpdateDemand?: (demand: Demand) => void
    initialClients?: any[]
}

export function BigCalendar({ demands, onUpdateDemand, initialClients }: BigCalendarProps) {
    const [currentDate, setCurrentDate] = React.useState(new Date())
    const [viewMode, setViewMode] = React.useState<'month' | 'week'>('month')

    // Helper to get days in month
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()
        const days = []
        for (let i = 0; i < startingDayOfWeek; i++) { days.push({ day: null, currentMonth: false, date: null }) }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                currentMonth: true,
                date: new Date(year, month, i)
            })
        }
        while (days.length % 7 !== 0) { days.push({ day: null, currentMonth: false, date: null }) }
        return days
    }

    // Helper to get days in week
    const getDaysInWeek = (date: Date) => {
        const d = new Date(date)
        const day = d.getDay()
        const diff = d.getDate() - day // adjust to Sunday
        const sunday = new Date(d.setDate(diff))
        const days = []
        for (let i = 0; i < 7; i++) {
            const nextDay = new Date(sunday)
            nextDay.setDate(sunday.getDate() + i)
            days.push({
                day: nextDay.getDate(),
                currentMonth: nextDay.getMonth() === currentDate.getMonth(),
                date: nextDay
            })
        }
        return days
    }

    const calendarDays = viewMode === 'month' ? getDaysInMonth(currentDate) : getDaysInWeek(currentDate)
    const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

    const previous = () => {
        if (viewMode === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
        } else {
            const newDate = new Date(currentDate)
            newDate.setDate(currentDate.getDate() - 7)
            setCurrentDate(newDate)
        }
    }

    const next = () => {
        if (viewMode === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
        } else {
            const newDate = new Date(currentDate)
            newDate.setDate(currentDate.getDate() + 7)
            setCurrentDate(newDate)
        }
    }

    return (
        <div className="flex flex-col h-full bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-card">
                <div className="flex items-center gap-6">
                    <h2 className="text-2xl font-bold capitalize tracking-tight text-foreground/90 min-w-[200px]">
                        {monthName}
                    </h2>
                    <div className="flex items-center p-1 rounded-lg border border-border bg-muted/30 gap-1">
                        <Button variant="ghost" size="icon" onClick={previous} className="h-7 w-7 hover:bg-muted text-muted-foreground">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentDate(new Date())}
                            className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                        >
                            Hoje
                        </Button>
                        <Button variant="ghost" size="icon" onClick={next} className="h-7 w-7 hover:bg-muted text-muted-foreground">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center p-1 rounded-xl border border-border bg-muted/20">
                    <Button
                        variant={viewMode === 'month' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('month')}
                        className={cn(
                            "h-8 px-4 text-xs font-bold uppercase tracking-widest transition-all",
                            viewMode === 'month' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Mês
                    </Button>
                    <Button
                        variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('week')}
                        className={cn(
                            "h-8 px-4 text-xs font-bold uppercase tracking-widest transition-all",
                            viewMode === 'week' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Semana
                    </Button>
                </div>
            </div>

            {/* Grid Header */}
            <div className="grid grid-cols-7 border-b border-border bg-muted/10">
                {DAYS.map(day => (
                    <div key={day} className="py-2 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid Body */}
            <div className={cn(
                "grid grid-cols-7 flex-1 overflow-hidden bg-card",
                viewMode === 'month' ? "auto-rows-[1fr]" : "auto-rows-fr"
            )}>
                {calendarDays.map((dateObj, index) => {
                    if (!dateObj.day && viewMode === 'month') return <div key={index} className="border-b border-r border-border bg-muted/5" />

                    const dayDemands = demands.filter((d: any) => {
                        return d.day === dateObj.day && dateObj.currentMonth
                    })

                    const isToday = dateObj.date &&
                        new Date().getDate() === dateObj.date.getDate() &&
                        new Date().getMonth() === dateObj.date.getMonth() &&
                        new Date().getFullYear() === dateObj.date.getFullYear()

                    return (
                        <div
                            key={index}
                            className={cn(
                                "border-b border-r border-border p-2 min-h-[120px] flex flex-col gap-1 transition-all group relative",
                                isToday ? "bg-primary/[0.03] dark:bg-primary/[0.05]" : "hover:bg-muted/10",
                                !dateObj.currentMonth && viewMode === 'week' ? "opacity-30 bg-muted/20" : ""
                            )}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className={cn(
                                    "flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold",
                                    isToday ? "bg-primary text-white" : "text-muted-foreground"
                                )}>
                                    {dateObj.day}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1 mt-1 overflow-y-auto no-scrollbar max-h-full pb-8">
                                {dayDemands.map((demand: any) => (
                                    <DemandCard
                                        key={demand.id}
                                        demand={demand}
                                        onUpdate={onUpdateDemand}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
