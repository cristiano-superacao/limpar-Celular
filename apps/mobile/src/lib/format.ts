export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes)) return "-";
  const units = ["B", "KB", "MB", "GB"] as const;
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  const digits = idx === 0 ? 0 : idx === 1 ? 0 : 1;
  return `${value.toFixed(digits)} ${units[idx]}`;
}

export function statusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "Pendente";
    case "APPROVED":
      return "Aprovado";
    case "REJECTED":
      return "Rejeitado";
    case "SCANNED":
      return "Varredura pronta";
    case "COMPLETED":
      return "Concluído";
    default:
      return status;
  }
}
