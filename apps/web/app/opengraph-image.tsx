import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { APP_DOMAIN } from "@/constants/app";

export const alt = "OpenVitals — Your personal health data platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fontsDir = join(process.cwd(), "app/fonts");
  const [geistRegular, geistMedium, geistMonoBold] = await Promise.all([
    readFile(join(fontsDir, "Geist-Regular.ttf")),
    readFile(join(fontsDir, "Geist-Medium.ttf")),
    readFile(join(fontsDir, "GeistMono-Bold.ttf")),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FAFAFA",
        padding: "48px 56px",
        fontFamily: "Geist",
      }}
    >
      {/* Top bar — logo + badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="56.79 53.92 136.52 141.47"
          width={72}
          height={72}
        >
          <path
            fill="#3162FF"
            d="M124.9 53.92c-17.81 0-32.83 12.79-38.01 32.01-3.64 13.36-5.24 24.75-13.34 36.5-.3 1.34 3.21 5.04 4.8 5.72 7.55-7.72 11.47-23.14 13.76-32.18 5.11-20.61 16.41-34.59 35.05-34.59 9.07 0 16.97 5.61 20.67 8.62 3.3-.92 6.52-.89 9.03-1.06-8.14-10.96-17.92-15.02-31.96-15.02z"
          />
          <path
            fill="#3162FF"
            d="M157 73.59c-13.87-.23-24.13 6.82-40.31 6.82-3.98 0-7.54-.17-10.65-.62-2.56-.38-3.69 4.87-4.5 6.93 5.25 1.35 7.3 1.73 15.13 1.73 12.82 0 25.89-5.65 38.22-5.65 19.49 0 30.67 13.42 31.79 26.93.36 4.49-.43 8.45-1.43 10.77 2.32 3.43 3.46 5.86 4.67 7.76 2.4-5.65 3.43-10.15 3.39-16.83-.17-18.34-13.91-37.5-36.31-37.84z"
          />
          <path
            fill="#3162FF"
            d="M151 87.66c.39 8.2 7 19.43 15.09 29.46 9.15 11.34 17.08 20.85 16.51 31.27-.6 10.57-8.85 20.77-17.05 23.73-1.24 3.77-2.74 6.46-4.72 8.49 16.07-2.69 28.97-16.53 28.97-33.25 0-12.27-7.66-22.65-15.02-31.6-7.94-9.61-12.63-18.45-14.69-27.33-.59-1.76-2.16-1.41-5.06-1.41-2.08 0-3.26.11-4.03.64z"
          />
          <path
            fill="#3162FF"
            d="M170.2 129.9c-6.83 5.17-12.73 22.91-14.97 32.8-4.3 14.77-14.1 25.43-29.99 25.43-6.04 0-9.26-1.4-12.75-3.01-3.99 1.27-7.13 1.47-9.96 1.47 7.47 5.83 15.05 8.8 23.45 8.8 16.78 0 29.63-11.48 34.61-27.32 4.24-13.6 6.25-22.03 13.04-30.91 1.34-1.44-1.42-6.25-3.43-7.26z"
          />
          <path
            fill="#3162FF"
            d="M148.6 162.5c-15.89-.85-28.1 6.34-41.53 10.74-4.17 1.4-7.07 1.5-9.36 1.5-16.4 0-27.61-13.02-30.38-31.82-3.05-2.93-5.06-4.83-6.69-7.43-.77 3-.94 4.73-.94 7.42 0 16.76 14.32 39.22 37.22 39.22h2.28c10.62 0 25.6-10.69 46.61-12.31 2.09-.1 2.99-4.98 3.3-6.88.03-.17-.21-.37-.51-.44z"
          />
          <path
            fill="#3162FF"
            d="M87.88 73.05c-17.84 3.03-30.87 20.64-31.09 37.67-.18 13.06 8.52 25.07 20.95 33.98 9.5 7.15 18.53 13.07 24.47 23.68 1.24 1.13 6.06-.2 6.57-1.22-3.86-12.17-15.03-20.51-24.1-27.56-8.57-6.78-20.46-16.58-19.95-28.92.77-13.6 9.61-24.91 19.15-27.27 1.73-4.55 2.49-6.8 4.15-10.09l-.15-.27z"
          />
          <path
            fill="#3162FF"
            d="M78.79 96.92c-6.22 3.9-10.7 10.79-9.58 16.59l.32 2.43 7.26-11.61 2.2-7.52-.2.11z"
          />
          <path
            fill="#3162FF"
            d="M79.41 151.4l6.67 5.04 7.9 12.65c-5.95-.8-7.51-4.03-9.56-7.92-1.73-3.25-3.61-5.98-5.01-9.77z"
          />
          <path
            fill="#3162FF"
            d="M140.8 177.1c-4.53 4.52-7.17 5.17-18.42 3.16l-.11-.28 6.22-2.24c3.63-.81 7.33-.7 12.14-.95l.17.31z"
          />
          <path
            fill="#3162FF"
            d="M176.9 145.4c2.29 7.05-1.7 12.69-8.21 17.21l5.02-12.79 2.98-4.52.21.1z"
          />
          <path
            fill="#3162FF"
            d="M168.1 89.23l4.03 2.96c5.04 3.32 5.14 15.11 5.07 17.84l-5.31-6.89c-.59-5.42-2.79-10.33-4.17-13.81l.38-.1z"
          />
          <path
            fill="#3162FF"
            d="M110.4 72.91c2.6-2.82 5.37-4.08 9.7-4.08 5.94 0 8.92.99 13.3 3.23l-6.95 1.83c-4.71-.47-9.42-1.42-15.85-1.15l-.2.17z"
          />
        </svg>
        {/* Open source badge */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#999999",
            fontFamily: "Geist Mono",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            border: "1px solid #E5E5E5",
            padding: "5px 12px",
          }}
        >
          Open Source
        </span>
      </div>

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          gap: 48,
          marginTop: -48,
        }}
      >
        {/* Left — headline + description */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 500,
              lineHeight: 1.05,
              color: "#141414",
              fontFamily: "Geist",
              letterSpacing: "-0.035em",
            }}
          >
            Understand Your Health Data
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#737373",
              lineHeight: 1.5,
              fontFamily: "Geist",
            }}
          >
            The only open-source platform that parses, normalizes, and tracks
            health records from any lab, provider, or format.
          </div>
        </div>

        {/* Right — data cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 380,
            flexShrink: 0,
            gap: 0,
          }}
        >
          {/* Metric cards grid */}
          <div style={{ display: "flex", gap: 0, border: "1px solid #E5E5E5" }}>
            {metricCard("LDL Cholesterol", "98", "mg/dL", "#16A34A", "NORMAL")}
            {metricCard("HbA1c", "5.9", "%", "#D97706", "BORDER")}
          </div>
          <div
            style={{
              display: "flex",
              gap: 0,
              borderLeft: "1px solid #E5E5E5",
              borderRight: "1px solid #E5E5E5",
              borderBottom: "1px solid #E5E5E5",
            }}
          >
            {metricCard("Ferritin", "14", "ng/mL", "#DC2626", "LOW")}
            {metricCard("Vitamin D", "22", "ng/mL", "#DC2626", "LOW")}
          </div>
          {/* Sparkline */}
          {wideSparkline([142, 135, 128, 118, 112, 105, 98], "#16A34A")}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: "#999999",
            fontFamily: "Geist Mono",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {APP_DOMAIN}
        </span>
        <div style={{ display: "flex", gap: 16 }}>
          {["LABS", "MEDS", "AI CHAT", "SHARING"].map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#999999",
                fontFamily: "Geist Mono",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Geist",
          data: geistRegular,
          style: "normal",
          weight: 400,
        },
        {
          name: "Geist",
          data: geistMedium,
          style: "normal",
          weight: 500,
        },
        {
          name: "Geist Mono",
          data: geistMonoBold,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}

