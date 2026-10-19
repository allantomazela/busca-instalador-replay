import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/services/api'
import { Category } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  User,
  Briefcase,
  Zap,
  Upload,
  X,
  FileCheck,
  CheckCircle2,
  ShieldCheck,
  Building,
} from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const defaultPapel = searchParams.get('papel') === 'profissional' ? 'profissional' : 'cliente'
  const [papel, setPapel] = useState<'cliente' | 'profissional'>(defaultPapel)

  const [categories, setCategories] = useState<Category[]>([])

  // Common Fields
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmSenha, setConfirmSenha] = useState('')

  // Professional Specific Fields
  const [tipoAtuacao, setTipoAtuacao] = useState<'Pessoa Física' | 'MEI' | 'Empresa'>('MEI')
  const [cnpj, setCnpj] = useState('')
  const [bio, setBio] = useState('')
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>(['cameras-cftv'])
  const [raioKm, setRaioKm] = useState(30)
  const [cidade, setCidade] = useState('Belo Horizonte')
  const [uf, setUf] = useState('MG')
  const [certificados, setCertificados] = useState<{ nome: string; url?: string }[]>([
    { nome: 'Certificado_NR10_Eletrica.pdf' },
  ])

  // Real-time validation blur states
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getCategories().then((data) => setCategories(data))
  }, [])

  // Masks
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11)
    if (v.length > 6) {
      v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
    } else if (v.length > 2) {
      v = `(${v.slice(0, 2)}) ${v.slice(2)}`
    }
    setTelefone(v)
  }

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 14)
    if (v.length > 12) {
      v = `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8, 12)}-${v.slice(12)}`
    } else if (v.length > 8) {
      v = `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8)}`
    } else if (v.length > 5) {
      v = `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5)}`
    } else if (v.length > 2) {
      v = `${v.slice(0, 2)}.${v.slice(2)}`
    }
    setCnpj(v)
  }

  const handleAddCertificadoMock = () => {
    const defaultNames = [
      'Certificacao_Intelbras_CFTV_IP.pdf',
      'Treinamento_Trabalho_em_Altura_NR35.pdf',
      'Diploma_Tecnico_Eletrotécnica.pdf',
    ]
    const nextName = defaultNames[certificados.length % defaultNames.length]
    setCertificados([...certificados, { nome: nextName }])
  }

  const handleRemoveCertificado = (index: number) => {
    setCertificados(certificados.filter((_, i) => i !== index))
  }

  const handleToggleCategoria = (slug: string) => {
    if (selectedCategorias.includes(slug)) {
      if (selectedCategorias.length === 1) {
        toast({
          title: 'Atenção',
          description: 'Selecione pelo menos uma especialidade atendida.',
        })
        return
      }
      setSelectedCategorias(selectedCategorias.filter((s) => s !== slug))
    } else {
      setSelectedCategorias([...selectedCategorias, slug])
    }
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!nome.trim()) errs.nome = 'Nome completo é obrigatório.'
    if (!email.includes('@') || !email.includes('.')) errs.email = 'E-mail inválido.'
    if (telefone.replace(/\D/g, '').length < 10) errs.telefone = 'Telefone incompleto.'
    if (senha.length < 6) errs.senha = 'A senha deve conter no mínimo 6 caracteres.'
    if (senha !== confirmSenha) errs.confirmSenha = 'As senhas não coincidem.'

    if (papel === 'profissional') {
      if (!bio.trim() || bio.length < 20) {
        errs.bio = 'Descreva sua experiência em pelo menos 20 caracteres.'
      }
      if (!cidade.trim()) errs.cidade = 'Cidade é obrigatória.'
      if (selectedCategorias.length === 0) {
        errs.categorias = 'Selecione ao menos 1 categoria atendida.'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast({
        title: 'Verifique os campos destacados',
        description: 'Corrija os erros no formulário antes de continuar.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      await register({
        nome,
        email,
        telefone,
        senha,
        papel,
        profissionalData:
          papel === 'profissional'
            ? {
                tipo_atuacao: tipoAtuacao,
                cnpj,
                bio,
                categorias: selectedCategorias,
                raio_km: Number(raioKm) || 30,
                cidade,
                uf,
                certificados,
              }
            : undefined,
      })

      toast({
        title: 'Conta criada com sucesso!',
        description:
          papel === 'profissional'
            ? 'Bem-vindo ao painel profissional do ServiçoJá!'
            : 'Sua conta de cliente está pronta. Vamos iniciar seu primeiro pedido!',
      })

      if (papel === 'profissional') {
        navigate('/painel/profissional')
      } else {
        navigate('/pedido/novo')
      }
    } catch (err: any) {
      toast({
        title: 'Erro no cadastro',
        description: err.message || 'Ocorreu um erro ao criar a conta.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-2xl bg-white p-6 sm:p-10 rounded-3xl shadow-card border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-green-600 to-emerald-500 flex items-center justify-center text-white mx-auto shadow-md mb-3">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Crie sua conta no ServiçoJá
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Junte-se à maior rede de profissionais e clientes de serviços locais
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => setPapel('cliente')}
            className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
              papel === 'cliente'
                ? 'border-green-600 bg-green-50/50 shadow-md ring-2 ring-green-600/20'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2.5 ${
                papel === 'cliente' ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              <User className="w-6 h-6" />
            </div>
            <span className="font-bold text-slate-900 text-base">Sou Cliente</span>
            <span className="text-xs text-slate-500 mt-0.5">Quero solicitar orçamentos</span>
          </button>

          <button
            type="button"
            onClick={() => setPapel('profissional')}
            className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
              papel === 'profissional'
                ? 'border-green-600 bg-green-50/50 shadow-md ring-2 ring-green-600/20'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2.5 ${
                papel === 'profissional' ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="font-bold text-slate-900 text-base">Sou Profissional</span>
            <span className="text-xs text-slate-500 mt-0.5">Quero prestar serviços</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Base Fields (Always required) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              Informações Pessoais e Acesso
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Carlos Alberto Lima"
                  className="rounded-xl"
                />
                {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos@exemplo.com"
                  className="rounded-xl"
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="telefone">WhatsApp / Telefone *</Label>
                <Input
                  id="telefone"
                  required
                  value={telefone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="rounded-xl"
                />
                {errors.telefone && <p className="text-xs text-red-500">{errors.telefone}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="senha">Senha (mínimo 6 caracteres) *</Label>
                <Input
                  id="senha"
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••"
                  className="rounded-xl"
                />
                {errors.senha && <p className="text-xs text-red-500">{errors.senha}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmSenha">Confirmar Senha *</Label>
                <Input
                  id="confirmSenha"
                  type="password"
                  required
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                  placeholder="••••••"
                  className="rounded-xl"
                />
                {errors.confirmSenha && (
                  <p className="text-xs text-red-500">{errors.confirmSenha}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Specific Section */}
          {papel === 'profissional' && (
            <div className="space-y-5 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-green-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Dados Profissionais e Região
              </h3>

              {/* Tipo Atuacao */}
              <div className="space-y-1.5">
                <Label>Tipo de Atuação</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Pessoa Física', 'MEI', 'Empresa'] as const).map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setTipoAtuacao(tipo)}
                      className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition ${
                        tipoAtuacao === tipo
                          ? 'border-green-600 bg-green-50 text-green-800'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>

              {tipoAtuacao !== 'Pessoa Física' && (
                <div className="space-y-1.5">
                  <Label htmlFor="cnpj">CNPJ (Opcional)</Label>
                  <Input
                    id="cnpj"
                    value={cnpj}
                    onChange={handleCnpjChange}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    className="rounded-xl"
                  />
                </div>
              )}

              {/* Categorias Atendidas */}
              <div className="space-y-2">
                <Label>Especialidades Atendidas *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-slate-700 cursor-pointer p-1.5 rounded hover:bg-white"
                    >
                      <Checkbox
                        checked={selectedCategorias.includes(cat.slug)}
                        onCheckedChange={() => handleToggleCategoria(cat.slug)}
                      />
                      <span>{cat.nome}</span>
                    </label>
                  ))}
                </div>
                {errors.categorias && <p className="text-xs text-red-500">{errors.categorias}</p>}
              </div>

              {/* Localização & Raio */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="cidade">Cidade Principal *</Label>
                  <Input
                    id="cidade"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Ex: Belo Horizonte"
                    className="rounded-xl"
                  />
                  {errors.cidade && <p className="text-xs text-red-500">{errors.cidade}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="uf">UF *</Label>
                  <Input
                    id="uf"
                    value={uf}
                    onChange={(e) => setUf(e.target.value.toUpperCase())}
                    maxLength={2}
                    className="rounded-xl text-center font-bold"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="raio">Raio de Atendimento:</Label>
                    <span className="text-sm font-bold text-green-700">{raioKm} km</span>
                  </div>
                  <input
                    id="raio"
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={raioKm}
                    onChange={(e) => setRaioKm(Number(e.target.value))}
                    className="w-full accent-green-600"
                  />
                  <p className="text-xs text-slate-500">
                    Você receberá notificações de pedidos em um raio de até {raioKm} km de {cidade}/
                    {uf}.
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <Label htmlFor="bio">Biografia e Experiência Profissional *</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ex: Eletricista e técnico em CFTV com 8 anos de experiência em instalação de câmeras Intelbras, automação de portões e quadros elétricos."
                  className="rounded-xl resize-none"
                />
                {errors.bio && <p className="text-xs text-red-500">{errors.bio}</p>}
              </div>

              {/* Certificados Upload Mock */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Certificados e Treinamentos (NR-10, NR-35, Intelbras, etc.)</Label>
                  <button
                    type="button"
                    onClick={handleAddCertificadoMock}
                    className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    + Simular Anexo
                  </button>
                </div>

                <div
                  className="p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition"
                  onClick={handleAddCertificadoMock}
                >
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-700">
                    Clique para anexar comprovantes técnicos (PDF ou Imagem)
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Profissionais com certificados validados ganham selo verificado e mais pedidos.
                  </span>
                </div>

                {certificados.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {certificados.map((cert, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-green-50/50 border border-green-200 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2 text-slate-800">
                          <FileCheck className="w-4 h-4 text-green-600" />
                          <span className="font-medium truncate">{cert.nome}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCertificado(idx)}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 rounded-xl shadow-md hover:scale-[1.01] active:scale-98 transition text-base"
          >
            {loading ? 'Criando sua conta...' : 'Concluir Cadastro Grátis'}
          </Button>

          <p className="text-center text-sm text-slate-600 pt-2">
            Já possui uma conta?{' '}
            <Link to="/entrar" className="text-green-600 hover:text-green-700 font-bold">
              Faça login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
