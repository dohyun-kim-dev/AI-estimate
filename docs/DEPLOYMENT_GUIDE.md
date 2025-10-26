# 배포 가이드

## 📋 목차
1. [환경 구성](#환경-구성)
2. [빌드 프로세스](#빌드-프로세스)
3. [FileZilla FTP 배포 (운영 서버)](#filezilla-ftp-배포-운영-서버)
4. [Firebase Hosting 배포](#firebase-hosting-배포)
5. [환경 변수 관리](#환경-변수-관리)
6. [도메인 설정](#도메인-설정)
7. [CI/CD 파이프라인](#cicd-파이프라인)
8. [모니터링 및 로그](#모니터링-및-로그)
9. [트러블슈팅](#트러블슈팅)


# 배포방법 - 파일질라로 직접 넣는법
@@
운영 랜딩  파일질라 경로 root/aigo/nginx/public
랜딩 빌드하고 dist폴더안에 폴더들제외한 파일들 넣기
asset 폴더안에 파일들 파일질라 asset 안에 넣기

@@
운영 AI 파일질라 경로 root/aigo/nginx/public
aigo 빌드 하고 
dist폴더내에 index_1.html 로 제목 수정한 뒤 폴더 제외한 파일들 넣기
asset 폴더안에 파일들 파일질라 asset 안에 넣기





---

## 환경 구성

### 필수 도구 설치

```bash
# Node.js (v18 이상)
node --version

# npm (v9 이상)
npm --version

# Firebase CLI
npm install -g firebase-tools

# Firebase 로그인
firebase login
```

### 프로젝트 클론 및 의존성 설치

```bash
# 저장소 클론
git clone https://github.com/your-org/AI-estimate.git
cd AI-estimate

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
```

---

## 빌드 프로세스

### 개발 환경 빌드

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 확인
# http://localhost:5173
```

### 프로덕션 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과: dist/ 폴더에 생성
# - index.html
# - assets/
#   - index-[hash].js
#   - index-[hash].css
```

### 빌드 검증

```bash
# 로컬에서 프로덕션 빌드 미리보기
npm run preview

# 브라우저에서 확인
# http://localhost:4173
```

### 빌드 최적화 확인

```bash
# 번들 크기 분석
npm run build -- --mode production

# vite-bundle-visualizer 사용
npm install -D rollup-plugin-visualizer
```

**vite.config.ts에 추가**:
```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

---

## FileZilla FTP 배포 (운영 서버)

### 🚀 개요

FileZilla를 사용하여 운영 서버에 직접 파일을 업로드하는 방법입니다. 랜딩 페이지와 AI 페이지를 각각 배포할 수 있습니다.

---

### 📦 1. 랜딩 페이지 배포

#### 1-1. 랜딩 페이지 빌드

```bash

# 의존성 설치 (최초 1회)
npm install

# 프로덕션 빌드
npm run build

# 빌드 완료 확인
# ✅ dist/ 폴더가 생성됨
```

#### 1-2. FileZilla 접속 설정

**FileZilla 연결 정보**:
```
호스트: your-server-ip 또는 도메인
포트: 21 (FTP) 또는 22 (SFTP)
사용자명: your-username
비밀번호: your-password
```

#### 1-3. 서버 경로 이동

```
📁 root/aigo/nginx/public/
```

**FileZilla 원격 사이트 패널에서**:
1. `/` (루트)로 이동
2. `aigo` 폴더 더블클릭
3. `nginx` 폴더 더블클릭
4. `public` 폴더 더블클릭

#### 1-4. 파일 업로드

**업로드할 파일 목록** (dist/ 폴더 내):
```
✅ index.html
✅ assets/ (폴더안에 전체 업로드)
```

**업로드 절차**:
1. **로컬 사이트 패널**에서 `dist/` 폴더 열기
2. **폴더를 제외한 모든 파일 선택**
   - `index.html`
   - `favicon.ico`
   - 기타 루트 레벨 파일들
3. 선택한 파일들을 **원격 사이트 패널**(`root/aigo/nginx/public/`)로 드래그
4. 기존 파일이 있으면 `덮어쓰기` 선택

#### 1-5. assets 폴더 업로드

```
📁 dist/assets/ → 📁 root/aigo/nginx/public/assets/
```

**업로드 절차**:
1. **로컬 사이트 패널**에서 `dist/assets/` 폴더 열기
2. **assets 폴더 내의 모든 파일 선택**
   - `index-[hash].js`
   - `index-[hash].css`
   - 기타 번들 파일들
3. **원격 사이트 패널**에서 `assets/` 폴더 더블클릭 (없으면 생성)
4. 선택한 파일들을 `assets/` 폴더로 드래그
5. 기존 파일이 있으면 `덮어쓰기` 선택

#### 1-6. 배포 확인

```bash
# 브라우저에서 확인
https://your-domain.com

# 또는
curl -I https://your-domain.com
```

---

### 🤖 2. AI 페이지 (AIGO) 배포

#### 2-1. AI 페이지 빌드

```bash
# 프로젝트 루트 디렉토리에서
npm install  # 의존성 설치 (최초 1회)

# 프로덕션 빌드
npm run build

# 빌드 완료 확인
# ✅ dist/ 폴더가 생성됨
```

#### 2-2. index.html 파일명 변경

**⚠️ 중요: AI 페이지는 index_1.html로 업로드해야 합니다**

**방법 1: 수동 변경**
```bash
# dist 폴더 내에서
cd dist
mv index.html index_1.html
```

**방법 2: 빌드 스크립트 자동화 (권장)**

**package.json에 추가**:
```json
{
  "scripts": {
    "build": "vite build",
    "build:aigo": "vite build && node scripts/rename-index.js"
  }
}
```

**scripts/rename-index.js 생성**:
```javascript
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');
const oldPath = path.join(distPath, 'index.html');
const newPath = path.join(distPath, 'index_1.html');

if (fs.existsSync(oldPath)) {
  fs.renameSync(oldPath, newPath);
  console.log('✅ index.html → index_1.html 변경 완료');
} else {
  console.error('❌ index.html 파일을 찾을 수 없습니다.');
  process.exit(1);
}
```

**실행**:
```bash
npm run build:aigo
```

#### 2-3. FileZilla 접속 (동일)

**서버 경로**:
```
📁 root/aigo/nginx/public/
```

#### 2-4. 파일 업로드

**업로드할 파일 목록** (dist/ 폴더 내):
```
✅ index_1.html (변경된 파일명)
✅ favicon.ico (있는 경우)
✅ robots.txt (있는 경우)
❌ assets/ (폴더는 나중에 별도 업로드)
```

**업로드 절차**:
1. **로컬 사이트 패널**에서 `dist/` 폴더 열기
2. **폴더를 제외한 모든 파일 선택**
   - ⚠️ **index_1.html** (index.html이 아님!)
   - `favicon.ico`
   - 기타 루트 레벨 파일들
3. 선택한 파일들을 **원격 사이트 패널**(`root/aigo/nginx/public/`)로 드래그
4. 기존 파일이 있으면 `덮어쓰기` 선택

#### 2-5. assets 폴더 업로드

```
📁 dist/assets/ → 📁 root/aigo/nginx/public/assets/
```

**업로드 절차**:
1. **로컬 사이트 패널**에서 `dist/assets/` 폴더 열기
2. **assets 폴더 내의 모든 파일 선택**
   - `index-[hash].js`
   - `index-[hash].css`
   - `vendor-[hash].js`
   - 기타 번들 파일들
3. **원격 사이트 패널**에서 `assets/` 폴더 더블클릭 (없으면 생성)
4. 선택한 파일들을 `assets/` 폴더로 드래그
5. 기존 파일이 있으면 `덮어쓰기` 선택

#### 2-6. 배포 확인

```bash
# 브라우저에서 확인
https://your-domain.com/ai

# 또는
curl -I https://your-domain.com/ai
```

---

### 📋 3. 배포 체크리스트

#### 랜딩 페이지 배포

- [ ] `cd landing` - 랜딩 폴더로 이동
- [ ] `npm install` - 의존성 설치 (최초 1회)
- [ ] `npm run build` - 빌드 실행
- [ ] `dist/` 폴더 생성 확인
- [ ] FileZilla 접속: `root/aigo/nginx/public/`
- [ ] `index.html` 등 루트 파일 업로드 (폴더 제외)
- [ ] `dist/assets/` 내 파일들을 `public/assets/`로 업로드
- [ ] 브라우저에서 동작 확인

#### AI 페이지 (AIGO) 배포

- [ ] 프로젝트 루트에서 작업
- [ ] `npm install` - 의존성 설치 (최초 1회)
- [ ] `npm run build` - 빌드 실행
- [ ] `dist/` 폴더 생성 확인
- [ ] ⚠️ `dist/index.html` → `dist/index_1.html` 파일명 변경
- [ ] FileZilla 접속: `root/aigo/nginx/public/`
- [ ] `index_1.html` 등 루트 파일 업로드 (폴더 제외)
- [ ] `dist/assets/` 내 파일들을 `public/assets/`로 업로드
- [ ] 브라우저에서 동작 확인

---

### 🔧 4. 배포 스크립트 (자동화)

#### deploy-landing.sh

```bash
#!/bin/bash

echo "🚀 랜딩 페이지 배포 시작..."

# 1. 랜딩 폴더로 이동
cd landing || exit 1

# 2. 의존성 확인
if [ ! -d "node_modules" ]; then
  echo "📦 의존성 설치 중..."
  npm install
fi

# 3. 빌드
echo "🔨 빌드 중..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ 빌드 실패"
  exit 1
fi

# 4. 배포 안내
echo "✅ 빌드 완료!"
echo ""
echo "📁 다음 파일들을 FileZilla로 업로드하세요:"
echo "   경로: root/aigo/nginx/public/"
echo ""
echo "   1. dist/ 폴더의 파일들 (폴더 제외):"
echo "      - index.html"
echo "      - favicon.ico"
echo "      - robots.txt"
echo ""
echo "   2. dist/assets/ 폴더의 모든 파일:"
echo "      → public/assets/ 경로로 업로드"
echo ""
```

#### deploy-aigo.sh

```bash
#!/bin/bash

echo "🤖 AI 페이지 (AIGO) 배포 시작..."

# 1. 의존성 확인
if [ ! -d "node_modules" ]; then
  echo "📦 의존성 설치 중..."
  npm install
fi

# 2. 빌드
echo "🔨 빌드 중..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ 빌드 실패"
  exit 1
fi

# 3. index.html → index_1.html 변경
echo "📝 파일명 변경 중..."
cd dist
if [ -f "index.html" ]; then
  mv index.html index_1.html
  echo "✅ index.html → index_1.html 변경 완료"
else
  echo "❌ index.html 파일을 찾을 수 없습니다."
  exit 1
fi
cd ..

# 4. 배포 안내
echo "✅ 빌드 완료!"
echo ""
echo "📁 다음 파일들을 FileZilla로 업로드하세요:"
echo "   경로: root/aigo/nginx/public/"
echo ""
echo "   1. dist/ 폴더의 파일들 (폴더 제외):"
echo "      ⚠️  index_1.html (파일명 주의!)"
echo "      - favicon.ico"
echo "      - robots.txt"
echo ""
echo "   2. dist/assets/ 폴더의 모든 파일:"
echo "      → public/assets/ 경로로 업로드"
echo ""
```

**실행 권한 부여**:
```bash
chmod +x deploy-landing.sh
chmod +x deploy-aigo.sh
```

**사용 방법**:
```bash
# 랜딩 페이지 배포
./deploy-landing.sh

# AI 페이지 배포
./deploy-aigo.sh
```

---

### ⚠️ 5. 주의사항

#### 필수 확인 사항

1. **파일명 확인**
   - 랜딩: `index.html`
   - AI: `index_1.html` ⚠️

2. **폴더 제외**
   - `dist/` 폴더의 **파일만** 업로드
   - `assets/` 폴더는 별도로 내부 파일만 업로드

3. **덮어쓰기 확인**
   - 기존 파일이 있을 경우 반드시 덮어쓰기

4. **권한 확인**
   - 업로드한 파일의 권한이 올바른지 확인
   - 일반적으로 `644` (읽기/쓰기)

#### 문제 해결

**문제 1: 파일 업로드 실패**
```
원인: 권한 부족 또는 경로 오류
해결: 
1. FileZilla에서 올바른 경로 확인
2. 서버 관리자에게 권한 요청
3. SFTP 대신 FTP 시도 (또는 반대)
```

**문제 2: 페이지가 표시되지 않음**
```
원인: 파일명 또는 경로 오류
해결:
1. index.html / index_1.html 파일명 확인
2. assets 폴더 경로 확인
3. 브라우저 캐시 삭제 후 재시도
```

**문제 3: CSS/JS 파일이 로드되지 않음**
```
원인: assets 폴더 경로 또는 권한 문제
해결:
1. assets/ 폴더 내 파일들이 올바르게 업로드되었는지 확인
2. 파일 권한 644 확인
3. 브라우저 개발자 도구에서 네트워크 탭 확인
```

**문제 4: 이전 버전이 계속 표시됨**
```
원인: 브라우저 캐시
해결:
1. Ctrl + Shift + R (하드 리프레시)
2. 브라우저 시크릿 모드에서 확인
3. 브라우저 캐시 완전 삭제
```

---

### 📊 6. 배포 후 확인

#### 체크리스트

- [ ] 페이지가 정상적으로 로드되는가?
- [ ] CSS 스타일이 올바르게 적용되는가?
- [ ] JavaScript 기능이 정상 동작하는가?
- [ ] 이미지가 올바르게 표시되는가?
- [ ] 모바일에서도 정상 동작하는가?
- [ ] 콘솔에 에러가 없는가?

#### 브라우저 개발자 도구 확인

```javascript
// F12 또는 Ctrl+Shift+I로 개발자 도구 열기

// 1. Console 탭
// - 에러 메시지 확인
// - 경고 메시지 확인

// 2. Network 탭
// - 모든 파일이 200 (성공) 상태로 로드되는지 확인
// - 404 (Not Found) 오류가 없는지 확인

// 3. Application 탭
// - 캐시 확인 및 필요 시 삭제
```

---

### 🔄 7. 롤백 방법

#### 이전 버전으로 되돌리기

**방법 1: FileZilla 백업 복원**
```
1. 배포 전 항상 기존 파일 백업
2. 로컬에 backup/ 폴더 생성
3. 서버의 현재 파일들을 backup/으로 다운로드
4. 문제 발생 시 backup/ 파일들을 다시 업로드
```

**방법 2: Git 이전 커밋으로 빌드**
```bash
# 이전 커밋 확인
git log --oneline

# 특정 커밋으로 체크아웃
git checkout <commit-hash>

# 빌드
npm run build

# 파일명 변경 (AI 페이지의 경우)
cd dist && mv index.html index_1.html

# FileZilla로 재배포
```

---

## Firebase Hosting 배포

### 1. Firebase 프로젝트 초기화

```bash
# Firebase 프로젝트 초기화
firebase init hosting

# 선택 옵션:
# - Public directory: dist
# - Configure as single-page app: Yes
# - Set up automatic builds with GitHub: No (수동 배포)
```

**firebase.json 설정**:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|webp|svg)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### 2. 배포 스크립트 작성

**deploy.sh**:
```bash
#!/bin/bash

echo "🚀 AI Estimate 배포 시작..."

# 1. 빌드
echo "📦 빌드 중..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ 빌드 실패"
  exit 1
fi

# 2. Firebase 배포
echo "🔥 Firebase에 배포 중..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
  echo "✅ 배포 완료!"
  echo "🌐 URL: https://your-project.web.app"
else
  echo "❌ 배포 실패"
  exit 1
fi
```

**실행 권한 부여**:
```bash
chmod +x deploy.sh
```

### 3. 배포 실행

```bash
# 스크립트로 배포
./deploy.sh

# 또는 직접 명령어 실행
npm run build && firebase deploy --only hosting
```

### 4. 다중 환경 배포

**firebase.json (다중 타겟)**:
```json
{
  "hosting": [
    {
      "target": "production",
      "public": "dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
    },
    {
      "target": "staging",
      "public": "dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
    }
  ]
}
```

**배포 명령어**:
```bash
# 프로덕션 배포
firebase deploy --only hosting:production

# 스테이징 배포
firebase deploy --only hosting:staging
```

---

## 환경 변수 관리

### 환경 변수 파일 구조

```
.env.example         # 예시 템플릿
.env.local           # 로컬 개발 (Git 무시)
.env.dev             # 개발 환경
.env.staging         # 스테이징 환경
.env.production      # 프로덕션 환경
```

### .env.example

```bash
# API 설정
VITE_API_HOST=https://api.example.com
VITE_ENV_NAME=production

# Firebase 설정
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Google Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### .env.dev

```bash
VITE_API_HOST=http://localhost:3000
VITE_ENV_NAME=dev
# ... 나머지 설정
```

### .env.production

```bash
VITE_API_HOST=https://api.production.com
VITE_ENV_NAME=production
# ... 나머지 설정
```

### 환경별 빌드

**package.json**:
```json
{
  "scripts": {
    "dev": "vite --mode dev",
    "build:dev": "vite build --mode dev",
    "build:staging": "vite build --mode staging",
    "build:prod": "vite build --mode production"
  }
}
```

### 환경 변수 사용

```typescript
// src/config/env.ts
export const ENV = {
  API_HOST: import.meta.env.VITE_API_HOST,
  ENV_NAME: import.meta.env.VITE_ENV_NAME,
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};

// 사용 예시
import { ENV } from '@/config/env';

const apiUrl = `${ENV.API_HOST}/api/users`;
```

---

## 도메인 설정

### 1. Firebase Hosting에 커스텀 도메인 추가

```bash
# Firebase 콘솔에서 진행
# Hosting > Domain > Add custom domain
```

**단계**:
1. 도메인 입력 (예: ai-estimate.com)
2. DNS 레코드 추가
   - Type: A
   - Name: @
   - Value: Firebase IP 주소
3. SSL 인증서 자동 발급 (Let's Encrypt)

### 2. DNS 설정 (예: Cloudflare)

```
Type: A
Name: @
Content: 151.101.1.195 (Firebase IP)
Proxy: On

Type: A
Name: www
Content: 151.101.1.195
Proxy: On
```

### 3. 도메인 확인

```bash
# DNS 전파 확인
nslookup ai-estimate.com

# SSL 인증서 확인
curl -I https://ai-estimate.com
```

---

## CI/CD 파이프라인

### GitHub Actions 설정

**.github/workflows/deploy.yml**:
```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build:prod
        env:
          VITE_API_HOST: ${{ secrets.VITE_API_HOST }}
          VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-firebase-project-id
```

### GitHub Secrets 설정

**Repository Settings > Secrets and variables > Actions**:
```
VITE_API_HOST=https://api.production.com
VITE_GEMINI_API_KEY=your_gemini_api_key
FIREBASE_SERVICE_ACCOUNT={...JSON...}
```

### 자동 배포 워크플로우

```yaml
# 프로덕션 배포 (main 브랜치)
on:
  push:
    branches: [main]

# 스테이징 배포 (develop 브랜치)
on:
  push:
    branches: [develop]

# PR 미리보기
on:
  pull_request:
    branches: [main]
```

---

## 모니터링 및 로그

### 1. Firebase Analytics

**firebaseConfig.ts**:
```typescript
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics(app);

// 이벤트 추적
export const trackEvent = (eventName: string, params?: any) => {
  logEvent(analytics, eventName, params);
};

// 사용 예시
trackEvent('estimate_created', {
  project_name: 'Website',
  total_amount: 5000000,
});
```

### 2. 에러 트래킹 (Sentry)

```bash
npm install @sentry/react @sentry/vite-plugin
```

**vite.config.ts**:
```typescript
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'your-org',
      project: 'ai-estimate',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
});
```

**main.tsx**:
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: import.meta.env.VITE_ENV_NAME,
  tracesSampleRate: 1.0,
});
```

### 3. 성능 모니터링

**Firebase Performance**:
```typescript
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);

// 자동 추적 활성화
// - 페이지 로드 시간
// - 네트워크 요청
// - 사용자 인터랙션
```

### 4. 로그 수집

**devLogger.ts**:
```typescript
export const devLog = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

export const errorLog = (error: Error, context?: any) => {
  console.error('에러 발생:', error);
  
  if (import.meta.env.PROD) {
    // Sentry로 전송
    Sentry.captureException(error, {
      extra: context,
    });
  }
};
```

---

## 트러블슈팅

### 1. 빌드 오류

**문제**: `npm run build` 실패

**해결**:
```bash
# 캐시 삭제
rm -rf node_modules
rm package-lock.json

# 재설치
npm install

# 빌드 재시도
npm run build
```

### 2. 환경 변수 인식 안됨

**문제**: `import.meta.env.VITE_API_HOST` undefined

**해결**:
```bash
# 1. .env 파일 확인
cat .env.production

# 2. VITE_ 접두사 확인
# ✅ VITE_API_HOST=...
# ❌ API_HOST=...

# 3. 빌드 명령어에 --mode 옵션
npm run build -- --mode production
```

### 3. Firebase 배포 실패

**문제**: `firebase deploy` 권한 오류

**해결**:
```bash
# 1. 재로그인
firebase logout
firebase login

# 2. 프로젝트 확인
firebase projects:list
firebase use your-project-id

# 3. 배포 재시도
firebase deploy --only hosting
```

### 4. SPA 라우팅 404 에러

**문제**: `/ai` 페이지 새로고침 시 404

**해결 (firebase.json)**:
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 5. 캐싱 문제

**문제**: 새 배포 후에도 이전 코드 실행

**해결**:
```json
// firebase.json
{
  "hosting": {
    "headers": [
      {
        "source": "/index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

### 6. API CORS 에러

**문제**: API 호출 시 CORS 오류

**해결**:
```typescript
// 백엔드에서 CORS 설정 필요
// Express 예시
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-project.web.app',
    'https://ai-estimate.com'
  ],
  credentials: true,
}));
```

---

## 배포 체크리스트

### 배포 전

- [ ] 모든 테스트 통과
- [ ] 환경 변수 설정 확인
- [ ] API 엔드포인트 확인
- [ ] 빌드 로컬 테스트 (`npm run preview`)
- [ ] Git 커밋 및 푸시

### 배포 중

- [ ] 빌드 성공 확인
- [ ] Firebase 배포 성공 확인
- [ ] 배포 URL 확인

### 배포 후

- [ ] 프로덕션 사이트 접속 테스트
- [ ] 주요 기능 동작 확인
  - [ ] AI 채팅
  - [ ] 견적서 생성
  - [ ] 로그인/로그아웃
  - [ ] CMS 접근
- [ ] 모바일 반응형 확인
- [ ] 성능 모니터링 확인
- [ ] 에러 로그 확인

---

## 롤백 절차

### 1. Firebase Hosting 이전 버전으로 롤백

```bash
# 배포 이력 확인
firebase hosting:channel:list

# 특정 버전으로 롤백
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID DESTINATION_SITE_ID:live
```

### 2. Git 이전 커밋으로 롤백

```bash
# 이전 커밋 확인
git log --oneline

# 특정 커밋으로 되돌리기
git revert <commit-hash>

# 재배포
npm run build && firebase deploy
```

---

## 성능 최적화

### 1. 번들 크기 최적화

**vite.config.ts**:
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['styled-components', '@mui/material'],
          'ai-vendor': ['@google/generative-ai'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### 2. 이미지 최적화

```bash
# WebP 변환
npm install -D vite-plugin-webp

# vite.config.ts
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      webp: { quality: 80 },
    }),
  ],
});
```

### 3. Lazy Loading

```tsx
import { lazy, Suspense } from 'react';

const EstimateCard = lazy(() => import('@/components/ai-esti/EstimateCard'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <EstimateCard />
    </Suspense>
  );
}
```

---

## 참고 링크

- [Firebase Hosting 공식 문서](https://firebase.google.com/docs/hosting)
- [Vite 배포 가이드](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Actions 문서](https://docs.github.com/en/actions)

---

**문서 버전**: 1.0.0  
**최종 수정일**: 2025-01-24
