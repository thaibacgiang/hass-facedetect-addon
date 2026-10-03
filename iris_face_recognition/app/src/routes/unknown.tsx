import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { UserPlus, UserCheck, EyeOff, Trash2, Camera, Clock, Loader2 } from "lucide-react";

import { PageHeader, PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Snapshot } from "@/components/snapshot";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, uploadUrl, type UnknownVisitor } from "@/lib/api";
import { ApiError } from "@/lib/http";
import { personIdFromAlias, formatDateTime } from "@/lib/utils";

export const Route = createFileRoute("/unknown")({
  head: () => ({ meta: [{ title: "Người lạ - IRIS" }] }),
  component: UnknownList,
});

function UnknownList() {
  const queryClient = useQueryClient();
  const { data: unknowns = [] } = useQuery({ queryKey: ["unknowns"], queryFn: api.unknowns });
  const { data: people = [] } = useQuery({ queryKey: ["people"], queryFn: api.people });
  const [selected, setSelected] = useState<UnknownVisitor | null>(null);
  const [personId, setPersonId] = useState("");
  const [newName, setNewName] = useState("");
  const [newAlias, setNewAlias] = useState("");
  const [newPersonIdAttention, setNewPersonIdAttention] = useState(false);
  const newPersonIdRef = useRef<HTMLInputElement>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["unknowns"] });
    queryClient.invalidateQueries({ queryKey: ["people"] });
    queryClient.invalidateQueries({ queryKey: ["events"] });
    queryClient.invalidateQueries({ queryKey: ["summary"] });
  };

  const highlightNewPersonId = () => {
    newPersonIdRef.current?.focus();
    newPersonIdRef.current?.select();
    setNewPersonIdAttention(false);
    window.requestAnimationFrame(() => setNewPersonIdAttention(true));
    window.setTimeout(() => setNewPersonIdAttention(false), 2800);
  };

  const assign = useMutation({
    mutationFn: async () => {
      if (!selected || !personId) throw new Error("Hãy chọn một người trước.");
      return api.assignUnknown(selected.id, personId);
    },
    onSuccess: () => {
      toast.success("Đã gán và lập chỉ mục người lạ");
      setSelected(null);
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const createAndAssign = useMutation({
    mutationFn: async () => {
      if (!selected || !newAlias.trim() || !newName.trim())
        throw new Error("Cần nhập Bí danh và Mã người.");
      const person = await api.createPerson({
        name: newName,
        alias: newAlias,
        notes: "Tạo từ người lạ",
      });
      return api.assignUnknown(selected.id, person.id);
    },
    onSuccess: () => {
      toast.success("Đã tạo người và lập chỉ mục khuôn mặt");
      setSelected(null);
      setNewName("");
      setNewAlias("");
      invalidate();
    },
    onError: (err) => {
      if (err instanceof ApiError && err.code === "person_id_exists") highlightNewPersonId();
      toast.error(err.message);
    },
  });

  const remove = useMutation({
    mutationFn: (unknownId: string) => api.deleteUnknown(unknownId),
    onSuccess: () => {
      toast.success("Đã bỏ qua người lạ");
      setSelected(null);
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <PageShell>
      <PageHeader
        eyebrow="// Hàng chờ xem xét"
        title="Người lạ"
        description="Đã phát hiện khuôn mặt nhưng chưa khớp. Gán cho người đã có hoặc tạo hồ sơ mới."
        actions={<span className="chip">{unknowns.length} pending</span>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {unknowns.map((unknown) => (
          <Card key={unknown.id} className="overflow-hidden border-border bg-card p-0">
            <div className="relative aspect-square bg-black/40">
              <div className="absolute inset-0 flex items-center justify-center">
                <Snapshot size="lg" unknown src={uploadUrl(unknown.image_path)} />
              </div>
              <Badge
                variant="outline"
                className="absolute right-2 top-2 border-warning/40 bg-background/80 text-warning backdrop-blur"
              >
                x{unknown.detections}
              </Badge>
            </div>
            <div className="space-y-1 border-t border-border p-3">
              <div className="flex items-center gap-1.5 text-xs">
                <Camera className="h-3 w-3 text-muted-foreground" />
                <span className="truncate font-medium">{unknown.cameraName}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" /> {formatDateTime(unknown.time)}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setSelected(unknown)}
              >
                Xem xét
              </Button>
            </div>
          </Card>
        ))}
        {unknowns.length === 0 && (
          <div className="col-span-full rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Không có người lạ nào đang chờ.
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Unknown visitor - {selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="grid-bg relative aspect-square overflow-hidden rounded-md border border-border bg-black/40">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Snapshot size="lg" unknown src={uploadUrl(selected.image_path)} />
                  </div>
                </div>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div>
                    <Camera className="mr-1 inline h-3 w-3" /> {selected.cameraName}
                  </div>
                  <div>
                    <Clock className="mr-1 inline h-3 w-3" /> {formatDateTime(selected.time)}
                  </div>
                  <div>
                    {selected.detections} detection{selected.detections > 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Gán cho người đã có</Label>
                  <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                    <Select value={personId} onValueChange={setPersonId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn..." />
                      </SelectTrigger>
                      <SelectContent>
                        {people.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.displayName || person.alias || person.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => assign.mutate()}
                      disabled={!personId || assign.isPending}
                    >
                      {assign.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <UserCheck className="mr-2 h-4 w-4" />
                      )}
                      {assign.isPending ? "Đang lập chỉ mục..." : "Gán"}
                    </Button>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Ảnh được đính kèm và khuôn mặt InsightFace được lập chỉ mục lại.
                  </p>
                </div>

                <div className="border-t border-border pt-4">
                  <Label className="text-xs">Hoặc tạo người mới</Label>
                  <Input
                    value={newAlias}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewAlias(value);
                      setNewName(personIdFromAlias(value));
                    }}
                    className="mt-1"
                    placeholder="Bí danh..."
                  />
                  <Input
                    ref={newPersonIdRef}
                    value={newName}
                    onChange={(e) => {
                      setNewName(personIdFromAlias(e.target.value));
                    }}
                    className={`mt-2 ${newPersonIdAttention ? "insightface-id-attention" : ""}`}
                    placeholder="Mã người..."
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Person ID is the local profile key. Use only unaccented letters, numbers, `_`,
                    `.`, `-`.
                  </p>
                  <Button
                    className="mt-2 w-full"
                    onClick={() => createAndAssign.mutate()}
                    disabled={!newAlias.trim() || !newName.trim() || createAndAssign.isPending}
                  >
                    {createAndAssign.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    {createAndAssign.isPending ? "Đang lập chỉ mục..." : "Tạo người"}
                  </Button>
                </div>

                <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => remove.mutate(selected.id)}
                  >
                    <EyeOff className="mr-2 h-4 w-4" /> Bỏ qua
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => remove.mutate(selected.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Xóa
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
