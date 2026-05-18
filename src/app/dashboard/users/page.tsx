import { getProjectPeers } from '@/app/actions/userActions';
import AddUserForm from '@/components/AddUserForm';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const rows = await getProjectPeers();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Users</h1>
        <AddUserForm />
      </div>
      <div className="glass overflow-hidden rounded-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/40 border-b border-border">
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-muted-foreground">
                  You&apos;re not in any shared projects yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const displayName = row.user.name || row.user.email.split('@')[0];
                const initials = displayName.slice(0, 2).toUpperCase();
                const isAdmin = row.role === 'ADMIN';
                return (
                  <tr key={`${row.user.id}:${row.projectId}`} className="hover:bg-white/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 overflow-hidden">
                          {row.user.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={row.user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                          ) : (
                            initials
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{displayName}</span>
                            {row.user.isPending && (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-yellow-500/15 text-yellow-700">
                                Pending
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{row.user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        isAdmin
                          ? 'bg-primary/15 text-primary'
                          : 'bg-slate-500/15 text-slate-700'
                      }`}>
                        {isAdmin ? 'Admin' : 'Member'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {row.projectName}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
