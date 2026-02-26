// src/workers/pdf.worker.ts
import { MpesaStatementParser } from "../services/parser/pdfParser";

self.onmessage = async (event: MessageEvent) => {
  const { file, password, id } = event.data;

  try {
    const parser = new MpesaStatementParser();
    const result = await parser.parse(file, password);

    self.postMessage({
      id,
      success: true,
      data: result,
    });
  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
