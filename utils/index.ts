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
export * from "./solana";
export * from "./api";
