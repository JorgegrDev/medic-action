import Link from "next/link"
import { Home, Bell, Circle } from "lucide-react"

export default function ActividadPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="px-4 py-3 border-b border-[#e6e6e6]">
        <h1 className="text-lg font-semibold text-[#1a1a1a]">Actividad</h1>
        <button className="absolute right-4 top-3 px-3 py-1 text-xs font-medium bg-[#1a1a1a] text-white rounded-full">
          Filtrar
        </button>
      </header>

      <div className="flex-1 p-4">
        <div className="flex items-start space-x-3 mb-4">
          <div className="mt-1">
            <Circle className="h-2 w-2 fill-[#1a1a1a] text-[#1a1a1a]" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-[#1a1a1a]">Paracetamol</h3>
                <p className="text-sm text-[#686868]">Toma tus pastillas con agua</p>
              </div>
              <button className="px-3 py-1 text-xs font-medium bg-[#1a1a1a] text-white rounded-full">Editar</button>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-[#e6e6e6] py-3">
        <div className="flex justify-around">
          <Link href="/" className="flex flex-col items-center">
            <Home className="h-6 w-6 text-[#686868]" />
          </Link>
          <Link href="/actividad" className="flex flex-col items-center">
            <Bell className="h-6 w-6 text-[#1a1a1a]" />
            <div className="absolute h-2 w-2 bg-[#eb4335] rounded-full -mt-1 ml-3"></div>
          </Link>
        </div>
      </footer>
    </div>
  )
}
