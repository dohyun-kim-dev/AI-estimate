interface BannerProps {
    images: {
        id: string;
        imageUrl: string;
        mobileImageUrl: string;
        altText: string;
    }[];
}
export default function Banner({ images }: BannerProps): import("react/jsx-runtime").JSX.Element;
export {};
