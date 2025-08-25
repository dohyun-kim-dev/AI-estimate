import type { DeviceType } from '@/types/device';
interface SelectElementProps {
    $device: DeviceType;
    radius?: string;
    fontSize?: string;
    height?: string;
    width?: string;
    value?: string;
    options?: {
        label: string;
        value: string;
    }[];
    padding?: string;
    isShowIcon?: boolean;
    hasBorder?: boolean;
}
declare const SelectElement: import("styled-components/dist/types").IStyledComponentBase<"web", import("styled-components/dist/types").Substitute<import("react").DetailedHTMLProps<import("react").SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>, SelectElementProps>> & string;
export default SelectElement;
