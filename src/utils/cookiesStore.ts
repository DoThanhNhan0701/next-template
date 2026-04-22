import Cookies from 'js-cookie';

export const getClientCookie = Cookies.get;

export const setClientCookie = Cookies.set;

export const removeClientCookie = Cookies.remove;

export const cleanClientCookie = () => {
    const cookies = Cookies.get();

    for (const key in cookies) {
        // Try removing without path and with root path for maximum reliability
        Cookies.remove(key);
        Cookies.remove(key, { path: '/' });
    }
};
