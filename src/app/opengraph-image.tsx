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
          justifyContent: "center", padding: 80, background: "linear-gradient(120deg, #223c47, #3d6172 55%, #9dbb9f)", color: "white",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 600, letterSpacing: -2, color: "#d6f45b" }}>{site.name}</div>
        <div style={{ fontSize: 36, marginTop: 24, maxWidth: 900, lineHeight: 1.3 }}>{site.tagline}</div>
      </div>
    ),
    size,
  );
}
