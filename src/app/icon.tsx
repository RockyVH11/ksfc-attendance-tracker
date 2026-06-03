import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#003087",
          color: "#ffd700",
          fontSize: 120,
          fontWeight: 700,
          fontFamily: "system-ui",
        }}
      >
        KS
      </div>
    ),
    { ...size },
  );
}
