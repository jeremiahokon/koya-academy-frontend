import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DOKITA_ADMIN_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config) => config,
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

const apiUtils = {
  getRequest: async (url: string) => {
    const res = await axiosInstance.get(`${url}`);

    return res;
  },

  postRequest: async (
    url: string,
    payload: unknown,
    customHeaders?: Record<string, string>
  ) => {
    const res = await axiosInstance.post(`${url}`, payload, {
      headers: customHeaders,
    });

    return res;
  },

  putRequest: async (url: string, payload: unknown) => {
    const res = await axiosInstance.put(`${url}`, payload);

    return res;
  },

  patchRequest: async (url: string, payload: unknown) => {
    const res = await axiosInstance.patch(`${url}`, payload);

    return res;
  },

  deleteRequest: async (url: string, payload?: unknown) => {
    const res = await axiosInstance.delete(
      `${url}`,
      payload ? { data: payload } : {}
    );

    return res;
  },

  getMultipleRequests: async (urls: string[]) => {
    const requests = urls.map(
      async (url: string) =>
        await axiosInstance.get(`${url}`).catch((error) => error)
    );

    return await axios
      .all(requests)
      .then(axios.spread((...responses) => responses.map(({ data }) => data)));
  },

  postMultipleRequests: async (
    postData: { url: string; payload: unknown }[]
  ) => {
    const requests = postData.map(
      async ({ url, payload }) =>
        await axiosInstance.post(`${url}`, payload).catch((error) => error)
    );

    return await axios
      .all(requests)
      .then(axios.spread((...responses) => responses.map(({ data }) => data)));
  },
};

export default apiUtils;
