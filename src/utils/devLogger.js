export const devLog = (...args) => {
    if (import.meta.env.NODE_ENV !== 'production') {
        console.log(...args);
    }
};
export const devWarn = (...args) => {
    if (import.meta.env.NODE_ENV !== 'production') {
        console.warn(...args);
    }
};
