export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const formatDate = (date) => {
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};
export const isServer = typeof window === 'undefined';
export const isClient = !isServer;
