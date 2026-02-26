// src/hooks/useCurrentUser.ts
import { useAuthStore } from "../store/authStore";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../services/storage/db";

export const useCurrentUser = () => {
  const { currentUser } = useAuthStore();

  // Fetch fresh user data from DB
  const user = useLiveQuery(async () => {
    if (!currentUser?.id) return null;
    return await db.users.get(currentUser.id);
  }, [currentUser?.id]);

  return user || currentUser;
};

export const useUserId = () => {
  const user = useCurrentUser();
  return user?.id;
};

export const useUserPreferences = () => {
  const user = useCurrentUser();
  return user?.preferences;
};
