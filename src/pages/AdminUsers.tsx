import React, { useState, useEffect } from 'react'
import { api } from '@/services/api'
import { User, ProviderProfile } from '@/types'
import { AdminLayout } from '@/components/AdminLayout'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, ShieldCheck, Ban, Trash2, FileText, CheckCircle2, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function AdminUsers() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('todos')

  // Document Modal state for provider
  const [docModalUser, setDocModalUser] = useState<User | null>(null)
  const [docModalProfile, setDocModalProfile] = useState<ProviderProfile | null>(null)

  // Delete confirm state
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    const list = await api.listAllUsers()
    setUsers(list)
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Open Documents Modal
  const handleOpenDocs = async (user: User) => {
    const prof = await api.getProviderProfile(user.id)
    setDocModalUser(user)
    setDocModalProfile(prof)
  }

  // Approve Provider Docs
  const handleApproveDocs = async () => {
    if (!docModalUser) return
    try {
      await api.setProviderDocsValidated(docModalUser.id, true)
      toast({
        title: 'Documentos Aprovados!',
        description: `O prestador ${docModalUser.nome} agora possui o selo Verificado.`,
      })
      if (docModalProfile) {
        setDocModalProfile({ ...docModalProfile, documentos_validados: true })
      }
      setDocModalUser(null)
    } catch (err: any) {
      toast({
        title: 'Erro ao aprovar',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  // Reject Provider Docs
  const handleRejectDocs = async () => {
    if (!docModalUser) return
    try {
      await api.setProviderDocsValidated(docModalUser.id, false)
      toast({
        title: 'Documentação Rejeitada',
        description: 'O selo de verificação foi revogado/negado.',
        variant: 'destructive',
      })
      if (docModalProfile) {
        setDocModalProfile({ ...docModalProfile, documentos_validados: false })
      }
      setDocModalUser(null)
    } catch (err: any) {
      toast({
        title: 'Erro ao rejeitar',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  // Toggle Banned
  const handleToggleBanned = async (user: User) => {
    try {
      const updated = await api.setUserBanned(user.id, !user.banido)
      setUsers(users.map((u) => (u.id === user.id ? updated : u)))
      toast({
        title: updated.banido ? 'Usuário Bloqueado' : 'Usuário Desbloqueado',
        description: updated.banido
          ? `${user.nome} não poderá mais fazer login.`
          : `${user.nome} teve seu acesso restabelecido.`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao alterar status',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!userToDelete) return
    try {
      await api.deleteUser(userToDelete.id)
      setUsers(users.filter((u) => u.id !== userToDelete.id))
      toast({
        title: 'Usuário excluído',
        description: 'O registro foi removido com sucesso.',
      })
      setUserToDelete(null)
    } catch (err: any) {
      toast({
        title: 'Erro ao excluir',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase().trim()
    const matchesSearch =
      u.nome.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    if (roleFilter !== 'todos' && u.papel !== roleFilter) return false
    return matchesSearch
  })

  const roleBadge = (role: string) => {
    switch (role) {
      case 'cliente':
        return (
          <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100 text-[11px]">Cliente</Badge>
        )
      case 'profissional':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-[11px]">
            Profissional
          </Badge>
        )
      case 'admin':
        return (
          <Badge className="bg-slate-900 text-white hover:bg-slate-900 text-[11px]">Admin</Badge>
        )
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Moderação de Usuários
            </h1>
            <p className="text-sm text-slate-500">
              Gerencie acessos, aprove certificações técnicas de prestadores e suspenda contas.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="pl-9 rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {['todos', 'cliente', 'profissional', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition ${
                  roleFilter === r
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table Desktop / Card list Mobile */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-100">
                <tr>
                  <th className="py-4 px-6">Usuário</th>
                  <th className="py-4 px-6">Papel</th>
                  <th className="py-4 px-6 hidden sm:table-cell">Telefone</th>
                  <th className="py-4 px-6 hidden md:table-cell">Cadastro</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-slate-200">
                          <AvatarImage src={u.foto} alt={u.nome} />
                          <AvatarFallback className="bg-slate-200 text-slate-700 font-bold">
                            {u.nome[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-bold text-slate-900 block">{u.nome}</span>
                          <span className="text-xs text-slate-400">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">{roleBadge(u.papel)}</td>

                    <td className="py-4 px-6 hidden sm:table-cell text-xs">{u.telefone}</td>

                    <td className="py-4 px-6 hidden md:table-cell text-xs text-slate-400">
                      {new Date(u.data_criacao).toLocaleDateString('pt-BR')}
                    </td>

                    <td className="py-4 px-6">
                      {u.banido ? (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-[10px]">
                          Bloqueado
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px]">
                          Ativo
                        </Badge>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right space-x-1">
                      {u.papel === 'profissional' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDocs(u)}
                          className="rounded-lg text-xs font-bold text-green-700 border-green-200 hover:bg-green-50"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1" />
                          Documentos
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleBanned(u)}
                        className={`rounded-lg text-xs ${
                          u.banido
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-amber-600 hover:bg-amber-50'
                        }`}
                        title={u.banido ? 'Desbloquear' : 'Bloquear'}
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setUserToDelete(u)}
                        className="rounded-lg text-xs text-red-500 hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Documents Modal */}
        <Dialog open={!!docModalUser} onOpenChange={(open) => !open && setDocModalUser(null)}>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Certificados de {docModalUser?.nome}
              </DialogTitle>
              <DialogDescription>
                Revise os documentos técnicos enviados para validação de selo profissional.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span>Status da Validação:</span>
                {docModalProfile?.documentos_validados ? (
                  <Badge className="bg-green-100 text-green-800 font-bold">Verificado</Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    Pendente / Não validado
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Documentos Anexados:
                </span>
                {docModalProfile?.certificados && docModalProfile.certificados.length > 0 ? (
                  docModalProfile.certificados.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800 truncate">{c.nome}</span>
                      <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">
                        Documento Válido
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Nenhum arquivo enviado pelo prestador.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={handleRejectDocs}
                className="rounded-xl text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Rejeitar / Revogar
              </Button>
              <Button
                onClick={handleApproveDocs}
                className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Aprovar Documentos
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Alert */}
        <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir usuário permanentemente?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não poderá ser desfeita. O perfil e histórico de {userToDelete?.nome}{' '}
                serão removidos da memória do sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
              >
                Sim, Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
}
