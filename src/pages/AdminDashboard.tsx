import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Trash2, Flag, LogOut, RefreshCw, Music, MapPin, Users, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ManageArtists, ManageCities } from "@/components/admin/ManageEntities";
import ManageAdmins from "@/components/admin/ManageAdmins";
import ManageEvents from "@/components/admin/ManageEvents";

interface VoteRow {
  id: string;
  artist: string;
  city: string;
  device_id: string;
  ip_address: string | null;
  flagged: boolean;
  created_at: string;
}

interface SuspiciousGroup {
  key: string;
  type: "ip" | "device";
  value: string;
  count: number;
  votes: VoteRow[];
}

export default function AdminDashboard() {
  const [votes, setVotes] = useState<VoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/admin/login");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (!roles?.some((r) => r.role === "admin")) {
      navigate("/admin/login");
      return;
    }

    setIsAdmin(true);
    loadVotes();
  };

  const loadVotes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("votes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    setVotes((data as VoteRow[]) || []);
    setLoading(false);
  };

  const flaggedVotes = votes.filter((v) => v.flagged);

  const getSuspiciousGroups = (): SuspiciousGroup[] => {
    const groups: SuspiciousGroup[] = [];

    const ipMap = new Map<string, VoteRow[]>();
    for (const v of votes) {
      if (!v.ip_address || v.ip_address === "unknown") continue;
      const arr = ipMap.get(v.ip_address) || [];
      arr.push(v);
      ipMap.set(v.ip_address, arr);
    }
    for (const [ip, ipVotes] of ipMap) {
      if (ipVotes.length >= 5) {
        groups.push({ key: `ip-${ip}`, type: "ip", value: ip, count: ipVotes.length, votes: ipVotes });
      }
    }

    const devMap = new Map<string, VoteRow[]>();
    for (const v of votes) {
      const arr = devMap.get(v.device_id) || [];
      arr.push(v);
      devMap.set(v.device_id, arr);
    }
    for (const [dev, devVotes] of devMap) {
      if (devVotes.length >= 5) {
        groups.push({ key: `dev-${dev}`, type: "device", value: dev, count: devVotes.length, votes: devVotes });
      }
    }

    return groups.sort((a, b) => b.count - a.count);
  };

  const deleteVote = async (id: string) => {
    await supabase.from("votes").delete().eq("id", id);
    setVotes((prev) => prev.filter((v) => v.id !== id));
    toast({ title: "Vote deleted" });
  };

  const toggleFlag = async (id: string, currentFlagged: boolean) => {
    await supabase.from("votes").update({ flagged: !currentFlagged }).eq("id", id);
    setVotes((prev) => prev.map((v) => (v.id === id ? { ...v, flagged: !currentFlagged } : v)));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (!isAdmin) return null;

  const suspicious = getSuspiciousGroups();

  return (
    <section className="container py-10 md:py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="font-heading text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadVotes} className="border-border">
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-border">
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Votes", value: votes.length, color: "text-primary" },
            { label: "Flagged", value: flaggedVotes.length, color: "text-destructive" },
            { label: "Suspicious IPs", value: suspicious.filter((s) => s.type === "ip").length, color: "text-accent" },
            { label: "Suspicious Devices", value: suspicious.filter((s) => s.type === "device").length, color: "text-accent" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4 shadow-card">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`font-heading text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="flagged" className="space-y-4">
          <TabsList className="bg-secondary flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="flagged">
              <AlertTriangle className="h-4 w-4 mr-1" /> Flagged ({flaggedVotes.length})
            </TabsTrigger>
            <TabsTrigger value="suspicious">Suspicious ({suspicious.length})</TabsTrigger>
            <TabsTrigger value="all">All Votes ({votes.length})</TabsTrigger>
            <TabsTrigger value="artists">
              <Music className="h-4 w-4 mr-1" /> Artists
            </TabsTrigger>
            <TabsTrigger value="cities">
              <MapPin className="h-4 w-4 mr-1" /> Cities
            </TabsTrigger>
            <TabsTrigger value="events">
              <CalendarDays className="h-4 w-4 mr-1" /> Events
            </TabsTrigger>
            <TabsTrigger value="admins">
              <Users className="h-4 w-4 mr-1" /> Admins
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flagged">
            <VoteTable votes={flaggedVotes} onDelete={deleteVote} onToggleFlag={toggleFlag} loading={loading} />
          </TabsContent>

          <TabsContent value="suspicious">
            {suspicious.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No suspicious activity detected.</p>
            ) : (
              <div className="space-y-6">
                {suspicious.map((group) => (
                  <div key={group.key} className="bg-card border border-border rounded-xl p-5 shadow-card">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <span className="font-heading font-semibold">
                        {group.type === "ip" ? "IP Address" : "Device ID"}:
                      </span>
                      <code className="text-xs bg-secondary px-2 py-1 rounded">{group.value.slice(0, 20)}…</code>
                      <Badge variant="destructive">{group.count} votes</Badge>
                    </div>
                    <VoteTable votes={group.votes} onDelete={deleteVote} onToggleFlag={toggleFlag} loading={false} compact />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            <VoteTable votes={votes} onDelete={deleteVote} onToggleFlag={toggleFlag} loading={loading} />
          </TabsContent>

          <TabsContent value="artists">
            <ManageArtists />
          </TabsContent>

          <TabsContent value="cities">
            <ManageCities />
          </TabsContent>

          <TabsContent value="events">
            <ManageEvents />
          </TabsContent>

          <TabsContent value="admins">
            <ManageAdmins />
          </TabsContent>
        </Tabs>
      </motion.div>
    </section>
  );
}

function VoteTable({
  votes,
  onDelete,
  onToggleFlag,
  loading,
  compact,
}: {
  votes: VoteRow[];
  onDelete: (id: string) => void;
  onToggleFlag: (id: string, flagged: boolean) => void;
  loading: boolean;
  compact?: boolean;
}) {
  if (loading) return <p className="text-center text-muted-foreground py-8">Loading...</p>;
  if (votes.length === 0) return <p className="text-center text-muted-foreground py-8">No votes found.</p>;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead>Artist</TableHead>
            <TableHead>City</TableHead>
            {!compact && <TableHead className="hidden md:table-cell">IP</TableHead>}
            <TableHead className="hidden md:table-cell">Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {votes.map((v) => (
            <TableRow key={v.id} className="border-border">
              <TableCell className="font-medium">{v.artist}</TableCell>
              <TableCell>{v.city}</TableCell>
              {!compact && (
                <TableCell className="hidden md:table-cell">
                  <code className="text-xs">{v.ip_address?.slice(0, 15) || "—"}</code>
                </TableCell>
              )}
              <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                {new Date(v.created_at).toLocaleString()}
              </TableCell>
              <TableCell>
                {v.flagged ? (
                  <Badge variant="destructive" className="text-xs">Flagged</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Clean</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleFlag(v.id, v.flagged)}
                    title={v.flagged ? "Unflag" : "Flag"}
                  >
                    <Flag className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(v.id)}
                    className="text-destructive hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
