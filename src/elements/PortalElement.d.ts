interface PortalElementProps {
    children: React.ReactNode;
    container?: HTMLElement;
}
/**
 * 범용 Portal 컴포넌트
 * - React 컴포넌트 트리 외부로 children을 렌더링할 수 있음
 * - 기본적으로 document.body에 렌더링
 */
declare const PortalElement: React.FC<PortalElementProps>;
export default PortalElement;
