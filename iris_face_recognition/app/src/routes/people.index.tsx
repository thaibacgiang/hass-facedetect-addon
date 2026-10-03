import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, UserPlus, MoreVertical, Trash2, Pencil, Power } from "lucide-react";

import { PageHeader, PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Snapshot } from "@/components/snapshot";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { api, type Person, uploadUrl } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

export const Route = createFileRoute("/people/")({
  head: () => ({ meta: [{ title: "Danh sách người — IRIS" }] }),
  component: PeopleList,
});

function PeopleList() {
  const queryClient = useQueryClient();
  const { data: people = [], isLoading } = useQuery({ queryKey: ["people"], queryFn: api.people });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all-status");
  const filtered = useMemo(
    () =>
      people.filter((p) => {
        const q = search.toLowerCase();
        const matchesSearch =
          p.name.toLowerCase().includes(q) ||
          (p.alias ?? "").toLowerCase().includes(q) ||
          p.id.includes(search);
        const matchesStatus =
          status === "all-status" || p.status.toLowerCase() === status.toLowerCase();
        return matchesSearch && matchesStatus;
      }),
    [people, search, status],
  );
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["people"] });
  const toggleStatus = useMutation({
    mutationFn: (p: Person) =>
      api.updatePerson(p.id, {
        name: p.name,
        alias: p.alias ?? "",
        notes: p.notes ?? "",
        status: p.status === "Active" ? "Disabled" : "Active",
      }),
    onSuccess: invalidate,
    onError: (err) => toast.error(err.message),
  });
  const deletePerson = useMutation({
    mutationFn: (p: Person) => api.deletePerson(p.id),
    onSuccess: () => {
      toast.success("Đã xóa người");
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <PageShell>
      <PageHeader
        eyebrow="// Danh bạ"
        title="Danh sách người"
        description="Những người đã biết được lập chỉ mục vào InsightFace."
        actions={
          <Button asChild>
            <Link to="/people/new">
              <UserPlus className="mr-2 h-4 w-4" /> Thêm người
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        {[
          { l: "Tổng số người", v: people.length },
          { l: "Đang hoạt động", v: people.filter((p) => p.status === "Active").length },
          { l: "Đã vô hiệu hóa", v: people.filter((p) => p.status === "Disabled").length },
          { l: "Khuôn mặt đã lập chỉ mục", v: people.reduce((a, p) => a + p.indexedFaces, 0) },
        ].map((s) => (
          <Card key={s.l} className="border-border bg-card p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {s.l}
            </div>
            <div className="mt-1 font-display text-2xl font-semibold">{s.v}</div>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card p-0 overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc bí danh..."
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">Mọi trạng thái</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="disabled">Đã vô hiệu hóa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="divide-y divide-border">
          {isLoading && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Đang tải danh sách...
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Không tìm thấy ai.
            </div>
          )}
          {filtered.map((p: Person) => (
            <div
              key={p.id}
              className="grid grid-cols-[auto_1fr_auto] items-start gap-3 px-3 py-4 hover:bg-surface-elevated/40 sm:grid-cols-12 sm:items-center sm:px-4 sm:py-3"
            >
              <div className="col-span-2 flex min-w-0 items-center gap-3 sm:col-span-5">
                <Snapshot size="sm" src={uploadUrl(p.latest_image_path)} />
                <div className="min-w-0 flex-1">
                  <Link
                    to="/people/$personId"
                    params={{ personId: p.id }}
                    className="text-base font-medium hover:text-primary sm:text-sm"
                  >
                    {p.displayName || p.alias || p.name}
                  </Link>
                  <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                    {p.alias && p.name.toLowerCase() !== p.id.toLowerCase() && (
                      <span className="text-xs text-muted-foreground">{p.name}</span>
                    )}
                    <span className="max-w-full truncate font-mono text-[11px] text-muted-foreground sm:text-[10px]">
                      {p.id}
                    </span>
                  </div>
                  {p.faceId && (
                    <Badge
                      variant="outline"
                      className="mt-1 border-primary/20 text-[9px] font-mono text-muted-foreground px-1.5 py-0"
                    >
                      InsightFace: {p.faceId}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="col-start-2 font-mono text-xs text-muted-foreground sm:col-span-2 sm:col-start-auto">
                {p.photos} photos
              </div>
              <div className="col-start-2 truncate text-xs text-muted-foreground sm:col-span-2 sm:col-start-auto">
                {formatDateTime(p.lastSeen, "Chưa bao giờ")}
              </div>
              <div className="col-start-2 sm:col-span-2 sm:col-start-auto">
                <Badge
                  variant="outline"
                  className={
                    p.status === "Active"
                      ? "border-success/40 text-success"
                      : "border-muted-foreground/30 text-muted-foreground"
                  }
                >
                  {p.status === "Active" ? "Đang hoạt động" : "Đã vô hiệu hóa"}
                </Badge>
              </div>
              <div className="col-start-3 row-start-1 text-right sm:col-span-1 sm:col-start-auto sm:row-start-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="sm:h-7 sm:w-7">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/people/$personId" params={{ personId: p.id }}>
                        <Pencil className="mr-2 h-4 w-4" /> Sửa
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleStatus.mutate(p)}>
                      <Power className="mr-2 h-4 w-4" />{" "}
                      {p.status === "Active" ? "Vô hiệu hóa" : "Bật"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => deletePerson.mutate(p)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
