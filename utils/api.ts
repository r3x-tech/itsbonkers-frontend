import { sampleSleighs } from "@/stores/sampleData";
import userStore from "@/stores/userStore";
import { Sleigh } from "@/types/types";

export const fetchSleighs = async () => {
  const { loggedIn } = userStore.getState();

  if (!loggedIn) {
    console.error("User not logged in.");
  }

  if (sampleSleighs) {
    return sampleSleighs; // This mimics an asynchronous fetch from '@/stores/sampleData'
  } else {
    return [];
  }
};
