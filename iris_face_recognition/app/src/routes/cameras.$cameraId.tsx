import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2, Copy } from "lucide-react";

import { CameraLiveThumb } from "@/components/camera-live-thumb";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Snapshot } from "@/components/snapshot";
import { API_BASE, api, uploadUrl } from "@/lib/api";
import { copyText } from "@/lib/clipboard";

export const Route = createFileRoute("/cameras/$cameraId")({
  head: ({ params }) => ({ meta: [{ title: `${params.cameraId} - IRIS` }] }),
  component: CameraDetail,
});

function CameraDetail() {
  const { cameraId } = Route.useParams();
  const queryClient = useQueryClient();
  const {
    data: camera,
    isLoading,
    error,
  } = useQuery({ queryKey: ["cameras", cameraId], queryFn: () => api.camera(cameraId) });
  const { data: eventsPage } = useQuery({
    queryKey: ["events", "camera", cameraId],
    queryFn: () => api.events({ camera_id: cameraId, limit: 12 }),
  });
  const [name, setName] = useState("");
  const [stillUrl, setStillUrl] = useState("");
  const [cooldown, setCooldown] = useState([60]);
  const [burstCount, setBurstCount] = useState([5]);
  const [burstIntervalMs, setBurstIntervalMs] = useState([1000]);
  const [autoInterval, setAutoInterval] = useState([0]);

  useEffect(() => {
    if (!camera) return;
    setName(camera.name);
    setStillUrl(camera.still_url || camera.stream_url || "");
    setCooldown([camera.cooldown]);
    setBurstCount([camera.burst_count ?? 5]);
    setBurstIntervalMs([camera.burst_interval_ms ?? 1000]);
    setAutoInterval([camera.auto_interval ?? 0]);
  }, [camera]);

  const save = useMutation({
    mutationFn: () =>
      api.updateCamera(cameraId, {
        name,
        status: camera?.status ?? "online",
        still_url: stillUrl,
        face_detection: true,
        motion: true,
        cooldown: cooldown[0],
        min_face: camera?.min_face ?? 8,
        min_confidence: camera?.min_confidence ?? 80,
        burst_count: burstCount[0],
        burst_interval_ms: burstIntervalMs[0],
        auto_interval: autoInterval[0],
      }),
    onSuccess: () => {
      toast.success("Đã lưu camera");
      queryClient.invalidateQueries({ queryKey: ["cameras"] });
      queryClient.invalidateQueries({ queryKey: ["cameras", cameraId] });
    },
    onError: (err) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: () => api.deleteCamera(cameraId),
    onSuccess: () => {
      toast.success("Đã xóa camera");
      window.location.href = "/cameras";
    },
    onError: (err) => toast.error(err.message),
  });

  const cameraEvents = useMemo(() => eventsPage?.items ?? [], [eventsPage?.items]);

  if (isLoading)
    return (
      <PageShell>
        <div className="text-sm text-muted-foreground">Đang tải camera...</div>
      </PageShell>
    );
  if (error || !camera) {
    return (
      <PageShell>
        <Card className="border-border bg-card p-8 text-center">
          <h2 className="text-lg font-semibold">Không tìm thấy camera</h2>
          <Button asChild className="mt-4">
            <Link to="/cameras">Quay lại Camera</Link>
          </Button>
        </Card>
      </PageShell>
    );
  }

  const triggerUrl = `${API_BASE}${camera.trigger_path}`;

  return (
    <PageShell>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link to="/cameras">
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Link>
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => remove.mutate()}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Xóa
          </Button>
          <Button onClick={() => save.mutate()}>
            <Save className="mr-2 h-4 w-4" /> Lưu
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:pb-6">
        <div className="min-w-0">
          <div className="font-mono text-[11px] uppercase tracking-widest text-primary">
            // {camera.id}
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{camera.name}</h1>
          <p className="mt-1 break-all font-mono text-xs text-muted-foreground">{triggerUrl}</p>
        </div>
        <Badge
          variant="outline"
          className={
            camera.status === "online"
              ? "border-success/40 text-success"
              : "border-destructive/40 text-destructive"
          }
        >
          {camera.status === "online" ? "Trực tuyến" : "Ngoại tuyến"}
        </Badge>
      </div>

      <Card className="overflow-hidden border-border bg-card p-0">
        <CameraLiveThumb camera={camera} iconClassName="h-12 w-12 text-primary/30" />
      </Card>

      <Card className="border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Lịch sử ảnh</h3>
          <span className="font-mono text-xs text-muted-foreground">
            {cameraEvents.length} recent
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {cameraEvents.map((event) => (
            <Link
              key={event.id}
              to="/events/$eventId"
              params={{ eventId: event.id }}
              className="block"
            >
              <div className="space-y-2">
                <Snapshot
                  size="md"
                  src={uploadUrl(event.face_crop_path || event.image_path || event.thumb_path)}
                  confidence={event.confidence}
                  unknown={event.type === "unknown"}
                />
                <div className="truncate text-xs text-muted-foreground">{event.personName}</div>
              </div>
            </Link>
          ))}
          {cameraEvents.length === 0 && (
            <div className="col-span-full text-sm text-muted-foreground">
              Chưa có ảnh kích hoạt.
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Thời gian chờ</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Sau mỗi lần phát hiện được khuôn mặt, bỏ qua các lần kích hoạt trong khoảng thời gian này để tránh gọi InsightFace trùng lặp.
          </p>
          <div className="mt-4">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Thời gian chờ</span>
              <span className="font-mono text-primary">{cooldown[0]}s</span>
            </div>
            <Slider
              value={cooldown}
              onValueChange={setCooldown}
              min={10}
              max={300}
              step={10}
              className="mt-2"
            />
          </div>
        </Card>

        <Card className="border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Hồ sơ camera</h3>
          <div className="mt-5 grid grid-cols-1 gap-5">
            <div>
              <Label className="text-xs">Tên</Label>
              <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">URL ảnh tĩnh</Label>
              <Input
                className="mt-1 font-mono"
                value={stillUrl}
                onChange={(e) => setStillUrl(e.target.value)}
                placeholder="http://camera/snapshot.jpg"
              />
            </div>
            <div>
              <Label className="text-xs">URL kích hoạt</Label>
              <div className="mt-1 flex gap-2">
                <Input className="min-w-0 font-mono" value={triggerUrl} readOnly />
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    await copyText(triggerUrl);
                    toast.success("Đã sao chép URL kích hoạt");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold">Chụp liên tiếp &amp; tự động quét</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Mỗi lần kích hoạt, hệ thống chụp nhiều khung hình liên tiếp và dừng ngay khi nhận ra người
            quen, thay vì chỉ chụp một ảnh đúng lúc bấm nút (lúc đó người thường chưa vào khung hình).
          </p>
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Số khung hình tối đa</span>
                <span className="font-mono text-primary">{burstCount[0]}</span>
              </div>
              <Slider value={burstCount} onValueChange={setBurstCount} min={1} max={15} step={1} className="mt-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Khoảng cách giữa các khung</span>
                <span className="font-mono text-primary">{(burstIntervalMs[0] / 1000).toFixed(1)}s</span>
              </div>
              <Slider
                value={burstIntervalMs}
                onValueChange={setBurstIntervalMs}
                min={200}
                max={5000}
                step={100}
                className="mt-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Tự động quét (không cần bấm nút)</span>
                <span className="font-mono text-primary">
                  {autoInterval[0] === 0 ? "Tắt" : `mỗi ${autoInterval[0]}s`}
                </span>
              </div>
              <Slider
                value={autoInterval}
                onValueChange={(value) => setAutoInterval([value[0] === 1 ? 2 : value[0]])}
                min={0}
                max={60}
                step={1}
                className="mt-2"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Bật sẽ chụp camera định kỳ để tìm khuôn mặt, tốn thêm CPU. Nên đặt từ 3–5 giây.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
