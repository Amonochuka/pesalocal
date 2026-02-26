import { useState } from "react";
import { storage } from "../services/storage/db";

interface ImportState {
  isImporting: boolean;
  progress: number;
  error: string | null;
  result: any | null;
}

export const usePDFImport = () => {
  const [state, setState] = useState<ImportState>({
    isImporting: false,
    progress: 0,
    error: null,
    result: null,
  });

  const importStatement = async (file: File, password: string) => {
    setState({ isImporting: true, progress: 0, error: null, result: null });

    try {
      // Create worker
      const worker = new Worker(
        new URL("../workers/pdf.worker.ts", import.meta.url),
      );

      return new Promise((resolve, reject) => {
        const id = crypto.randomUUID();

        worker.onmessage = async (event) => {
          const { success, data, error } = event.data;

          if (success) {
            // Save transactions to database
            for (const tx of data.transactions) {
              await storage.addTransaction(tx);
            }

            setState({
              isImporting: false,
              progress: 100,
              error: null,
              result: data,
            });

            worker.terminate();
            resolve(data);
          } else {
            setState({
              isImporting: false,
              progress: 0,
              error,
              result: null,
            });

            worker.terminate();
            reject(new Error(error));
          }
        };

        worker.onerror = (error) => {
          setState({
            isImporting: false,
            progress: 0,
            error: error.message,
            result: null,
          });

          worker.terminate();
          reject(error);
        };

        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (progress <= 90) {
            setState((prev) => ({ ...prev, progress }));
          }
        }, 200);

        // Start parsing
        worker.postMessage({ file, password, id });

        // Clear interval when done
        setTimeout(() => clearInterval(interval), 10000);
      });
    } catch (error) {
      setState({
        isImporting: false,
        progress: 0,
        error: error instanceof Error ? error.message : "Unknown error",
        result: null,
      });
      throw error;
    }
  };

  const reset = () => {
    setState({
      isImporting: false,
      progress: 0,
      error: null,
      result: null,
    });
  };

  return {
    ...state,
    importStatement,
    reset,
  };
};
