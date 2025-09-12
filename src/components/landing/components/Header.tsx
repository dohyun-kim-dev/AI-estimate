import Button from "./common/Button";
import { navigationBarItems } from "../utils/constants";
import { useActiveSection } from "../hooks/useActiveSection";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const activeSection = useActiveSection();

  return (
    <header className="sticky top-0 z-50 mx-auto flex h-[46px] w-full flex-row items-center justify-center bg-white px-[16px] sm:h-[66px] sm:px-[60px]">
      <div className="flex w-full max-w-[1200px] flex-row justify-between">
        <div className="flex flex-row items-center gap-[40px] lg:gap-[80px]">
          <img
            src="/images/header_logo.png"
            className="h-[20px] w-[68px] hover:cursor-pointer"
            onClick={() => navigate("/home")}
          />
          <nav className="hidden flex-row gap-[32px] sm:flex sm:gap-[16px] lg:gap-[32px]">
            {navigationBarItems.map((item) => {
              const isActive = activeSection === item.path.slice(1);
              return (
                <p
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`text-mobile-15m-btn lg:text-mobile-15m-btn transition-colors duration-200 hover:cursor-pointer sm:text-[12px] ${
                    isActive
                      ? "text-mobile-15m-btn font-bold"
                      : "text-on-bg-a-3"
                  }`}
                >
                  {item.label}
                </p>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-row gap-[12px]">
          <Button
            onClick={() => {
              window.open("https://heredotcorp.com/", "_blank");
            }}
            customStyle="text-on-btn-a-emphasis text-mobile-15m-btn lg:text-mobile-15m-btn sm:text-[12px] border px-[10px] py-[6px] rounded-[8px] "
          >
            서비스 체험
          </Button>
          <Button
            onClick={() => navigate("/contact")}
            customStyle="text-on-btn-a text-mobile-15m-btn lg:text-mobile-15m-btn sm:text-[12px] bg-[linear-gradient(to_right,#7393FF_0%,#1A1FFF_50%,#1A1FFF_100%)] px-[10px] py-[6px] rounded-[8px]"
          >
            가입문의
          </Button>
        </div>
      </div>
    </header>
  );
}
