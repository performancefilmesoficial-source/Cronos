import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { DemandRepository } from "@/repositories/demand-repository"
import { UserRepository } from "@/repositories/user-repository"
import { ClientRepository } from "@/repositories/client-repository"
import { DashboardViewClient } from "@/components/dashboard/dashboard-view-client"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const [demands, users, clients] = await Promise.all([
    DemandRepository.getAll(),
    UserRepository.getAll(),
    ClientRepository.getAll()
  ])

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <SidebarNav />
      <DashboardViewClient
        initialDemands={demands}
        initialUsers={users}
        initialClients={clients}
      />
    </div>
  )
}