function wideSparkline(data: number[], color: string) {
  const width = 380;
  const height = 80;
  const padX = 0;
  const padTop = 16;
  const padBottom = 4;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = padX + (i / (data.length - 1)) * (width - padX * 2);
      const y =
        padTop + (1 - (v - min) / range) * (height - padTop - padBottom);
      return `${x},${y}`;
    })
    .join(" ");

  const last = data[data.length - 1]!;
  const cx = width - padX;
  const cy =
    padTop + (1 - (last - min) / range) * (height - padTop - padBottom);

  const firstX = padX;
  const fillPoints = `${firstX},${height} ${points} ${cx},${height}`;

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E5E5",
        borderTop: "none",
        padding: "8px 0 0 0",
        overflow: "hidden",
      }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <polygon points={fillPoints} fill={color} opacity={0.06} />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <rect x={cx - 2} y={cy - 2} width={4} height={4} fill={color} />
      </svg>
    </div>
  );
}

function metricCard(
  label: string,
  value: string,
  unit: string,
  dotColor: string,
  statusLabel: string,
) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        padding: "14px 16px",
        backgroundColor: "#FFFFFF",
        borderRight: "1px solid #E5E5E5",
        gap: 4,
      }}
    >
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: "#999999",
          fontFamily: "Geist Mono",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span
          style={{
            fontSize: 26,
            fontWeight: 500,
            color: "#141414",
            fontFamily: "Geist",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </span>
        <span
          style={{
            fontSize: 10,
            color: "#999999",
            fontFamily: "Geist Mono",
          }}
        >
          {unit}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginTop: 2,
        }}
      >
        <div
          style={{
            width: 5,
            height: 5,
            backgroundColor: dotColor,
          }}
        />
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: dotColor,
            fontFamily: "Geist Mono",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {statusLabel}
        </span>
      </div>
    </div>
  );
}
