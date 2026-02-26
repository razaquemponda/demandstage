import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Music, MapPin, Pencil, Check, X, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Entity {
  id: string;
  name: string;
  image_url?: string | null;
}

export function ManageArtists() {
  return <EntityManager type="artists" icon={<Music className="h-4 w-4" />} label="Artist" hasImage />;
}

export function ManageCities() {
  return <EntityManager type="cities" icon={<MapPin className="h-4 w-4" />} label="City" />;
}

function EntityManager({ type, icon, label, hasImage }: { type: "artists" | "cities"; icon: React.ReactNode; label: string; hasImage?: boolean }) {
  const [items, setItems] = useState<Entity[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from(type).select("*").order("name");
    setItems((data as unknown as Entity[]) || []);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setLoading(true);
    const { error } = await supabase.from(type).insert({ name: trimmed });
    setLoading(false);
    if (error) {
      toast({ title: error.message.includes("duplicate") ? `${label} already exists` : error.message, variant: "destructive" });
      return;
    }
    setNewName("");
    toast({ title: `${label} added` });
    load();
  };

  const remove = async (id: string, name: string) => {
    const { error } = await supabase.from(type).delete().eq("id", id);
    if (error) {
      toast({ title: `Failed to delete: ${error.message}`, variant: "destructive" });
      return;
    }
    toast({ title: `${name} removed` });
    load();
  };

  const startEdit = (item: Entity) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const saveEdit = async (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    const { error } = await supabase.from(type).update({ name: trimmed }).eq("id", id);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
      return;
    }
    setEditingId(null);
    toast({ title: `${label} renamed` });
    load();
  };

  const handleImageUpload = async (id: string, file: File) => {
    setUploadingId(id);
    const ext = file.name.split(".").pop();
    const path = `${id}.${ext}`;

    // Remove old image first
    await supabase.storage.from("artist-images").remove([path]);

    const { error: uploadError } = await supabase.storage
      .from("artist-images")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: `Upload failed: ${uploadError.message}`, variant: "destructive" });
      setUploadingId(null);
      return;
    }

    const { data: urlData } = supabase.storage.from("artist-images").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("artists")
      .update({ image_url: urlData.publicUrl })
      .eq("id", id);

    if (updateError) {
      toast({ title: updateError.message, variant: "destructive" });
    } else {
      toast({ title: "Image updated" });
    }
    setUploadingId(null);
    load();
  };

  const removeImage = async (id: string, imageUrl: string) => {
    // Extract filename from URL
    const parts = imageUrl.split("/");
    const filename = parts[parts.length - 1];
    await supabase.storage.from("artist-images").remove([filename]);
    await supabase.from("artists").update({ image_url: null }).eq("id", id);
    toast({ title: "Image removed" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder={`New ${label.toLowerCase()} name...`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="bg-secondary border-border"
        />
        <Button onClick={add} disabled={loading || !newName.trim()} className="gradient-primary text-primary-foreground shrink-0">
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && uploadingId) {
            handleImageUpload(uploadingId, file);
          }
          e.target.value = "";
        }}
      />

      <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden shadow-card">
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No {label.toLowerCase()}s yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {hasImage && (
                  <Avatar className="h-10 w-10 shrink-0">
                    {item.image_url ? (
                      <AvatarImage src={item.image_url} alt={item.name} />
                    ) : null}
                    <AvatarFallback className="bg-secondary text-muted-foreground text-xs">
                      {item.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                {!hasImage && icon}

                {editingId === item.id ? (
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(item.id)}
                      className="h-8 bg-secondary border-border text-sm"
                      autoFocus
                    />
                    <Button variant="ghost" size="sm" onClick={() => saveEdit(item.id)}>
                      <Check className="h-3.5 w-3.5 text-accent" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <span className="font-medium truncate">{item.name}</span>
                )}
              </div>

              {editingId !== item.id && (
                <div className="flex gap-1 shrink-0">
                  {hasImage && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadingId(item.id);
                          fileInputRef.current?.click();
                        }}
                        title="Upload image"
                        disabled={uploadingId === item.id}
                      >
                        {uploadingId === item.id ? (
                          <span className="text-xs text-muted-foreground">...</span>
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      {item.image_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(item.id, item.image_url!)}
                          title="Remove image"
                          className="text-destructive hover:text-destructive"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => startEdit(item)} title="Rename">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(item.id, item.name)} className="text-destructive hover:text-destructive" title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
