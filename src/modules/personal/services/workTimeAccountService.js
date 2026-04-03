import { api } from '@/utils/api';

export const workTimeAccountService = {
    getAll: async () => {
        const data = localStorage.getItem("workTimeData");
        return data ? JSON.parse(data) : [];
    },

    save: async (data) => {
        localStorage.setItem("workTimeData", JSON.stringify(data));
        return data;
    }
};