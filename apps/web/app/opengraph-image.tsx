import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "OpenVitals — Your personal health data platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fontsDir = join(process.cwd(), "app/fonts");
  const [displayFont, bodyFont] = await Promise.all([
    readFile(join(fontsDir, "SourceSerif4-SemiBold.ttf")),
    readFile(join(fontsDir, "DMSans-Regular.ttf")),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FAFAF8",
        padding: "56px 64px",
        fontFamily: "DM Sans",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="56.79 53.92 136.52 141.47"
          width={36}
          height={36}
        >
          <path
            fill="#141414"
            d="M124.9 53.92c-17.81 0-32.83 12.79-38.01 32.01-3.64 13.36-5.24 24.75-13.34 36.5-.3 1.34 3.21 5.04 4.8 5.72 7.55-7.72 11.47-23.14 13.76-32.18 5.11-20.61 16.41-34.59 35.05-34.59 9.07 0 16.97 5.61 20.67 8.62 3.3-.92 6.52-.89 9.03-1.06-8.14-10.96-17.92-15.02-31.96-15.02z"
          />
          <path
            fill="#141414"
            d="M157 73.59c-13.87-.23-24.13 6.82-40.31 6.82-3.98 0-7.54-.17-10.65-.62-2.56-.38-3.69 4.87-4.5 6.93 5.25 1.35 7.3 1.73 15.13 1.73 12.82 0 25.89-5.65 38.22-5.65 19.49 0 30.67 13.42 31.79 26.93.36 4.49-.43 8.45-1.43 10.77 2.32 3.43 3.46 5.86 4.67 7.76 2.4-5.65 3.43-10.15 3.39-16.83-.17-18.34-13.91-37.5-36.31-37.84z"
          />
          <path
            fill="#141414"
            d="M151 87.66c.39 8.2 7 19.43 15.09 29.46 9.15 11.34 17.08 20.85 16.51 31.27-.6 10.57-8.85 20.77-17.05 23.73-1.24 3.77-2.74 6.46-4.72 8.49 16.07-2.69 28.97-16.53 28.97-33.25 0-12.27-7.66-22.65-15.02-31.6-7.94-9.61-12.63-18.45-14.69-27.33-.59-1.76-2.16-1.41-5.06-1.41-2.08 0-3.26.11-4.03.64z"
          />
          <path
            fill="#141414"
            d="M170.2 129.9c-6.83 5.17-12.73 22.91-14.97 32.8-4.3 14.77-14.1 25.43-29.99 25.43-6.04 0-9.26-1.4-12.75-3.01-3.99 1.27-7.13 1.47-9.96 1.47 7.47 5.83 15.05 8.8 23.45 8.8 16.78 0 29.63-11.48 34.61-27.32 4.24-13.6 6.25-22.03 13.04-30.91 1.34-1.44-1.42-6.25-3.43-7.26z"
          />
          <path
            fill="#141414"
            d="M148.6 162.5c-15.89-.85-28.1 6.34-41.53 10.74-4.17 1.4-7.07 1.5-9.36 1.5-16.4 0-27.61-13.02-30.38-31.82-3.05-2.93-5.06-4.83-6.69-7.43-.77 3-.94 4.73-.94 7.42 0 16.76 14.32 39.22 37.22 39.22h2.28c10.62 0 25.6-10.69 46.61-12.31 2.09-.1 2.99-4.98 3.3-6.88.03-.17-.21-.37-.51-.44z"
          />
          <path
            fill="#141414"
            d="M87.88 73.05c-17.84 3.03-30.87 20.64-31.09 37.67-.18 13.06 8.52 25.07 20.95 33.98 9.5 7.15 18.53 13.07 24.47 23.68 1.24 1.13 6.06-.2 6.57-1.22-3.86-12.17-15.03-20.51-24.1-27.56-8.57-6.78-20.46-16.58-19.95-28.92.77-13.6 9.61-24.91 19.15-27.27 1.73-4.55 2.49-6.8 4.15-10.09l-.15-.27z"
          />
          <path
            fill="#141414"
            d="M78.79 96.92c-6.22 3.9-10.7 10.79-9.58 16.59l.32 2.43 7.26-11.61 2.2-7.52-.2.11z"
          />
          <path
            fill="#141414"
            d="M79.41 151.4l6.67 5.04 7.9 12.65c-5.95-.8-7.51-4.03-9.56-7.92-1.73-3.25-3.61-5.98-5.01-9.77z"
          />
          <path
            fill="#141414"
            d="M140.8 177.1c-4.53 4.52-7.17 5.17-18.42 3.16l-.11-.28 6.22-2.24c3.63-.81 7.33-.7 12.14-.95l.17.31z"
          />
          <path
            fill="#141414"
            d="M176.9 145.4c2.29 7.05-1.7 12.69-8.21 17.21l5.02-12.79 2.98-4.52.21.1z"
          />
          <path
            fill="#141414"
            d="M168.1 89.23l4.03 2.96c5.04 3.32 5.14 15.11 5.07 17.84l-5.31-6.89c-.59-5.42-2.79-10.33-4.17-13.81l.38-.1z"
          />
          <path
            fill="#141414"
            d="M110.4 72.91c2.6-2.82 5.37-4.08 9.7-4.08 5.94 0 8.92.99 13.3 3.23l-6.95 1.83c-4.71-.47-9.42-1.42-15.85-1.15l-.2.17z"
          />
        </svg>
        <span
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#141414",
            fontFamily: "Source Serif 4",
          }}
        >
          OpenVitals
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          gap: 60,
          marginTop: -10,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 44,
              fontWeight: 600,
              lineHeight: 1.2,
              color: "#141414",
              fontFamily: "Source Serif 4",
              letterSpacing: "-0.5px",
            }}
          >
            <span>Make your health data&nbsp;</span>
            <span style={{ color: "#3162FF", fontStyle: "italic" }}>
              extraordinarily
            </span>
            <span>&nbsp;clear.</span>
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#737373",
              lineHeight: 1.5,
              fontFamily: "DM Sans",
            }}
          >
            The best way to understand your medical records, lab results, and
            biomarkers.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            width: 380,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            {biomarkerCard(
              "LDL Cholesterol",
              "98",
              "mg/dL",
              "#16A34A",
              "Normal",
            )}
            {biomarkerCard("HbA1c", "5.9", "%", "#D97706", "Warning")}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {biomarkerCard("Ferritin", "14", "ng/mL", "#DC2626", "Critical")}
            {biomarkerCard("Vitamin D", "22", "ng/mL", "#D97706", "Warning")}
          </div>
          {wideSparkline(
            [42, 44, 47, 50, 54, 58, 63, 67, 72, 76, 81, 85, 90, 94],
            "#16A34A",
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 15, color: "#999999", fontFamily: "DM Sans" }}>
          openvitals.ai
        </span>
        <span
          style={{
            fontSize: 13,
            color: "#999999",
            fontFamily: "DM Sans",
            background: "#F2F2F2",
            padding: "6px 14px",
            borderRadius: 6,
          }}
        >
          Open Source
        </span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Source Serif 4",
          data: displayFont,
          style: "normal",
          weight: 600,
        },
        {
          name: "DM Sans",
          data: bodyFont,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}

function wideSparkline(data: number[], color: string) {
  const width = 380;
  const height = 100;
  const padX = 4;
  const padTop = 20;
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
        borderRadius: 10,
        border: "1px solid #E5E5E5",
        padding: "10px 0 0 0",
        overflow: "hidden",
      }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <polygon points={fillPoints} fill={color} opacity={0.06} />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={cx} cy={cy} r={3} fill={color} />
      </svg>
    </div>
  );
}

function biomarkerCard(
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
        padding: "16px 18px",
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        border: "1px solid #E5E5E5",
        gap: 6,
      }}
    >
      <span style={{ fontSize: 12, color: "#737373", fontFamily: "DM Sans" }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "#141414",
            fontFamily: "Source Serif 4",
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        <span style={{ fontSize: 13, color: "#999999", fontFamily: "DM Sans" }}>
          {unit}
        </span>
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: dotColor,
          }}
        />
        <span style={{ fontSize: 11, color: dotColor, fontFamily: "DM Sans" }}>
          {statusLabel}
        </span>
      </div>
    </div>
  );
}
