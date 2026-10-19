import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
  UserCheck,
} from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !senha) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, informe o e-mail corporativo e sua senha.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const user = await login(email, senha)
      toast({
        title: `Bem-vindo(a), ${user.nome}!`,
        description: `Acesso autenticado com perfil de ${user.papel === 'admin' ? 'Administrador' : 'Funcionário'}.`,
      })

      if (redirectTo) {
        navigate(redirectTo, { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err: any) {
      toast({
        title: 'Falha no acesso',
        description: err.message || 'Verifique suas credenciais corporativas.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail)
    setSenha('123456')
  }

  return (
    <div className="min-h-[82vh] flex flex-col items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-card border border-slate-200">
        {/* Banner de Sistema Fechado B2B */}
        <div className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mx-auto w-full justify-center border border-slate-200">
          <Building2 className="w-3.5 h-3.5 text-green-600" />
          <span>Sistema Fechado — Uso Interno da Empresa</span>
        </div>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-green-600 to-emerald-500 flex items-center justify-center text-white mx-auto shadow-md shadow-green-600/20 mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Serviço<span className="text-green-600">Já</span>
          </h1>
          <p className="text-sm font-semibold text-slate-700 mt-1">
            Painel Corporativo de Busca de Profissionais
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Acesso restrito — somente funcionários autorizados.
          </p>
        </div>

        {/* Warning Badge */}
        <div className="mb-5 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
          <span className="font-bold text-amber-700 mt-0.5">⚠️</span>
          <div>
            <strong>Acesso corporativo:</strong> Não é permitido cadastro público. Contas de
            funcionários são geradas exclusivamente pela administração da empresa.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              E-mail do Funcionário
            </Label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.nome@empresa.com"
                className="pl-10 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="senha"
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Senha de Acesso
              </Label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                id="senha"
                type={showPassword ? 'text' : 'password'}
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••"
                className="pl-10 pr-10 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 rounded-xl shadow-md transition mt-2"
          >
            {loading ? 'Validando acesso...' : 'Entrar no Sistema'}
          </Button>
        </form>

        {/* Demo Fast Login Box */}
        <div className="mt-6 pt-5 border-t border-slate-100 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Contas de Demonstração
            </span>
            <span className="text-[11px] font-semibold text-green-700 bg-green-100/80 px-2 py-0.5 rounded-full">
              Senha: 123456
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@empresa.com')}
              className={`text-left p-2.5 rounded-xl border transition flex flex-col gap-1 shadow-xs ${
                email === 'admin@empresa.com'
                  ? 'bg-green-50 border-green-500 text-green-950'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  Dono / Admin
                </span>
                {email === 'admin@empresa.com' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                )}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">admin@empresa.com</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('funcionario@empresa.com')}
              className={`text-left p-2.5 rounded-xl border transition flex flex-col gap-1 shadow-xs ${
                email === 'funcionario@empresa.com'
                  ? 'bg-green-50 border-green-500 text-green-950'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  Funcionário
                </span>
                {email === 'funcionario@empresa.com' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                )}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">funcionario@empresa.com</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 mt-5 leading-relaxed">
          Problemas de acesso? Solicite apoio ao responsável técnico da empresa.
        </div>
      </div>
    </div>
  )
}
