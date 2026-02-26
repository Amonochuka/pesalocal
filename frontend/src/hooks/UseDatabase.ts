// src/hooks/useDatabase.ts
import { useEffect, useState } from "react";
import { db } from "../services/storage/db";

export const useDatabase = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      try {
        await db.open();
        setIsReady(true);
        console.log("✅ Database ready");
      } catch (error) {
        console.error("❌ Database error:", error);
      }
    };
    initDB();
  }, []);

  return { isReady, db };
};
