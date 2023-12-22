import { useQuery } from "@tanstack/react-query";
import userStore from "@/stores/userStore";
// import { fetchSleighs } from "@/utils/api";
import { Sleigh } from "@/types/types";
import React from "react";

// const useSleighs = () => {
//   const setSleighs = userStore((state) => state.setSleighs);
//   const { loggedIn } = userStore();

//   const { data, error, isLoading, refetch } = useQuery<Sleigh[], Error>({
//     queryKey: ["sleighs"],
//     queryFn: fetchSleighs,
//     enabled: loggedIn,
//   });

//   React.useEffect(() => {
//     if (data) {
//       setSleighs(data);
//     }
//   }, [data, setSleighs]);

//   return {
//     sleighs: data,
//     error,
//     isLoading,
//     refetch,
//   };
// };

// export default useSleighs;
