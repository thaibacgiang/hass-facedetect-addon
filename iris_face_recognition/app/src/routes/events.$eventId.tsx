import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Camera,
  Clock,
  Cloud,
  CheckCircle2,
  Loader2,
  UserPlus,
  UserCheck,
  Trash2,
} from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FaceDetailsPanel, parseFaceDetails } from "@/components/face-details-panel";
import { Snapshot } from "@/components/snapshot";
import { api, uploadUrl, type EventItem } from "@/lib/api";
import { ApiError } from "@/lib/http";
import { personIdFromAlias, formatDateTime } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/events/$eventId")({
  head: ({ params }) => ({ meta: [{ title: `Sự kiện ${params.eventId} - IRIS` }] }),
  component: EventDetail,
});

type FaceBoundingBox = { Left?: number; Top?: number; Width?: number; Height?: number };

function parseJsonObject(value?: string): Record<string, unknown> | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function isBoundingBox(value: unknown): value is FaceBoundingBox {
  return Boolean(
    value &&
    typeof value === "object" &&
    typeof (value as FaceBoundingBox).Width === "number" &&
    typeof (value as FaceBoundingBox).Height === "number",
  );
}

function parseEventBoundingBox(event: EventItem): FaceBoundingBox | undefined {
  const fromDetails = parseJsonObject(event.face_details_json)?.bounding_box;
  if (isBoundingBox(fromDetails)) return fromDetails;

  const fromEvent = parseJsonObject(event.face_bounding_box);
  return isBoundingBox(fromEvent) ? fromEvent : undefined;
}

