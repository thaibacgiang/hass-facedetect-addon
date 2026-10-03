type FaceDetails = {
  confidence?: number;
  bounding_box?: { Left?: number; Top?: number; Width?: number; Height?: number };
  landmarks?: { X?: number; Y?: number }[];
  model?: string;
  provider?: string;
  inference_id?: string;
  age?: number | null;
  gender?: "male" | "female" | null;
};

interface FaceDetailsPanelProps {
  details?: FaceDetails;
}

export function parseFaceDetails(value?: string): FaceDetails | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function percent(value?: number, ratio = false) {
  return typeof value === "number" ? `${(ratio ? value * 100 : value).toFixed(1)}%` : "-";
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 break-all text-right font-mono">{value}</span>
    </div>
  );
}

export function FaceDetailsPanel({ details }: FaceDetailsPanelProps) {
  if (!details || Object.keys(details).length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
        Analyzing face…
      </div>
    );
  }

  const box = details.bounding_box;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <DetailRow label="Độ tin cậy phát hiện" value={percent(details.confidence)} />
        <DetailRow label="Mô hình" value={details.model || "-"} />
        <DetailRow label="Bộ thực thi" value={details.provider || "-"} />
        <DetailRow label="Mã suy luận" value={details.inference_id || "-"} />
        <DetailRow label="Tuổi ước tính" value={details.age == null ? "-" : String(details.age)} />
        <DetailRow label="Giới tính ước tính" value={details.gender || "-"} />
      </div>
      <div className="space-y-2">
        <DetailRow label="Lề trái khung" value={percent(box?.Left, true)} />
        <DetailRow label="Lề trên khung" value={percent(box?.Top, true)} />
        <DetailRow label="Chiều rộng khung" value={percent(box?.Width, true)} />
        <DetailRow label="Chiều cao khung" value={percent(box?.Height, true)} />
        <DetailRow label="Điểm mốc khuôn mặt" value={String(details.landmarks?.length ?? 0)} />
      </div>
    </div>
  );
}
