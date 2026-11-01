import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "center", padding: 80, background: "#0b1020", color: "white",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 800, color: "#818cf8" }}>{site.name}</div>
        <div style={{ fontSize: 36, marginTop: 24, maxWidth: 900, lineHeight: 1.3 }}>{site.tagline}</div>
      </div>
    ),
    size,
  );
}
