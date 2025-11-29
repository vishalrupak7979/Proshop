import axios from "../utils/axios"; // <-- your axios base setup

export const getAllOrdersApi = async () => {
  const { data } = await axios.get("/orders/admin");
  return data;
};
