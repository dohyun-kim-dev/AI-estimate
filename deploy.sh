#!/bin/bash

# SSH + rsync 배포 스크립트 (여러 파일/폴더 업로드용)
# 원격 명령어 실행 없이, 파일 동기화만 수행합니다.
# Usage: sh deploy.sh

set -e

# --- 🚀 배포 설정 (이곳을 프로젝트에 맞게 직접 수정하세요) ---

# 1. 원격 서버 정보
REMOTE_HOST="1.234.5.29"
REMOTE_USER="root"
REMOTE_PORT="22"
SSH_KEY="~/.ssh/id_rsa"

# 2. 프로젝트 경로 정보
# 업로드할 파일/폴더 목록입니다. 괄호 안에 공백으로 구분하여 여러 개를 추가하세요.
# 예: ("./build" "./public" "package.json")
SOURCE_PATHS=("dist")
# 원격 서버에 파일이 저장될 부모 디렉토리의 절대 경로입니다.
REMOTE_PATH="/root/aigo/nginx/public"

# --- 설정 끝 ---


# --- 스크립트 본문 (수정 필요 없음) ---

# 컬러 출력 함수
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo_info() { echo -e "${YELLOW}[INFO]${NC} $1"; }
echo_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
echo_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 스크립트 실행 위치 기준
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo_info "=== 배포 시작: $REMOTE_USER@$REMOTE_HOST ==="

# 배포 전 최종 확인
read -p "위 서버의 '${REMOTE_PATH}' 경로에 파일을 업로드하시겠습니까? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo_info "배포가 취소되었습니다."
    exit 1
fi

# 1. SSH 연결 테스트
echo_info "SSH 연결 테스트..."
if ! ssh -i "$SSH_KEY" -p "$REMOTE_PORT" -o ConnectTimeout=10 "$REMOTE_USER@$REMOTE_HOST" "exit" 2>/dev/null; then
    echo_error "SSH 연결 실패: $REMOTE_USER@$REMOTE_HOST:$REMOTE_PORT"
    exit 1
fi
echo_success "SSH 연결 성공"

# 2. 로컬 빌드 (필요시 주석 해제하여 사용)
echo_info "프로젝트 빌드..."
cd "$SCRIPT_DIR"
npm run build
echo_success "빌드 완료"

# 3. 파일 동기화 (rsync)
echo_info "파일 동기화 시작..."

for src_path in "${SOURCE_PATHS[@]}"; do
    echo_info "  -> 동기화 중: $src_path"
    rsync -avz --delete \
        -e "ssh -i $SSH_KEY -p $REMOTE_PORT" \
        "$SCRIPT_DIR/$src_path/" \
        "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
done

echo_success "파일 동기화 완료"
echo_success "=== 모든 파일 업로드가 완료되었습니다. ==="