function EventDetail() {
  const { eventId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["events", eventId],
    queryFn: () => api.event(eventId),
    refetchInterval: (query) => {
      const event = query.state.data;
      return event && event.image_path && !event.face_details_json ? 1000 : false;
    },
  });
  const { data: people = [] } = useQuery({ queryKey: ["people"], queryFn: api.people });
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonAlias, setNewPersonAlias] = useState("");
  const [newPersonPersonIdAttention, setNewPersonPersonIdAttention] = useState(false);
  const newPersonPersonIdRef = useRef<HTMLInputElement>(null);
  const person = event?.personId ? people.find((p) => p.id === event.personId) : undefined;
  const canTrain = Boolean(
    event &&
    ["unknown", "review", "known"].includes(event.type) &&
    !event.isTrained &&
    event.image_path,
  );
  const boundingBox = event?.image_path ? parseEventBoundingBox(event) : undefined;
  const faceDetails = event ? parseFaceDetails(event.face_details_json) : undefined;

  useEffect(() => {
    if (event?.personId) setSelectedPersonId(event.personId);
  }, [event?.personId]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["events"] });
    queryClient.invalidateQueries({ queryKey: ["events", eventId] });
    queryClient.invalidateQueries({ queryKey: ["people"] });
    queryClient.invalidateQueries({ queryKey: ["unknowns"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const highlightNewPersonPersonId = () => {
    newPersonPersonIdRef.current?.focus();
    newPersonPersonIdRef.current?.select();
    setNewPersonPersonIdAttention(false);
    window.requestAnimationFrame(() => setNewPersonPersonIdAttention(true));
    window.setTimeout(() => setNewPersonPersonIdAttention(false), 2800);
  };

  const trainExisting = useMutation({
    mutationFn: () => api.trainEvent(eventId, selectedPersonId),
    onSuccess: (result) => {
      queryClient.setQueryData(["events", eventId], result.event);
      toast.success("Đã huấn luyện khuôn mặt vào người đã có");
      setSelectedPersonId("");
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const createAndTrain = useMutation({
    mutationFn: async () => {
      const person = await api.createPerson({
        name: newPersonName,
        alias: newPersonAlias,
        notes: `Tạo từ sự kiện ${eventId}`,
      });
      return api.trainEvent(eventId, person.id);
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["events", eventId], result.event);
      toast.success("Đã tạo người và huấn luyện khuôn mặt");
      setNewPersonName("");
      setNewPersonAlias("");
      invalidate();
    },
    onError: (err) => {
      if (err instanceof ApiError && err.code === "person_id_exists") highlightNewPersonPersonId();
      toast.error(err.message);
    },
  });

  const remove = useMutation({
    mutationFn: () => api.deleteEvent(eventId),
    onSuccess: () => {
      toast.success("Đã xóa sự kiện");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["unknowns"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      navigate({ to: "/events" });
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading)
    return (
      <PageShell>
        <div className="text-sm text-muted-foreground">Đang tải sự kiện...</div>
      </PageShell>
    );
  if (error || !event) {
    return (
      <PageShell>
        <Card className="border-border bg-card p-8 text-center">
          <h2 className="text-lg font-semibold">Không tìm thấy sự kiện</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No record for <code>{eventId}</code>.
          </p>
          <Button asChild className="mt-4">
            <Link to="/events">Quay lại Sự kiện</Link>
          </Button>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link to="/events">
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại sự kiện
          </Link>
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            disabled={remove.isPending}
            onClick={() => remove.mutate()}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Xóa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="overflow-hidden border-border bg-card p-0">
            <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 sm:items-center sm:px-5">
              <div>
                <h3 className="text-sm font-semibold">Ảnh chụp</h3>
                <div className="font-mono text-[11px] text-muted-foreground">{event.id}</div>
              </div>
              {event.type === "known" && (
                <Badge variant="outline" className="border-success/40 text-success">
                  Đã nhận diện
                </Badge>
              )}
              {event.type === "review" && (
                <Badge variant="outline" className="border-warning/40 text-warning">
                  Cần xem xét
                </Badge>
              )}
              {event.type === "unknown" && (
                <Badge variant="outline" className="border-warning/40 text-warning">
                  Người lạ
                </Badge>
              )}
              {event.type === "no_face" && (
                <Badge
                  variant="outline"
                  className="border-muted-foreground/30 text-muted-foreground"
                >
                  Không có khuôn mặt
                </Badge>
              )}
              {event.type === "skipped" && (
                <Badge
                  variant="outline"
                  className="border-muted-foreground/30 text-muted-foreground"
                >
                  Đã bỏ qua
                </Badge>
              )}
              {event.type === "error" && (
                <Badge variant="outline" className="border-destructive/40 text-destructive">
                  Error
                </Badge>
              )}
              {event.type === "processing" && (
                <Badge variant="outline" className="border-primary/30 text-primary">
                  Đang xử lý
                </Badge>
              )}
            </div>
            <div className="grid-bg relative aspect-video bg-black/60">
              <div className="absolute inset-0 flex items-center justify-center">
                <Snapshot
                  size="full"
                  unknown={event.type === "unknown"}
                  confidence={event.confidence > 0 ? event.confidence : undefined}
                  label={event.personName}
                  src={uploadUrl(event.image_path || event.face_crop_path || event.thumb_path)}
                  boundingBox={boundingBox}
                  imageFit="cover"
                  labelMode="box"
                />
              </div>
              <div className="absolute bottom-2 left-2 font-mono text-[10px] text-muted-foreground">
                Snapshot - {event.cameraName}
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-4 sm:p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold">Chi tiết khuôn mặt</h3>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Thuộc tính InsightFace
              </span>
            </div>
            <div className="mt-3">
              <FaceDetailsPanel details={faceDetails} />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-border bg-card p-5">
            <h3 className="text-sm font-semibold">Kết quả nhận diện</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Người khớp</span>
                <span className="font-medium">{person?.name ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Độ tin cậy</span>
                <span
                  className={`font-mono ${event.confidence >= 95 ? "text-success" : event.confidence >= 90 ? "text-warning" : "text-destructive"}`}
                >
                  {event.confidence > 0 ? `${event.confidence.toFixed(1)}%` : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã InsightFace</span>
                <span className="font-mono text-xs">{event.faceId ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thời gian nhận diện</span>
                <span className="font-mono text-xs">
                  {event.processing_ms > 0 ? `${event.processing_ms.toFixed(0)} ms` : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đã tự động chấp nhận</span>
                {event.type === "known" ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <span className="text-xs text-muted-foreground">Không</span>
                )}
              </div>
            </div>
            {person && (
              <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                <Link to="/people/$personId" params={{ personId: person.id }}>
                  Mở hồ sơ
                </Link>
              </Button>
            )}
          </Card>

          {canTrain && (
            <Card className="border-border bg-card p-5">
              <h3 className="text-sm font-semibold">Huấn luyện khuôn mặt này</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Thêm ảnh chụp này vào các khuôn mặt tham chiếu mới nhất của một người.
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <Label className="text-xs">Người đã có</Label>
                  <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                    <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn..." />
                      </SelectTrigger>
                      <SelectContent>
                        {people.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.displayName || person.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => trainExisting.mutate()}
                      disabled={!selectedPersonId || trainExisting.isPending}
                    >
                      {trainExisting.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <UserCheck className="mr-2 h-4 w-4" />
                      )}
                      {trainExisting.isPending ? "Đang huấn luyện..." : "Huấn luyện"}
                    </Button>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <Label className="text-xs">Người mới</Label>
                  <Input
                    value={newPersonAlias}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewPersonAlias(value);
                      setNewPersonName(personIdFromAlias(value));
                    }}
                    className="mt-1"
                    placeholder="Bí danh"
                  />
                  <Input
                    ref={newPersonPersonIdRef}
                    value={newPersonName}
                    onChange={(event) => {
                      setNewPersonName(personIdFromAlias(event.target.value));
                    }}
                    className={`mt-2 ${newPersonPersonIdAttention ? "insightface-id-attention" : ""}`}
                    placeholder="Mã người"
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Person ID is the local profile key. Use only unaccented letters, numbers, `_`,
                    `.`, `-`.
                  </p>
                  <Button
                    className="mt-2 w-full"
                    onClick={() => createAndTrain.mutate()}
                    disabled={
                      !newPersonAlias.trim() || !newPersonName.trim() || createAndTrain.isPending
                    }
                  >
                    {createAndTrain.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    {createAndTrain.isPending ? "Đang huấn luyện..." : "Tạo và huấn luyện"}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {event?.isTrained && person && (
            <Card className="border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold">Đã huấn luyện</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This face is assigned to {person.displayName || person.name}.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                    <Link to="/people/$personId" params={{ personId: person.id }}>
                      Mở hồ sơ
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <Card className="border-border bg-card p-5">
            <h3 className="text-sm font-semibold">Siêu dữ liệu</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <span className="text-muted-foreground">
                  <Camera className="mr-1 inline h-3 w-3" /> Camera
                </span>
                <span className="font-mono">{event.cameraName}</span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <span className="text-muted-foreground">
                  <Clock className="mr-1 inline h-3 w-3" /> Thời gian
                </span>
                <span className="font-mono text-xs">{formatDateTime(event.time)}</span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <span className="text-muted-foreground">Nguồn</span>
                <span className="font-mono text-xs">Tải lên thủ công/API</span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <span className="text-muted-foreground">
                  <Cloud className="mr-1 inline h-3 w-3" /> Suy luận
                </span>
                <span className="font-mono text-xs">{event.inferenceId}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
