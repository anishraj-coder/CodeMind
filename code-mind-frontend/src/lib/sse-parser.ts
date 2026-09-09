export interface SSEEvent {
  event: string;
  data: string;
}

export async function parseSSEStream(
  response: Response,
  onEvent: (event: SSEEvent) => void
) {
  if (!response.body) throw new Error("Response body is null");

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  let currentEvent = "message";
  let currentData: string[] = [];
  let hasEvent = false;

  const dispatchEvent = () => {
    if (hasEvent) {
      onEvent({
        event: currentEvent || "message",
        data: currentData.join("\n"),
      });
    }
    currentEvent = "message";
    currentData = [];
    hasEvent = false;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let lineEndIdx: number;
    while ((lineEndIdx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, lineEndIdx);
      buffer = buffer.slice(lineEndIdx + 1);

      // Strip trailing \r if Windows CRLF
      if (line.endsWith("\r")) {
        line = line.slice(0, -1);
      }

      // An empty line signals the end of an SSE event
      if (line === "") {
        dispatchEvent();
        continue;
      }

      // Ignore SSE comments
      if (line.startsWith(":")) {
        continue;
      }

      // Parse field name and value
      const colonIdx = line.indexOf(":");
      let field: string;
      let val: string;

      if (colonIdx === -1) {
        field = line;
        val = "";
      } else {
        field = line.slice(0, colonIdx);
        val = line.slice(colonIdx + 1);
        // Per W3C SSE spec: strip at most one leading space immediately following the colon
        if (val.startsWith(" ")) {
          val = val.slice(1);
        }
      }

      if (field === "event") {
        currentEvent = val;
        hasEvent = true;
      } else if (field === "data") {
        currentData.push(val);
        hasEvent = true;
      }
    }
  }

  // Flush remaining buffer if stream ended without a trailing empty line
  if (buffer) {
    if (buffer.startsWith("data:")) {
      let val = buffer.slice(5);
      if (val.startsWith(" ")) val = val.slice(1);
      currentData.push(val);
      hasEvent = true;
    }
    dispatchEvent();
  }
}
