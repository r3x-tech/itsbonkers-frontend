import axios, { Method } from "axios";
axios.defaults.baseURL = "https://api.pockets.gg";

export const apiRequest = async <T>(
  method: Method,
  path: string,
  paramsOrData?: any
): Promise<T> => {
  const errorMessage = `Server Error on ${method} ${path}`;
  try {
    let response;
    if (method === "get") {
      response = await axios.get(path, { params: paramsOrData });
    } else {
      response = await axios.post(path, paramsOrData);
    }

    if (response) {
      return response as T;
    } else {
      console.error(errorMessage, "response: ", response);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    throw error;
  }
};

export function timeout(delay: number) {
  return new Promise((res) => setTimeout(res, delay));
}

export function isLad(collectionAddress: string) {
  return collectionAddress === "J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w";
}

export function timeAgo(timestamp: number): string {
  const timeDifference = Math.floor(timestamp);
  const hours = Math.floor(timeDifference / 3600);
  const minutes = Math.floor((timeDifference % 3600) / 60);
  const seconds = timeDifference % 60;

  return `${hours ? hours + "h" : ""} ${minutes ? minutes + "m" : ""} ${
    seconds ? seconds + "s" : ""
  }`;
}

export const formatBalance = (balance: number) => {
  let format = "";
  if (balance > 1000000000) {
    format = (balance / 1000000000).toFixed(2) + "B";
  } else if (balance > 1000000) {
    format = (balance / 1000000).toFixed(2) + "M";
  } else if (balance > 1000) {
    format = (balance / 1000).toFixed(2) + "K";
  } else {
    format = balance.toFixed(2);
  }

  return format;
};

export const timeSince = (dateString: string): string => {
  // Convert the date string into a Date object
  const date = new Date(dateString);

  // Get the current time in the user's timezone
  const now = new Date();

  // Calculate the time difference in milliseconds
  const timeDifference = now.getTime() - date.getTime();

  // Calculate the time units
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  // Generate the readable time string
  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? "" : "s"} ago`;
  } else if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  } else if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  } else if (weeks < 4) {
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  } else if (months < 12) {
    return `${months} month${months === 1 ? "" : "s"} ago`;
  } else {
    return `${years} year${years === 1 ? "" : "s"} ago`;
  }
};

export * from "./solana";
export * from "./api";
