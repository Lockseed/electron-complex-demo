import axios from 'axios';
import type { AxiosResponse } from 'axios';

export interface EventRecord {
  id: number | string;
  title: string;
  time: string;
  date: string;
  location: string;
  description: string;
}

const apiClient = axios.create({
  baseURL: 'https://my-json-server.typicode.com/Lockseed/vuemastery-real-world-vue-3',
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default {
  getEvents(perPage: number, page: number): Promise<AxiosResponse<EventRecord[]>> {
    return apiClient.get('/events', {
      params: {
        _limit: perPage,
        _page: page,
      },
    });
  },
  getEvent(id: string | number): Promise<AxiosResponse<EventRecord>> {
    return apiClient.get('/events/' + id);
  },
};
