import api from './api';

export const userService = {

    getByRole: (role) =>
        api.get(`/users/role/${role}`)
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),
};