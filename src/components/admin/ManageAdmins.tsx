import { useEffect, useState } from "react";
import { Shield, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  user_id: string;
  email: string | null;
}

interface AdminRole {
  id: string;
  user_id: string;
  email: string | null;
}

export default function ManageAdmins() {
  const [admins, setAdmins] = useState<AdminRole[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load current admins
    const { data: roles } = await supabase
      .from("user_roles")
      .select("id, user_id, role")
      .eq("role", "admin");

    // Load all profiles
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("user_id, email");

    const profileList = (allProfiles as Profile[]) || [];
    setProfiles(profileList);

    // Map admins with emails
    const adminList: AdminRole[] = (roles || []).map((r) => {
      const profile = profileList.find((p) => p.user_id === r.user_id);
      return { id: r.id, user_id: r.user_id, email: profile?.email || null };
    });
    setAdmins(adminList);
  };

  const adminUserIds = new Set(admins.map((a) => a.user_id));
  const nonAdminProfiles = profiles.filter((p) => !adminUserIds.has(p.user_id));

  const addAdmin = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: selectedUserId, role: "admin" as const });

    if (error) {
      toast({ title: "Failed to add admin", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Admin added" });
      setSelectedUserId("");
      await loadData();
    }
    setLoading(false);
  };

  const removeAdmin = async (roleId: string, email: string | null) => {
    const { data: { user } } = await supabase.auth.getUser();
    const target = admins.find((a) => a.id === roleId);
    if (target && user && target.user_id === user.id) {
      toast({ title: "Cannot remove yourself", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
    if (error) {
      toast({ title: "Failed to remove admin", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Removed ${email || "admin"}` });
      await loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Add admin */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-card">
        <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" /> Add Admin
        </h3>
        {nonAdminProfiles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No registered users available to promote. Users need to sign up first.</p>
        ) : (
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-2">Select a registered user</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Choose user email..." />
                </SelectTrigger>
                <SelectContent>
                  {nonAdminProfiles.map((p) => (
                    <SelectItem key={p.user_id} value={p.user_id}>
                      {p.email || p.user_id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addAdmin} disabled={!selectedUserId || loading} className="gradient-primary text-primary-foreground font-semibold">
              <UserPlus className="h-4 w-4 mr-1.5" /> Add
            </Button>
          </div>
        )}
      </div>

      {/* Current admins */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-card">
        <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" /> Current Admins ({admins.length})
        </h3>
        {admins.length === 0 ? (
          <p className="text-sm text-muted-foreground">No admins found.</p>
        ) : (
          <div className="space-y-3">
            {admins.map((a) => (
              <div key={a.id} className="flex items-center justify-between bg-secondary rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{a.email || a.user_id.slice(0, 12)}</span>
                  <Badge variant="secondary" className="text-xs">Admin</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeAdmin(a.id, a.email)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
