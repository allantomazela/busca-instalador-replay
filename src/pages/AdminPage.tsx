import React, { useState, useEffect } from 'react'
import { authService } from '@/services/authService'
import { searchService } from '@/services/searchService'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { User, UserRole, GoogleApiConfig } from '@/types'
import {
  Users,
  Key,
  ShieldCheck,
  UserPlus,
  Power,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Building,
  Sparkles,
  Info,
  Trash2,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AdminPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  // Tab state: 'funcionarios' | 'google'
  const [activeTab, setActiveTab] = useState<'funcionarios' | 'google'>('funcionarios')

  // Funcionários state
  const [usersList, setUsersList] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novoEmail, setNovoEmail] = useState('')
  const [novoTelefone, setNovoTelefone] = useState('')
  const [novaSenha, setNovaSenha] = useState('123456')
  const [novoPapel, setNovoPapel] = useState<UserRole>('funcionario')
  const [creatingUser, setCreatingUser] = useState(false)

  // Google Places API config state
  const [googleConfig, setGoogleConfig] = useState<GoogleApiConfig>({
    apiKey: '',
    isEnabled: false,
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)

  // Carregar dados
  const loadData = async () => {
    setLoadingUsers(true)
    try {
      const users = await authService.listUsers()
      setUsersList(users)
      const conf = searchService.getGoogleConfig()
      setGoogleConfig(conf)
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Alternar status do funcionário (ativar/desativar)
  const handleToggleStatus = async (targetUser: User) => {
    if (targetUser.id === user?.id) {
      toast({
        title: 'Ação não permitida',
        description: 'Você não pode desativar sua própria conta de administrador.',
        variant: 'destructive',
      })
      return
    }

    try {
      const updated = await authService.toggleUserStatus(targetUser.id)
      setUsersList((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      toast({
        title: updated.ativo ? 'Conta ativada' : 'Conta desativada',
        description: `O funcionário ${updated.nome} ${
          updated.ativo ? 'agora pode acessar o sistema.' : 'não poderá mais fazer login.'
        }`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  // Criar novo funcionário
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoNome || !novoEmail) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha nome e e-mail do funcionário.',
        variant: 'destructive',
      })
      return
    }

    setCreatingUser(true)
    try {
      const created = await authService.createUser({
        nome: novoNome,
        email: novoEmail,
        telefone: novoTelefone,
        senha: novaSenha || '123456',
        papel: novoPapel,
      })

      setUsersList((prev) => [...prev, created])
      toast({
        title: 'Funcionário cadastrado!',
        description: `${created.nome} já pode acessar o sistema com a senha configurada.`,
      })

      // Reset
      setNovoNome('')
      setNovoEmail('')
      setNovoTelefone('')
      setNovaSenha('123456')
      setNovoPapel('funcionario')
      setModalOpen(false)
    } catch (err: any) {
      toast({
        title: 'Erro ao cadastrar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setCreatingUser(false)
    }
  }

  // Salvar Configuração do Google Places
  const handleSaveGoogleConfig = () => {
    setSavingConfig(true)
    try {
      const trimmedKey = googleConfig.apiKey.trim()
      const newConfig: GoogleApiConfig = {
        apiKey: trimmedKey,
        isEnabled: trimmedKey.length > 5 ? googleConfig.isEnabled : false,
        lastTested: trimmedKey.length > 5 ? new Date().toISOString() : undefined,
      }

      searchService.saveGoogleConfig(newConfig)
      setGoogleConfig(newConfig)

      toast({
        title: 'Configurações do Google salvas!',
        description:
          newConfig.isEnabled && newConfig.apiKey
            ? 'Chave salva com sucesso. Quando houver backend conectado, as buscas passarão a retornar resultados reais do Google Places.'
            : 'Configuração atualizada em memória. O sistema permanece em modo demonstração.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSavingConfig(false)
    }
  }

  const handleClearApiKey = () => {
    const cleared: GoogleApiConfig = { apiKey: '', isEnabled: false }
    searchService.saveGoogleConfig(cleared)
    setGoogleConfig(cleared)
    toast({
      title: 'Chave removida',
      description:
        'A chave da Google Places API foi removida. O sistema está em modo demonstração.',
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-[1240px] mx-auto space-y-6">
        {/* Header da Tela Admin */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Painel de Controle Corporativo (Acesso Admin)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Administração do Sistema
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Gerencie a equipe autorizada e configure as integrações de busca do Google.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-800 border-purple-200 font-bold px-3 py-1"
            >
              Dono / Administrador: {user?.nome}
            </Badge>
          </div>
        </div>

        {/* Tabs de Navegação */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('funcionarios')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'funcionarios'
                ? 'border-green-600 text-green-700 bg-white/60'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Equipe de Funcionários ({usersList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'google'
                ? 'border-green-600 text-green-700 bg-white/60'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Integração Google Places API</span>
            {googleConfig.apiKey && googleConfig.isEnabled ? (
              <span className="w-2 h-2 rounded-full bg-green-500" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        </div>

        {/* TAB 1: GERENCIAR FUNCIONÁRIOS */}
        {activeTab === 'funcionarios' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Acesso de Funcionários</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Apenas os colaboradores cadastrados nesta lista conseguem logar no sistema
                  ServiçoJá.
                </p>
              </div>

              <Button
                onClick={() => setModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Novo Funcionário</span>
              </Button>
            </div>

            {/* Tabela de Colaboradores */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-6">Funcionário</th>
                      <th className="py-3.5 px-6">E-mail Corporativo</th>
                      <th className="py-3.5 px-6">Papel</th>
                      <th className="py-3.5 px-6">Status da Conta</th>
                      <th className="py-3.5 px-6">Data de Criação</th>
                      <th className="py-3.5 px-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                              {item.nome.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span>{item.nome}</span>
                              {item.telefone && (
                                <span className="block text-[11px] text-slate-400 font-normal">
                                  {item.telefone}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-slate-600 font-mono text-xs">{item.email}</td>

                        <td className="py-4 px-6">
                          <Badge
                            className={`text-xs font-bold ${
                              item.papel === 'admin'
                                ? 'bg-purple-100 text-purple-800 border-purple-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {item.papel === 'admin' ? 'Dono / Admin' : 'Funcionário'}
                          </Badge>
                        </td>

                        <td className="py-4 px-6">
                          {item.ativo ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              Desativado
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-xs text-slate-500">
                          {new Date(item.data_criacao).toLocaleDateString('pt-BR')}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={item.id === user?.id}
                            onClick={() => handleToggleStatus(item)}
                            className={`text-xs font-bold rounded-xl ${
                              item.ativo
                                ? 'border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5 mr-1" />
                            {item.ativo ? 'Desativar' : 'Reativar'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTEGRAÇÃO GOOGLE PLACES API */}
        {activeTab === 'google' && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                    <Key className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      Configuração da Google Places API
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Gerencie a chave que alimentará a busca com dados reais de empresas do Google
                      Maps.
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {googleConfig.apiKey && googleConfig.isEnabled ? (
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>API Conectada</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>Modo Demonstração Ativo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Informative notice */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed mb-6 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Info className="w-4 h-4 text-green-600" />
                  <span>Como funciona a integração Google:</span>
                </div>
                <p>
                  • <strong>Sem chave configurada:</strong> O sistema utiliza o dataset de
                  demonstração realista com telefones, WhatsApp, especialidades e avaliações
                  brasileiras (CFTV, Eletricistas, Reparos e Segurança).
                </p>
                <p>
                  • <strong>Com chave configurada:</strong> A chave é mantida em memória segura da
                  sessão local (nunca gravada no código). Quando houver backend ou Edge Function
                  conectada, a busca passa a consultar o endpoint oficial da Google Places API.
                </p>
              </div>

              {/* Campo para colar chave */}
              <div className="space-y-4 max-w-2xl">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="googleKey"
                      className="text-xs font-bold text-slate-700 uppercase tracking-wider"
                    >
                      Chave da Google Places API (API Key)
                    </Label>
                    {googleConfig.apiKey && (
                      <button
                        type="button"
                        onClick={handleClearApiKey}
                        className="text-xs text-red-600 hover:underline font-semibold"
                      >
                        Limpar Chave
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Input
                      id="googleKey"
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="Cole aqui sua chave (ex: AIzaSy...)"
                      value={googleConfig.apiKey}
                      onChange={(e) => setGoogleConfig({ ...googleConfig, apiKey: e.target.value })}
                      className="pr-10 rounded-xl font-mono text-sm bg-slate-50 border-slate-300 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    Nenhuma chave vem no código do app por questões de segurança. Cole a chave
                    oficial gerada no Google Cloud Console.
                  </span>
                </div>

                {/* Switch para Habilitar Chamada Real */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Habilitar chamadas à Google Places API
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Quando desativado, o sistema sempre usará os dados demo para economizar
                      requisições.
                    </span>
                  </div>
                  <Switch
                    checked={googleConfig.isEnabled}
                    onCheckedChange={(checked) =>
                      setGoogleConfig({ ...googleConfig, isEnabled: checked })
                    }
                  />
                </div>

                <Button
                  onClick={handleSaveGoogleConfig}
                  disabled={savingConfig}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl px-6 py-5 shadow-sm"
                >
                  {savingConfig ? 'Salvando...' : 'Salvar Configurações da API'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Novo Funcionário */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-slate-900">
                Cadastrar Novo Funcionário
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Crie uma conta interna para que o colaborador acesse o ServiçoJá.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateUser} className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="nome" className="text-xs font-bold text-slate-700">
                  Nome Completo
                </Label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="nome"
                    required
                    placeholder="Ex: Roberto Alencar"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    className="pl-9 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="novoEmail" className="text-xs font-bold text-slate-700">
                  E-mail Corporativo (Login)
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="novoEmail"
                    type="email"
                    required
                    placeholder="roberto@empresa.com"
                    value={novoEmail}
                    onChange={(e) => setNovoEmail(e.target.value)}
                    className="pl-9 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="telefone" className="text-xs font-bold text-slate-700">
                    Telefone / Ramal
                  </Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="telefone"
                      placeholder="(11) 99999-0000"
                      value={novoTelefone}
                      onChange={(e) => setNovoTelefone(e.target.value)}
                      className="pl-9 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="papel" className="text-xs font-bold text-slate-700">
                    Papel de Acesso
                  </Label>
                  <Select value={novoPapel} onValueChange={(val) => setNovoPapel(val as UserRole)}>
                    <SelectTrigger className="rounded-xl font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="funcionario">Funcionário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="novaSenha" className="text-xs font-bold text-slate-700">
                  Senha Provisória
                </Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="novaSenha"
                    type="text"
                    required
                    placeholder="123456"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="pl-9 rounded-xl font-mono text-sm"
                  />
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Padrão sugerido: <strong>123456</strong>
                </span>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={creatingUser}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
                >
                  {creatingUser ? 'Criando conta...' : 'Cadastrar Funcionário'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
