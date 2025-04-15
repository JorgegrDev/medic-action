"use client"

import { useState } from "react"
import { Home, Bell } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("activos")

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="px-4 py-3 border-b border-[#e6e6e6]">
        <h1 className="text-lg font-semibold text-[#1a1a1a]">Medic Action</h1>
      </header>

      <div className="px-4 py-2 border-b border-[#e6e6e6]">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("activos")}
            className={`pb-2 text-sm font-medium ${
              activeTab === "activos" ? "text-[#1a1a1a] border-b-2 border-[#1a1a1a]" : "text-[#686868]"
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setActiveTab("entregados")}
            className={`pb-2 text-sm font-medium ${
              activeTab === "entregados" ? "text-[#1a1a1a] border-b-2 border-[#1a1a1a]" : "text-[#686868]"
            }`}
          >
            Entregados
          </button>
          <button
            onClick={() => setActiveTab("todos")}
            className={`pb-2 text-sm font-medium ${
              activeTab === "todos" ? "text-[#1a1a1a] border-b-2 border-[#1a1a1a]" : "text-[#686868]"
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        {/* Content would go here based on active tab */}
        <div className="flex items-center justify-center h-full text-[#686868]">
          {activeTab === "activos" && <p>Contenido de Activos</p>}
          {activeTab === "entregados" && <p>Contenido de Entregados</p>}
          {activeTab === "todos" && <p>Contenido de Todos</p>}
        </div>
      </div>

      <footer className="border-t border-[#e6e6e6] py-3">
        <div className="flex justify-around">
          <Link href="/" className="flex flex-col items-center">
            <Home className="h-6 w-6 text-[#1a1a1a]" />
          </Link>
          <Link href="/actividad" className="flex flex-col items-center">
            <Bell className="h-6 w-6 text-[#686868]" />
          </Link>
        </div>
      </footer>
    </div>
  )
}
