import dynamic from 'next/dynamic';
export function withNoSSR(Component) {
    return dynamic(() => Promise.resolve(Component), { ssr: false });
}
