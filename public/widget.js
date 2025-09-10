(()=>{
  const s = document.currentScript;
  const widgetSrc = new URL(s.src, location.href);
  const targetUrl = s.getAttribute('data-url');
  if(!targetUrl){ console.warn('[AI-Widget] data-url required'); return; }
  const pos = (s.getAttribute('data-position')||'right').toLowerCase(); // left|right
  const color = s.getAttribute('data-color')||'#3391FF';
  const label = s.getAttribute('data-label')||'AI';
  const openOnLoad = s.getAttribute('data-open')==='1';
  const sizeAttr = (s.getAttribute('data-size')||'420x720').split('x');
  const W = Number(sizeAttr[0]);
  const desktopVhAttr = Number(s.getAttribute('data-height-vh')||'85');
  const desktopVh = Number.isFinite(desktopVhAttr) ? Math.max(60, Math.min(95, desktopVhAttr)) : 85;
  const expandedVhAttr = Number(s.getAttribute('data-height-vh-expanded') || String(Math.min(95, desktopVh + 10)));
  const expandedVh = Number.isFinite(expandedVhAttr) ? Math.max(60, Math.min(95, expandedVhAttr)) : Math.min(95, desktopVh + 10);
  const mobileHeight = '90vh'

  // Styles
  const style = document.createElement('style');
  style.textContent = `
  .aiw-btn{position:fixed;${pos}:10px;bottom:-20px;z-index:2147483645;width:130px;height:130px;border-radius:50%;
    background:transparent;box-shadow:0 0px 0px rgba(0,0,0,.25);cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;border:0;padding:0;transform:scale(1)}
  @media (max-width: 520px) {
    .aiw-btn {
      width: 100px;
      height: 150px;
      bottom: 30px;
      ${pos}: 10px;
    }
  }
  
  .aiw-icon-default, .aiw-icon-open {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 1;
    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
  }
  
  .aiw-icon-open {
    opacity: 0;
    transform: scale(0.8);
  }

  .aiw-btn.open .aiw-icon-default {
    opacity: 0;
    transform: scale(0.8);
  }

  .aiw-btn.open .aiw-icon-open {
    opacity: 1;
    transform: scale(1);
  } 

  /* 바깥 투명 컨테이너 */
  .aiw-root{position:fixed;${pos}:40px;bottom:100px;z-index:2147483646;width:${W}px;max-width:calc(100vw - 24px);display:none;}
  .aiw-root.open{display:block}
  /* 실제 프레임 */
  .aiw-wrap{position:relative;width:100%;height:100%;border:1px solid #9ca3af;border-radius:12px;overflow:hidden;background:#000}
  .aiw-iframe{width:100%;height:100%;border:0;background:#000}
  .aiw-loader{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;background:rgba(0,0,0,.25)}
  /* 라이트/다크 모드 테두리 대비 */
  // @media (prefers-color-scheme: light){ .aiw-wrap{ border-color:#6b7280; } }
  // @media (prefers-color-scheme: dark){ .aiw-wrap{ border-color:#374151; } }
  /* 우측 상단에 걸치는 둥근 핸들 (고정 높이) */
  .aiw-handle{position:absolute;top:-30px;${pos}:-20px;width:46px;height:46px;background:${color};
    border-radius:100px;cursor:pointer;opacity:.95;transition:opacity .2s ease;display:none;display:flex;align-items:center;justify-content:center}
  .aiw-handle:hover{opacity:1}
  .aiw-arrow{width:20px;height:20px;display:block}
  /* 모바일에서는 핸들 숨기고, 높이 90vh 유지 */
  @media (max-width: 520px){
    .aiw-root{ ${pos}:12px; left:12px; right:12px; width:auto; }
    .aiw-handle{ display:none !important; }
    .aiw-root{bottom:170px;z-index:2147483646;display:none;height:calc(100vh - 270px);}

  }`;
  document.head.appendChild(style);

  // Elements 
  const btn = document.createElement('button');
  btn.className='aiw-btn'; 
  btn.setAttribute('aria-label','Open AI Estimate');
  
  // 기본 AI 아이콘 SVG
  const defaultIcon = document.createElement('div');
  defaultIcon.className = 'aiw-icon-default';
  defaultIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 128 128" fill="none">
    <g filter="url(#filter0_d_439_21988)">
      <rect x="44" y="34" width="80" height="80" rx="40" fill="url(#paint0_linear_439_21988)"/>
    </g>
    <g filter="url(#filter1_ii_439_21988)">
      <path d="M83 89.25C91.2838 89.25 98 83.3737 98 76.125C98 68.8763 91.2838 63 83 63C74.7162 63 68 68.8763 68 76.125C68 79.425 69.3931 82.4438 71.6938 84.75C71.5119 86.655 70.9119 88.7438 70.2481 90.3113C70.1 90.66 70.3869 91.05 70.76 90.99C74.99 90.2963 77.5044 89.2313 78.5975 88.6763C80.0333 89.0606 81.5136 89.2535 83 89.25Z" fill="white"/>
    </g>
    <g filter="url(#filter2_i_439_21988)">
      <path d="M97.9996 67.3463L97.9916 67.3476L97.9443 67.371L97.931 67.3736L97.9216 67.371L97.8743 67.347C97.8672 67.3452 97.8619 67.3465 97.8583 67.351L97.8556 67.3576L97.8443 67.643L97.8476 67.6563L97.8543 67.665L97.9236 67.7143L97.9336 67.717L97.9416 67.7143L98.011 67.665L98.019 67.6543L98.0216 67.643L98.0103 67.3583C98.0085 67.3512 98.005 67.3472 97.9996 67.3463ZM98.1756 67.271L98.1663 67.2723L98.0436 67.3343L98.037 67.341L98.035 67.3483L98.047 67.635L98.0503 67.643L98.0556 67.6483L98.1896 67.7096C98.1981 67.7119 98.2045 67.7101 98.209 67.7043L98.2116 67.695L98.189 67.2856C98.1867 67.2772 98.1823 67.2723 98.1756 67.271ZM97.699 67.2723C97.696 67.2705 97.6925 67.27 97.6892 67.2707C97.6858 67.2714 97.6829 67.2735 97.681 67.2763L97.677 67.2856L97.6543 67.695C97.6547 67.703 97.6585 67.7083 97.6656 67.711L97.6756 67.7096L97.8096 67.6476L97.8163 67.6423L97.8183 67.635L97.8303 67.3483L97.8283 67.3403L97.8216 67.3336L97.699 67.2723Z" fill="white"/>
      <path d="M95.6749 55.2987C96.0736 54.132 97.6856 54.0967 98.1583 55.1927L98.1983 55.2993L98.7363 56.8727C98.8595 57.2335 99.0588 57.5637 99.3205 57.8409C99.5823 58.1182 99.9005 58.3361 100.254 58.48L100.398 58.534L101.972 59.0713C103.138 59.47 103.174 61.082 102.078 61.5547L101.972 61.5947L100.398 62.1327C100.037 62.2559 99.707 62.4551 99.4296 62.7168C99.1522 62.9786 98.9342 63.2968 98.7903 63.65L98.7363 63.794L98.1989 65.368C97.8003 66.5347 96.1883 66.57 95.7163 65.4747L95.6749 65.368L95.1376 63.7947C95.0144 63.4337 94.8152 63.1034 94.5534 62.826C94.2917 62.5486 93.9734 62.3306 93.6203 62.1867L93.4763 62.1327L91.9029 61.5953C90.7356 61.1967 90.7003 59.5847 91.7963 59.1127L91.9029 59.0713L93.4763 58.534C93.8371 58.4107 94.1673 58.2115 94.4445 57.9497C94.7218 57.688 94.9397 57.3698 95.0836 57.0167L95.1376 56.8727L95.6749 55.2987ZM102.27 53C102.395 53 102.517 53.035 102.623 53.101C102.729 53.167 102.814 53.2613 102.869 53.3733L102.901 53.4513L103.134 54.1353L103.819 54.3687C103.944 54.4111 104.053 54.4897 104.134 54.5945C104.214 54.6993 104.261 54.8256 104.27 54.9573C104.278 55.0891 104.247 55.2204 104.181 55.3345C104.115 55.4487 104.016 55.5406 103.898 55.5987L103.819 55.6307L103.135 55.864L102.902 56.5487C102.859 56.6736 102.78 56.7831 102.676 56.8633C102.571 56.9435 102.444 56.9908 102.313 56.9991C102.181 57.0075 102.05 56.9766 101.936 56.9103C101.821 56.8439 101.73 56.7452 101.672 56.6267L101.64 56.5487L101.406 55.8647L100.722 55.6313C100.597 55.5889 100.487 55.5103 100.407 55.4055C100.327 55.3007 100.279 55.1744 100.271 55.0427C100.262 54.9109 100.293 54.7796 100.359 54.6655C100.426 54.5513 100.524 54.4594 100.643 54.4013L100.722 54.3693L101.406 54.136L101.639 53.4513C101.684 53.3196 101.769 53.2053 101.882 53.1243C101.995 53.0434 102.131 52.9999 102.27 53Z" fill="white"/>
    </g>
    <defs>
      <filter id="filter0_d_439_21988" x="0" y="0" width="168" height="168" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="10"/>
        <feGaussianBlur stdDeviation="22"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.328627 0 0 0 0 0.12549 0 0 0 0 0.996078 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_439_21988"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_439_21988" result="shape"/>
      </filter>
      <filter id="filter1_ii_439_21988" x="66" y="61" width="34" height="31.9962" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dx="2" dy="2"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.0652162 0 0 0 0 0.0016986 0 0 0 0 0.529898 0 0 0 0.36 0"/>
        <feBlend mode="normal" in2="shape" result="effect1_innerShadow_439_21988"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dx="-2" dy="-2"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.0666667 0 0 0 0 0 0 0 0 0 0.529412 0 0 0 0.36 0"/>
        <feBlend mode="normal" in2="effect1_innerShadow_439_21988" result="effect2_innerShadow_439_21988"/>
      </filter>
      <filter id="filter2_i_439_21988" x="91" y="53" width="14.271" height="15.717" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dx="1" dy="1"/>
        <feGaussianBlur stdDeviation="1"/>
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.0749262 0 0 0 0 0.000993655 0 0 0 0 0.620192 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="shape" result="effect1_innerShadow_439_21988"/>
      </filter>
      <linearGradient id="paint0_linear_439_21988" x1="84" y1="34" x2="84" y2="114" gradientUnits="userSpaceOnUse">
        <stop stop-color="#9579EC"/>
        <stop offset="1" stop-color="#1F1AAE"/>
      </linearGradient>
    </defs>
    </svg>
  `;
  btn.appendChild(defaultIcon);

// 검은색 아이콘 SVG (X자 포함)
const openIcon = document.createElement('div');
openIcon.className = 'aiw-icon-open';
openIcon.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 128 128" fill="none">
    <g filter="url(#filter0_dd_491_680)">
      <rect x="44" y="34" width="80" height="80" rx="40" fill="#08080F"/>
      <rect x="44" y="34" width="80" height="80" rx="40" stroke="white" stroke-width="2"/>
    </g>
    
    <g transform="scale(1) translate(63, 53)"> 
      <path fill-rule="evenodd" clip-rule="evenodd" d="M22.0376 40.7015L22.0183 40.705L21.8941 40.7663L21.8591 40.7733L21.8346 40.7663L21.7103 40.705C21.6916 40.6992 21.6776 40.7021 21.6683 40.7138L21.6613 40.7313L21.6316 41.4803L21.6403 41.5153L21.6578 41.538L21.8398 41.6675L21.8661 41.6745L21.8871 41.6675L22.0691 41.538L22.0901 41.51L22.0971 41.4803L22.0673 40.733C22.0626 40.7143 22.0527 40.7038 22.0376 40.7015ZM22.5013 40.5038L22.4786 40.5073L22.1548 40.67L22.1373 40.6875L22.1321 40.7068L22.1636 41.4593L22.1723 41.4803L22.1863 41.4925L22.5381 41.6553C22.5602 41.6611 22.5771 41.6564 22.5888 41.6413L22.5958 41.6168L22.5363 40.5423C22.5305 40.5213 22.5188 40.5084 22.5013 40.5038ZM21.2501 40.5073C21.2423 40.5026 21.2331 40.5011 21.2243 40.503C21.2155 40.505 21.2078 40.5103 21.2028 40.5178L21.1923 40.5423L21.1328 41.6168C21.134 41.6378 21.1439 41.6518 21.1626 41.6588L21.1888 41.6553L21.5406 41.4925L21.5581 41.4785L21.5651 41.4593L21.5948 40.7068L21.5896 40.6858L21.5721 40.6683L21.2501 40.5073Z" fill="#B7B7B7"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M20.9998 24.7136L30.28 33.9938C30.7725 34.4863 31.4404 34.7629 32.1368 34.7629C32.8332 34.7629 33.5011 34.4863 33.9935 33.9938C34.486 33.5014 34.7626 32.8335 34.7626 32.1371C34.7626 31.4407 34.486 30.7728 33.9935 30.2803L24.7098 21.0001L33.9918 11.7198C34.2355 11.476 34.4288 11.1865 34.5607 10.868C34.6925 10.5495 34.7603 10.2081 34.7603 9.86333C34.7602 9.51858 34.6922 9.17722 34.5602 8.85874C34.4282 8.54027 34.2348 8.25091 33.9909 8.0072C33.7471 7.76348 33.4576 7.57017 33.1391 7.43832C32.8206 7.30647 32.4792 7.23864 32.1344 7.23872C31.7897 7.2388 31.4483 7.30679 31.1298 7.43879C30.8114 7.5708 30.522 7.76424 30.2783 8.00807L20.9998 17.2883L11.7195 8.00807C11.4775 7.75725 11.188 7.55713 10.8678 7.41941C10.5476 7.28169 10.2031 7.20911 9.8546 7.20592C9.50606 7.20273 9.16037 7.26898 8.83771 7.40082C8.51505 7.53265 8.22187 7.72743 7.97529 7.97378C7.7287 8.22013 7.53365 8.51313 7.40151 8.83566C7.26937 9.1582 7.20279 9.50383 7.20565 9.85237C7.20852 10.2009 7.28077 10.5454 7.41819 10.8657C7.55561 11.1861 7.75545 11.4758 8.00605 11.7181L17.2898 21.0001L8.0078 30.2821C7.7572 30.5243 7.55736 30.8141 7.41994 31.1344C7.28252 31.4547 7.21027 31.7992 7.2074 32.1478C7.20454 32.4963 7.27112 32.8419 7.40326 33.1645C7.5354 33.487 7.73045 33.78 7.97704 34.0264C8.22362 34.2727 8.5168 34.4675 8.83946 34.5993C9.16212 34.7312 9.50781 34.7974 9.85635 34.7942C10.2049 34.791 10.5493 34.7185 10.8695 34.5807C11.1897 34.443 11.4793 34.2429 11.7213 33.9921L20.9998 24.7136Z" fill="white"/>
    </g>

    <defs>
      <filter id="filter0_dd_491_680" x="0" y="0" width="128" height="128" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dx="4" dy="4"/>
        <feGaussianBlur stdDeviation="10"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.282353 0 0 0 0 0.282353 0 0 0 0 0.282353 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_491_680"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dx="-4" dy="-4"/>
        <feGaussianBlur stdDeviation="10"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.283654 0 0 0 0 0.283654 0 0 0 0 0.283654 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="effect1_dropShadow_491_680" result="effect2_dropShadow_491_680"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_491_680" result="shape"/>
      </filter>
    </defs>
  </svg>
`;
btn.appendChild(openIcon);


  const root = document.createElement('div'); root.className='aiw-root';
  const wrap = document.createElement('div'); wrap.className='aiw-wrap';
  const loader = document.createElement('div'); loader.className='aiw-loader'; loader.textContent='Loading...';
  const iframe = document.createElement('iframe'); iframe.className='aiw-iframe';
  const handle = document.createElement('div'); handle.className='aiw-handle'; handle.setAttribute('title','크기 전환');
  
  // 높이 조절 아이콘을 다크 모드에 따라 동적으로 생성
  const toggleIcon = document.createElementNS('http://www.w3.org/2000/svg','svg');
  toggleIcon.setAttribute('width','30');
  toggleIcon.setAttribute('height','30');
  toggleIcon.setAttribute('viewBox','0 0 30 30');
  toggleIcon.setAttribute('fill','none');

// body에 적용된 최종 스타일 정보 가져오기
const body = document.body;

const style2 = window.getComputedStyle(body);

// 배경색 값(RGB) 가져오기
const backgroundColor = style2.getPropertyValue('background-color');

// RGB 값을 분석하여 어두운 계열인지 밝은 계열인지 판단
// (예: RGB 값이 0, 0, 0에 가까우면 어둡다고 판단)
// 이 부분은 명확한 기준이 없으므로 구현에 따라 달라질 수 있습니다.
function isColorDark(rgb) {
  // RGB 문자열에서 숫자만 추출하여 배열로 변환
  const color = rgb.match(/\d+/g).map(Number);
  // 간편한 명도 계산 (Y = 0.299*R + 0.587*G + 0.114*B)
  const luminance = (0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]) / 255;
  // 명도가 0.5 미만이면 어두운 색으로 판단 (이 값은 조절 가능)
  return luminance < 0.5;
}

const isDarkMode = isColorDark(backgroundColor);

  if (isDarkMode) {
    // 다크 모드: 검은 동그라미에 흰색 화살표가 보이도록
    handle.style.background = '#08080F'; // 검은색 동그라미
    handle.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.25), 0 4px 12px #B7B7B7'; // 회색 그림자
    toggleIcon.innerHTML = `<path d="M15 22.625L17.9062 19.7188C18.1562 19.4688 18.4583 19.3438 18.8125 19.3438C19.1667 19.3438 19.4687 19.4688 19.7187 19.7188C19.9687 19.9688 20.0938 20.2709 20.0938 20.625C20.0938 20.9792 19.9687 21.2813 19.7187 21.5313L15.875 25.375C15.75 25.5 15.6146 25.5888 15.4688 25.6413C15.3229 25.6938 15.1667 25.7196 15 25.7188C14.8333 25.718 14.6771 25.6921 14.5312 25.6413C14.3854 25.5905 14.25 25.5017 14.125 25.375L10.2813 21.5313C10.0313 21.2813 9.90625 20.9792 9.90625 20.625C9.90625 20.2709 10.0313 19.9688 10.2813 19.7188C10.5313 19.4688 10.8333 19.3438 11.1875 19.3438C11.5417 19.3438 11.8438 19.4688 12.0938 19.7188L15 22.625ZM15 7.50005L12.0938 10.4063C11.8438 10.6563 11.5417 10.7813 11.1875 10.7813C10.8333 10.7813 10.5313 10.6563 10.2813 10.4063C10.0313 10.1563 9.90625 9.85421 9.90625 9.50005C9.90625 9.14588 10.0313 8.8438 10.2813 8.5938L14.125 4.75005C14.25 4.62505 14.3854 4.5363 14.5312 4.4838C14.6771 4.4313 14.8333 4.40588 15 4.40755C15.1667 4.40921 15.3229 4.43546 15.4688 4.4863C15.6146 4.53713 15.75 4.62546 15.875 4.7513L19.7187 8.59505C19.9687 8.84505 20.0938 9.14713 20.0938 9.5013C20.0938 9.85546 19.9687 10.1575 19.7187 10.4075C19.4687 10.6575 19.1667 10.7825 18.8125 10.7825C18.4583 10.7825 18.1562 10.6575 17.9062 10.4075L15 7.50005Z" fill="white"/>`;
  } else {
    // 라이트 모드: 흰색 동그라미에 검은색 그림자, 회색 화살표
    handle.style.background = '#FFFFFF'; // 흰색 동그라미
    handle.style.boxShadow = '0 4px 12px rgba(0,0,0,.25)'; // 검은색 그림자 (기존과 동일)
    toggleIcon.innerHTML = `<path d="M15 22.625L17.9062 19.7188C18.1562 19.4688 18.4583 19.3438 18.8125 19.3438C19.1667 19.3438 19.4687 19.4688 19.7187 19.7188C19.9687 19.9688 20.0938 20.2709 20.0938 20.625C20.0938 20.9792 19.9687 21.2813 19.7187 21.5313L15.875 25.375C15.75 25.5 15.6146 25.5888 15.4688 25.6413C15.3229 25.6938 15.1667 25.7196 15 25.7188C14.8333 25.718 14.6771 25.6921 14.5312 25.6413C14.3854 25.5905 14.25 25.5017 14.125 25.375L10.2813 21.5313C10.0313 21.2813 9.90625 20.9792 9.90625 20.625C9.90625 20.2709 10.0313 19.9688 10.2813 19.7188C10.5313 19.4688 10.8333 19.3438 11.1875 19.3438C11.5417 19.3438 11.8438 19.4688 12.0938 19.7188L15 22.625ZM15 7.50005L12.0938 10.4063C11.8438 10.6563 11.5417 10.7813 11.1875 10.7813C10.8333 10.7813 10.5313 10.6563 10.2813 10.4063C10.0313 10.1563 9.90625 9.85421 9.90625 9.50005C9.90625 9.14588 10.0313 8.8438 10.2813 8.5938L14.125 4.75005C14.25 4.62505 14.3854 4.5363 14.5312 4.4838C14.6771 4.4313 14.8333 4.40588 15 4.40755C15.1667 4.40921 15.3229 4.43546 15.4688 4.4863C15.6146 4.53713 15.75 4.62546 15.875 4.7513L19.7187 8.59505C19.9687 8.84505 20.0938 9.14713 20.0938 9.5013C20.0938 9.85546 19.9687 10.1575 19.7187 10.4075C19.4687 10.6575 19.1667 10.7825 18.8125 10.7825C18.4583 10.7825 18.1562 10.6575 17.9062 10.4075L15 7.50005Z" fill="#B7B7B7"/>`;
  }
  
  handle.appendChild(toggleIcon);

  // Compose URL with embed=1 and source
  const u = new URL(targetUrl, widgetSrc);
  if(!u.searchParams.get('embed')) u.searchParams.set('embed','1');
  u.searchParams.set('src','widget');
  iframe.src = u.toString();

  // 부모 뷰포트 크기를 iframe으로 전달
  const postViewport = () => {
    try {
      iframe.contentWindow?.postMessage({
        type: 'aiw:parentViewport',
        width: window.innerWidth,
        height: window.innerHeight,
        dpr: window.devicePixelRatio || 1,
      }, '*');
    } catch (_) {}
  };

  iframe.addEventListener('load', ()=>{ loader.style.display='none'; postViewport(); });

  wrap.appendChild(loader);
  wrap.appendChild(iframe);
  root.appendChild(wrap);
  root.appendChild(handle);

  // 상태: 확장 여부
  let isExpanded = false;

  // 높이 적용 함수
  const applyHeights = () => {
    if (window.innerWidth > 520) {
      const h = isExpanded ? expandedVh : desktopVh;
      root.style.height = h + 'vh';
      root.style.maxHeight = '90vh';
    } else {
      root.style.height = '80vh';
      root.style.maxHeight = '90vh';
    }
  };

  // 이벤트: 핸들 클릭 시 위젯 높이 토글 (핸들 높이는 고정)
  handle.addEventListener('click', (e)=>{
    e.stopPropagation();
    if (window.innerWidth <= 520) return; // 모바일은 무시
    isExpanded = !isExpanded;
    applyHeights();
    postViewport();
  });

  btn.onclick = ()=> {
    // 모바일 디바이스(아이폰 포함) 감지
    var isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      window.open(targetUrl, '_blank');
      return;
    }
    root.classList.toggle('open');
    btn.classList.toggle('open'); // 버튼에도 'open' 클래스 토글
    postViewport();
  };
  window.addEventListener('message',(e)=>{ 
    if(e?.data?.type==='aiw:close') {
      root.classList.remove('open'); 
      btn.classList.remove('open'); // 버튼에서 'open' 클래스 제거
    }
  });
  window.addEventListener('resize', ()=>{ applyHeights(); postViewport(); });
  
  // resize 이벤트 시 핸들러 아이콘도 변경
  window.addEventListener('resize', () => {
    applyHeights(); 
    postViewport(); 
    if (window.innerWidth <= 520) {
      handle.style.display = 'none';
    } else {
      handle.style.display = 'flex';
    }
  });


  const mount = () => {
    if (!document.body) return;
    if (!btn.isConnected) document.body.appendChild(btn);
    if (!root.isConnected) document.body.appendChild(root);
    if (window.innerWidth > 520) handle.style.display = 'flex';
    applyHeights();
    if (openOnLoad) {
      root.classList.add('open');
      btn.classList.add('open'); // 페이지 로드 시 위젯이 열리면 버튼도 'open' 상태로
    }
    postViewport();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();