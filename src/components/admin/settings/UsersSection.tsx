import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { deleteUser, inviteUser, listUsersWithRoles } from "@/lib/users.functions";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administratorius",
  housekeeper: "Kambarių tvarkytoja",
  user: "Vartotojas",
};

function fmt(value: string | null | undefined, withTime = false) {
  if (!value) return "—";
  const d = new Date(value);
  return withTime
    ? d.toLocaleString("lt-LT", { hour12: false })
    : d.toLocaleDateString("lt-LT");
}

export function UsersSection({ canEdit }: { canEdit: boolean }) {
  const invite = useServerFn(inviteUser);
  const fetchUsers = useServerFn(listUsersWithRoles);
  const removeUser = useServerFn(deleteUser);
  const qc = useQueryClient();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "housekeeper">("housekeeper");

  const { data: users, isLoading } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: () => fetchUsers(),
  });

  const m = useMutation({
    mutationFn: () =>
      invite({
        data: {
          email,
          role,
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/reset-password`
              : undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Kvietimas išsiųstas.");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["users-with-roles"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Nepavyko pakviesti."),
  });

  const del = useMutation({
    mutationFn: (userId: string) => removeUser({ data: { userId } }),
    onSuccess: () => {
      toast.success("Vartotojas ištrintas.");
      qc.invalidateQueries({ queryKey: ["users-with-roles"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Nepavyko ištrinti."),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pakviesti darbuotoją</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              m.mutate();
            }}
          >
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="invite-email">El. paštas</Label>
              <Input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-1.5 sm:w-56">
              <Label>Rolė</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as "admin" | "housekeeper")}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administratorius</SelectItem>
                  <SelectItem value="housekeeper">Kambarių tvarkytoja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={!canEdit || m.isPending}>
              {m.isPending ? "Siunčiama…" : "Pakviesti"}
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            Pakviestasis gaus el. laišką su nuoroda, kurioje pats susikurs slaptažodį. Viešos
            registracijos nėra.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vartotojai</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Kraunama…</p>
          ) : (users ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Vartotojų nėra.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 font-medium">El. paštas</th>
                    <th className="py-2 font-medium">Rolė</th>
                    <th className="py-2 font-medium">Pridėtas</th>
                    <th className="py-2 font-medium">Paskutinis prisijungimas</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {(users ?? []).map((u) => (
                    <tr key={`${u.userId}-${u.role}`} className="border-t">
                      <td className="py-2">{u.email || u.userId}</td>
                      <td className="py-2">{ROLE_LABEL[u.role] ?? u.role}</td>
                      <td className="py-2 text-muted-foreground">{fmt(u.createdAt)}</td>
                      <td className="py-2 text-muted-foreground">
                        {u.lastSignInAt ? fmt(u.lastSignInAt, true) : "Neprisijungė"}
                      </td>
                      <td className="py-2 text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={!canEdit || del.isPending}
                              aria-label="Ištrinti vartotoją"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Ištrinti vartotoją?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {u.email || u.userId} paskyra bus visam laikui ištrinta kartu su
                                visomis rolėmis. Veiksmo atšaukti negalima.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Atšaukti</AlertDialogCancel>
                              <AlertDialogAction onClick={() => del.mutate(u.userId)}>
                                Ištrinti
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}