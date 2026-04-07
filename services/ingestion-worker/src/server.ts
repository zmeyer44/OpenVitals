// Polyfill DOMMatrix for pdfjs-dist in Node.js (not available on Alpine Linux)
if (typeof globalThis.DOMMatrix === "undefined") {
  class DOMMatrix {
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    e = 0;
    f = 0;
    m11 = 1;
    m12 = 0;
    m13 = 0;
    m14 = 0;
    m21 = 0;
    m22 = 1;
    m23 = 0;
    m24 = 0;
    m31 = 0;
    m32 = 0;
    m33 = 1;
    m34 = 0;
    m41 = 0;
    m42 = 0;
    m43 = 0;
    m44 = 1;
    is2D = true;
    isIdentity = true;

    constructor(init?: string | number[]) {
      if (Array.isArray(init) && init.length === 6) {
        [this.a, this.b, this.c, this.d, this.e, this.f] = init;
        this.m11 = this.a;
        this.m12 = this.b;
        this.m21 = this.c;
        this.m22 = this.d;
        this.m41 = this.e;
        this.m42 = this.f;
      }
    }

    inverse() {
      return new DOMMatrix();
    }
    multiply() {
      return new DOMMatrix();
    }
    scale() {
      return new DOMMatrix();
    }
    translate() {
      return new DOMMatrix();
    }
    transformPoint() {
      return { x: 0, y: 0, z: 0, w: 1 };
    }

    static fromMatrix() {
      return new DOMMatrix();
    }
    static fromFloat32Array() {
      return new DOMMatrix();
    }
    static fromFloat64Array() {
      return new DOMMatrix();
    }
  }
  (globalThis as any).DOMMatrix = DOMMatrix;
}

import { createServer, IncomingMessage, ServerResponse } from "http";
import { processWorkflow } from "./workflow";

const PORT = parseInt(process.env.PORT ?? "4000", 10);
const WEBHOOK_SECRET =
  process.env.RENDER_WEBHOOK_SECRET ?? "dev-secret-change-me";

function parseBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = createServer(async (req, res) => {
  // Health check
  if (req.method === "GET" && req.url === "/health") {
    return json(res, 200, { status: "ok" });
  }

  // Workflow trigger
  if (req.method === "POST" && req.url === "/api/workflows/trigger") {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      return json(res, 401, { error: "unauthorized" });
    }

    try {
      const body = JSON.parse(await parseBody(req));
      const { importJobId, artifactId, userId } = body;

      if (!importJobId || !artifactId || !userId) {
        return json(res, 400, {
          error: "Missing required fields: importJobId, artifactId, userId",
        });
      }

      // Start workflow processing in the background
      processWorkflow({ importJobId, artifactId, userId }).catch((err) => {
        console.error("[workflow] Unhandled error:", err);
      });

      return json(res, 202, { started: true });
    } catch (err) {
      console.error("[trigger] Parse error:", err);
      return json(res, 400, { error: "Invalid request body" });
    }
  }

  json(res, 404, { error: "not found" });
});

server.listen(PORT, () => {
  console.log(`[ingestion-worker] Listening on port ${PORT}`);
});
