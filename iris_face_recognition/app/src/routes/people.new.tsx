import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ArrowLeft, Upload, CheckCircle2, Cloud, User } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Snapshot } from "@/components/snapshot";
import { api, type Person } from "@/lib/api";
import { personIdFromAlias } from "@/lib/utils";
import { ApiError } from "@/lib/http";

export const Route = createFileRoute("/people/new")({
  head: () => ({ meta: [{ title: "Thêm người — IRIS" }] }),
  component: AddPerson,
});

const steps = [
  { n: 1, label: "Hồ sơ", icon: User },
  { n: 2, label: "Tải ảnh lên", icon: Upload },
  { n: 3, label: "Lập chỉ mục trong InsightFace", icon: Cloud },
  { n: 4, label: "Hoàn tất", icon: CheckCircle2 },
];

function AddPerson() {
  const [step, setStep] = useState(1);
  const [createdPerson, setCreatedPerson] = useState<Person | null>(null);
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [personIdAttention, setPersonIdAttention] = useState(false);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const personIdRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const highlightPersonId = () => {
    personIdRef.current?.focus();
    personIdRef.current?.select();
    setPersonIdAttention(false);
    window.requestAnimationFrame(() => setPersonIdAttention(true));
    window.setTimeout(() => setPersonIdAttention(false), 2800);
  };

  const createPerson = useMutation({
    mutationFn: () => api.createPerson({ name, alias, notes }),
    onSuccess: (person) => {
      setCreatedPerson(person);
      queryClient.invalidateQueries({ queryKey: ["people"] });
      setStep(2);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === "person_id_exists") highlightPersonId();
      toast.error(error.message);
    },
  });

  const uploadFaces = useMutation({
    mutationFn: async () => {
      if (!createdPerson) throw new Error("Hãy tạo hồ sơ người trước.");
      for (const photo of photos) {
        await api.uploadFace(createdPerson.id, photo);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      toast.success("Khuôn mặt đã lập chỉ mục trong InsightFace");
      setStep(4);
    },
    onError: (error) => toast.error(error.message),
  });

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    setPhotos((current) => [...current, ...Array.from(files)].slice(0, 10));
  };

  return (
    <PageShell>
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link to="/people">
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
        </Link>
      </Button>

      <div className="border-b border-border pb-5 sm:pb-6">
        <div className="font-mono text-[11px] uppercase tracking-widest text-primary">
          // Enroll
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Thêm người mới</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tải lên 5–10 ảnh khuôn mặt rõ nét. Hệ thống sẽ lập chỉ mục bằng InsightFace và lưu lại các Face ID.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <div key={s.n} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-mono ${
                step >= s.n
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {step > s.n ? <CheckCircle2 className="h-4 w-4" /> : s.n}
            </div>
            <span
              className={`hidden whitespace-nowrap text-xs sm:inline ${step >= s.n ? "font-semibold" : "text-muted-foreground"}`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 ${step > s.n ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      <Card className="border-border bg-card p-4 sm:p-6">
        {step === 1 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label className="text-xs">Bí danh</Label>
              <Input
                value={alias}
                onChange={(e) => {
                  const value = e.target.value;
                  setAlias(value);
                  setName(personIdFromAlias(value));
                }}
                className="mt-1"
                placeholder="Ví dụ: Việt Anh"
              />
            </div>
            <div>
              <Label className="text-xs">Mã người</Label>
              <Input
                ref={personIdRef}
                value={name}
                onChange={(e) => {
                  setName(personIdFromAlias(e.target.value));
                }}
                className={`mt-1 ${personIdAttention ? "insightface-id-attention" : ""}`}
                placeholder="viet_anh"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                Used as the local profile key. Avoid changing it; use only unaccented letters,
                numbers, `_`, `.`, `-`.
              </p>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Ghi chú (không bắt buộc)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
                placeholder="VD: Em gái từ Hà Nội đến chơi"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {photos.map((p) => (
                <Snapshot
                  key={`${p.name}-${p.lastModified}`}
                  size="md"
                  src={URL.createObjectURL(p)}
                />
              ))}
              <label className="grid-bg flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border text-xs text-muted-foreground hover:border-primary/50 hover:text-primary">
                <Upload className="mb-1 h-4 w-4" />
                Thêm
                <input
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple
                  onChange={(e) => onFiles(e.target.files)}
                />
              </label>
            </div>
            <p className="mt-4 font-mono text-xs text-muted-foreground">
              {photos.length} / 10 photos · recommended 5+ varied angles
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 py-4 text-center">
            <Cloud className="mx-auto h-10 w-10 text-primary" />
            <div className="text-sm font-semibold">Đang lập chỉ mục trong InsightFace…</div>
            <div className="font-mono text-xs text-muted-foreground">
              {createdPerson?.displayName ?? createdPerson?.name ?? "Người"} - {photos.length}{" "}
              faces
            </div>
            <div className="mx-auto mt-4 max-w-md space-y-1 text-left">
              {photos.map((p, i) => (
                <div
                  key={`${p.name}-${p.lastModified}`}
                  className="flex items-center justify-between rounded-md border border-border bg-surface-elevated px-3 py-2 text-xs"
                >
                  <span className="font-mono text-muted-foreground">photo_{i + 1}.jpg</span>
                  <span className="flex items-center gap-1 text-muted-foreground">ready</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 ring-1 ring-success/40">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Đã đăng ký người</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {photos.length} faces indexed in InsightFace.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="outline" asChild>
                <Link to="/people">Quay lại danh sách</Link>
              </Button>
              <Button
                onClick={() => {
                  setStep(1);
                  setPhotos([]);
                  setCreatedPerson(null);
                  setName("");
                  setAlias("");
                  setNotes("");
                }}
              >
                Thêm ảnh khác
              </Button>
            </div>
          </div>
        )}

        {step < 4 && (
          <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="outline"
              disabled={step === 1 || createPerson.isPending || uploadFaces.isPending}
              onClick={() => setStep((s) => s - 1)}
            >
              Quay lại
            </Button>
            <Button
              onClick={() => {
                if (step === 1) createPerson.mutate();
                else if (step === 2) setStep(3);
                else uploadFaces.mutate();
              }}
              disabled={
                (step === 1 && (!alias.trim() || !name.trim())) ||
                (step === 2 && photos.length < 1) ||
                createPerson.isPending ||
                uploadFaces.isPending
              }
            >
              {step === 3 ? (uploadFaces.isPending ? "Đang lập chỉ mục..." : "Lập chỉ mục khuôn mặt") : "Tiếp tục"}
            </Button>
          </div>
        )}
      </Card>
    </PageShell>
  );
}
