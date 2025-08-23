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

  // Styles
  const style = document.createElement('style');
  style.textContent = `
  .aiw-btn{position:fixed;${pos}:25px;bottom:20px;z-index:2147483645;width:56px;height:56px;border-radius:50%;
    background:${color};box-shadow:0 8px 24px rgba(0,0,0,.25);cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;border:0}
  /* 바깥 투명 컨테이너 */
  .aiw-root{position:fixed;${pos}:25px;bottom:90px;z-index:2147483646;width:${W}px;max-width:calc(100vw - 24px);display:none;}
  .aiw-root.open{display:block}
  /* 실제 프레임 */
  .aiw-wrap{position:relative;width:100%;height:100%;border:1px solid #9ca3af;border-radius:12px;overflow:hidden;background:#000}
  .aiw-iframe{width:100%;height:100%;border:0;background:#000}
  .aiw-loader{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;background:rgba(0,0,0,.25)}
  /* 라이트/다크 모드 테두리 대비 */
  @media (prefers-color-scheme: light){ .aiw-wrap{ border-color:#6b7280; } }
  @media (prefers-color-scheme: dark){ .aiw-wrap{ border-color:#374151; } }
  /* 우측 상단에 걸치는 둥근 핸들 (고정 높이) */
  .aiw-handle{position:absolute;top:-30px;${pos}:33px;width:46px;height:46px;background:${color};
    border-radius:100px;box-shadow:0 4px 12px rgba(0,0,0,.25);cursor:pointer;opacity:.95;transition:opacity .2s ease;display:none;display:flex;align-items:center;justify-content:center}
  .aiw-handle:hover{opacity:1}
  .aiw-arrow{width:20px;height:20px;display:block}
  /* 모바일에서는 핸들 숨기고, 높이 90vh 유지 */
  @media (max-width: 520px){
    .aiw-root{ ${pos}:12px; left:12px; right:12px; width:auto; }
    .aiw-handle{ display:none !important; }
  }`;
  document.head.appendChild(style);

  // Elements 
  const btn = document.createElement('button');
  btn.className='aiw-btn'; btn.setAttribute('aria-label','Open AI Estimate');
  btn.innerHTML = label.length<=3?label:label.slice(0,3);

  const root = document.createElement('div'); root.className='aiw-root';
  const wrap = document.createElement('div'); wrap.className='aiw-wrap';
  const loader = document.createElement('div'); loader.className='aiw-loader'; loader.textContent='Loading...';
  const iframe = document.createElement('iframe'); iframe.className='aiw-iframe';
  const handle = document.createElement('div'); handle.className='aiw-handle'; handle.setAttribute('title','크기 전환');
  const arrow = document.createElementNS('http://www.w3.org/2000/svg','svg');
  arrow.setAttribute('viewBox','0 0 24 24');
  arrow.setAttribute('class','aiw-arrow');
  arrow.innerHTML = `
    <path d="M12 3l4 4h-3v10h-2V7H8l4-4z" fill="#fff"/>
    <path d="M12 21l-4-4h3V7h2v10h3l-4 4z" fill="#fff"/>
  `;
  handle.appendChild(arrow);

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
      root.style.height = '90vh';
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

  btn.onclick = ()=> { root.classList.toggle('open'); postViewport(); };
  window.addEventListener('message',(e)=>{ if(e?.data?.type==='aiw:close') root.classList.remove('open'); });
  window.addEventListener('resize', ()=>{ applyHeights(); postViewport(); });

  const mount = () => {
    if (!document.body) return;
    if (!btn.isConnected) document.body.appendChild(btn);
    if (!root.isConnected) document.body.appendChild(root);
    if (window.innerWidth > 520) handle.style.display = 'flex';
    applyHeights();
    if (openOnLoad) root.classList.add('open');
    postViewport();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();
