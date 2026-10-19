import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 mb-2">Página não encontrada</h1>
      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
        O link que você tentou acessar não existe no sistema corporativo ServiçoJá ou foi
        descontinuado.
      </p>
      <Button asChild className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl">
        <Link to="/" className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          <span>Voltar à Busca de Profissionais</span>
        </Link>
      </Button>
    </div>
  )
}
