# API 명세서

## 📋 목차
1. [개요](#개요)
2. [인증](#인증)
3. [통합 관리자 API](#통합-관리자-api)
4. [사이트 CMS API](#사이트-cms-api)
5. [사용자 API](#사용자-api)
6. [공통 응답 형식](#공통-응답-형식)
7. [에러 코드](#에러-코드)

---

## 개요

### Base URLs

```
통합 관리자: /api/cms
사이트 CMS:  /api/company/cms
사용자:      /api
```

### 헤더 규칙

```http
Content-Type: application/json
Authorization: Bearer {token}           # 인증 필요 시
x-company-code: {companyCode}           # 사이트 CMS 전용
```

---

## 인증

### 1. 관리자 로그인

**Endpoint**: `POST /api/cms/login`

**Request**:
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "admin": {
      "_id": "admin_id_123",
      "email": "admin@example.com",
      "name": "홍길동",
      "isRoot": false,
      "companyCode": "company001"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**JWT Payload**:
```json
{
  "userId": "admin_id_123",
  "isRoot": false,
  "companyCode": "company001",
  "iat": 1234567890,
  "exp": 1234571490
}
```

---

### 2. 구글 소셜 로그인 (초기화)

**Endpoint**: `POST /api/user/login/google/initial`

**Request**:
```json
{
  "providerId": "google_unique_id_123",
  "email": "user@gmail.com",
  "name": "홍길동",
  "companyCode": "company001"
}
```

**Response (신규 사용자)**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "needsUpdate": true,
    "tempToken": "temp_token_for_update"
  }
}
```

**Response (기존 사용자)**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "needsUpdate": false,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "user_id_123",
      "email": "user@gmail.com",
      "name": "홍길동",
      "phone": "010-1234-5678"
    }
  }
}
```

---

### 3. 구글 소셜 로그인 (정보 업데이트)

**Endpoint**: `POST /api/user/login/google/update`

**Request**:
```json
{
  "tempToken": "temp_token_from_initial",
  "name": "홍길동",
  "phone": "010-1234-5678",
  "companyName": "홍길동컴퍼니",
  "email": "user@gmail.com"
}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "user_id_123",
      "email": "user@gmail.com",
      "name": "홍길동",
      "phone": "010-1234-5678",
      "companyName": "홍길동컴퍼니"
    }
  }
}
```

---

## 통합 관리자 API

### 고객사 관리

#### 1. 고객사 목록 조회

**Endpoint**: `GET /api/cms/company`

**Query Parameters**:
```
page: number (default: 1)
limit: number (default: 10)
search: string (optional) - 회사명 검색
```

**Request**:
```http
GET /api/cms/company?page=1&limit=10&search=테크
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "companies": [
      {
        "_id": "company_id_123",
        "companyCode": "company001",
        "companyName": "테크컴퍼니",
        "mode": "LIGHT",
        "discountRate": "WEEK",
        "rateRule": "FIXED",
        "minValue": 0,
        "maxValue": 8,
        "checkpointList": [
          {
            "checkpoint": 1,
            "discountRate": 1.25
          }
        ],
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-15T00:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

#### 2. 고객사 상세 조회

**Endpoint**: `GET /api/cms/company/:companyCode`

**Request**:
```http
GET /api/cms/company/company001
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "_id": "company_id_123",
    "companyCode": "company001",
    "companyName": "테크컴퍼니",
    "mode": "LIGHT",
    "discountRate": "WEEK",
    "rateRule": "FIXED",
    "minValue": 0,
    "maxValue": 8,
    "checkpointList": [
      {
        "checkpoint": 1,
        "discountRate": 1.25
      }
    ],
    "logo": "https://storage.example.com/logos/company001.png",
    "primaryColor": "#1976D2",
    "secondaryColor": "#FF9800",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T00:00:00.000Z"
  }
}
```

---

#### 3. 고객사 생성

**Endpoint**: `POST /api/cms/company`

**Request**:
```json
{
  "companyCode": "company002",
  "companyName": "신규컴퍼니",
  "mode": "DARK",
  "discountRate": "MONTH",
  "rateRule": "DYNAMIC",
  "minValue": 0,
  "maxValue": 8,
  "checkpointList": [
    {
      "checkpoint": 1,
      "discountRate": 5
    },
    {
      "checkpoint": 5,
      "discountRate": 10
    },
    {
      "checkpoint": 8,
      "discountRate": 20
    }
  ],
  "primaryColor": "#2196F3",
  "secondaryColor": "#FFC107"
}
```

**Response**:
```json
{
  "statusCode": 201,
  "message": "success",
  "data": {
    "_id": "company_id_456",
    "companyCode": "company002",
    "companyName": "신규컴퍼니",
    "createdAt": "2025-01-24T00:00:00.000Z"
  }
}
```

---

#### 4. 고객사 수정

**Endpoint**: `PATCH /api/cms/company`

**Query Parameters**:
```
companyCode: string (required)
```

**Request**:
```json
{
  "companyName": "수정된컴퍼니명",
  "mode": "LIGHT",
  "checkpointList": [
    {
      "checkpoint": 1,
      "discountRate": 2
    }
  ]
}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "_id": "company_id_123",
    "companyCode": "company001",
    "companyName": "수정된컴퍼니명",
    "updatedAt": "2025-01-24T10:00:00.000Z"
  }
}
```

---

#### 5. 고객사 삭제

**Endpoint**: `DELETE /api/cms/company/:companyCode`

**Request**:
```http
DELETE /api/cms/company/company001
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "deletedCompanyCode": "company001"
  }
}
```

---

### 관리자 관리

#### 1. 관리자 목록 조회

**Endpoint**: `GET /api/cms/admins`

**Query Parameters**:
```
isRoot: boolean (optional) - 슈퍼 관리자만 조회
companyCode: string (optional) - 특정 회사 관리자만
page: number (default: 1)
limit: number (default: 10)
```

**Request**:
```http
GET /api/cms/admins?isRoot=false&companyCode=company001
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "admins": [
      {
        "_id": "admin_id_123",
        "email": "admin@company001.com",
        "name": "김관리자",
        "isRoot": false,
        "companyCode": "company001",
        "companyName": "테크컴퍼니",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 10
  }
}
```

---

#### 2. 관리자 생성

**Endpoint**: `POST /api/cms/admins`

**Request**:
```json
{
  "email": "newadmin@company001.com",
  "password": "password123!",
  "name": "새관리자",
  "isRoot": false,
  "companyCode": "company001"
}
```

**Response**:
```json
{
  "statusCode": 201,
  "message": "success",
  "data": {
    "_id": "admin_id_789",
    "email": "newadmin@company001.com",
    "name": "새관리자",
    "isRoot": false,
    "companyCode": "company001"
  }
}
```

---

#### 3. 관리자 수정

**Endpoint**: `PATCH /api/cms/admins/:adminId`

**Request**:
```json
{
  "name": "수정된이름",
  "password": "newpassword123!"
}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "_id": "admin_id_789",
    "name": "수정된이름",
    "updatedAt": "2025-01-24T10:00:00.000Z"
  }
}
```

---

#### 4. 관리자 삭제

**Endpoint**: `DELETE /api/cms/admins/:adminId`

**Request**:
```http
DELETE /api/cms/admins/admin_id_789
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "deletedAdminId": "admin_id_789"
  }
}
```

---

### 카테고리 관리

#### 1. 카테고리 목록 조회

**Endpoint**: `GET /api/cms/company/category`

**Request**:
```http
GET /api/cms/company/category
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": [
    {
      "_id": "category_id_123",
      "name": "프론트엔드 개발",
      "order": 1,
      "subCategories": [
        {
          "_id": "sub_cat_456",
          "name": "화면 개발",
          "order": 1
        }
      ]
    }
  ]
}
```

---

#### 2. 카테고리 생성

**Endpoint**: `POST /api/cms/company/category`

**Request**:
```json
{
  "name": "백엔드 개발",
  "order": 2,
  "subCategories": [
    {
      "name": "API 개발",
      "order": 1
    }
  ]
}
```

**Response**:
```json
{
  "statusCode": 201,
  "message": "success",
  "data": {
    "_id": "category_id_789",
    "name": "백엔드 개발",
    "order": 2
  }
}
```

---

### AI 데이터 관리

#### 1. 대화 이력 조회

**Endpoint**: `GET /api/cms/company/chat`

**Query Parameters**:
```
companyCode: string (optional)
fromDate: string (ISO 8601)
toDate: string (ISO 8601)
page: number (default: 1)
limit: number (default: 10)
```

**Request**:
```http
GET /api/cms/company/chat?companyCode=company001&fromDate=2025-01-01&toDate=2025-01-31
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "chats": [
      {
        "_id": "chat_session_123",
        "companyCode": "company001",
        "userId": "user_id_123",
        "userName": "홍길동",
        "userEmail": "hong@example.com",
        "messageCount": 15,
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-15T11:30:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

---

#### 2. 채팅 메시지 상세 조회

**Endpoint**: `GET /api/cms/company/chat/:chatId/messages`

**Query Parameters**:
```
companyCode: string (required)
```

**Request**:
```http
GET /api/cms/company/chat/chat_session_123/messages?companyCode=company001
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "chatSession": {
      "_id": "chat_session_123",
      "userId": "user_id_123",
      "userName": "홍길동"
    },
    "messages": [
      {
        "_id": "msg_123",
        "role": "user",
        "content": "웹사이트 제작 견적 요청합니다",
        "createdAt": "2025-01-15T10:00:00.000Z"
      },
      {
        "_id": "msg_124",
        "role": "assistant",
        "content": "네, 웹사이트 제작 견적을 도와드리겠습니다...",
        "estimateId": "estimate_456",
        "createdAt": "2025-01-15T10:01:00.000Z"
      }
    ]
  }
}
```

---

#### 3. 견적 다운로드 현황

**Endpoint**: `GET /api/cms/estimate/download`

**Query Parameters**:
```
companyCode: string (optional)
fromDate: string (ISO 8601)
toDate: string (ISO 8601)
page: number (default: 1)
limit: number (default: 10)
```

**Request**:
```http
GET /api/cms/estimate/download?companyCode=company001&fromDate=2025-01-01
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "downloads": [
      {
        "_id": "download_id_123",
        "companyCode": "company001",
        "estimateId": "estimate_456",
        "projectName": "웹사이트 제작",
        "userName": "홍길동",
        "userEmail": "hong@example.com",
        "userPhone": "010-1234-5678",
        "totalAmount": 5000000,
        "downloadedAt": "2025-01-15T12:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

---

## 사이트 CMS API

### 회사 정보 관리

#### 1. 회사 정보 조회

**Endpoint**: `GET /api/company/info`

**Headers**:
```
x-company-code: company001
```

**Request**:
```http
GET /api/company/info
x-company-code: company001
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "_id": "company_id_123",
    "companyCode": "company001",
    "companyName": "테크컴퍼니",
    "mode": "LIGHT",
    "discountRate": "WEEK",
    "rateRule": "FIXED",
    "minValue": 0,
    "maxValue": 8,
    "checkpointList": [
      {
        "checkpoint": 1,
        "discountRate": 1.25
      }
    ],
    "logo": "https://storage.example.com/logos/company001.png",
    "primaryColor": "#1976D2",
    "secondaryColor": "#FF9800"
  }
}
```

---

#### 2. 회사 정보 수정

**Endpoint**: `PATCH /api/company/cms/info`

**Query Parameters**:
```
companyCode: string (required)
```

**Headers**:
```
Authorization: Bearer {admin_token}
x-company-code: company001
```

**Request**:
```json
{
  "companyName": "수정된회사명",
  "mode": "DARK",
  "primaryColor": "#2196F3"
}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "_id": "company_id_123",
    "companyName": "수정된회사명",
    "mode": "DARK",
    "updatedAt": "2025-01-24T10:00:00.000Z"
  }
}
```

---

### 회원 관리

#### 1. 회원 목록 조회

**Endpoint**: `GET /api/company/cms/users`

**Query Parameters**:
```
companyCode: string (required)
page: number (default: 1)
limit: number (default: 10)
search: string (optional) - 이름/이메일 검색
```

**Request**:
```http
GET /api/company/cms/users?companyCode=company001&page=1&limit=10
Authorization: Bearer {admin_token}
x-company-code: company001
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "users": [
      {
        "_id": "user_id_123",
        "email": "user@example.com",
        "name": "홍길동",
        "phone": "010-1234-5678",
        "companyName": "홍길동컴퍼니",
        "createdAt": "2025-01-10T00:00:00.000Z",
        "lastLoginAt": "2025-01-24T09:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

---

### 견적 요청 관리

#### 1. 견적 요청 목록

**Endpoint**: `GET /api/company/cms/estimate-requests`

**Query Parameters**:
```
companyCode: string (required)
status: string (optional) - 'PENDING' | 'COMPLETED' | 'CANCELLED'
page: number (default: 1)
limit: number (default: 10)
```

**Request**:
```http
GET /api/company/cms/estimate-requests?companyCode=company001&status=PENDING
Authorization: Bearer {admin_token}
x-company-code: company001
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "requests": [
      {
        "_id": "request_id_123",
        "estimateId": "estimate_456",
        "projectName": "웹사이트 제작",
        "userName": "홍길동",
        "userEmail": "hong@example.com",
        "userPhone": "010-1234-5678",
        "totalAmount": 5000000,
        "status": "PENDING",
        "createdAt": "2025-01-15T10:00:00.000Z"
      }
    ],
    "total": 20,
    "page": 1,
    "limit": 10
  }
}
```

---

#### 2. 견적 상태 업데이트

**Endpoint**: `PATCH /api/company/cms/estimate-requests/:requestId`

**Request**:
```json
{
  "status": "COMPLETED",
  "memo": "견적서 확인 완료"
}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "_id": "request_id_123",
    "status": "COMPLETED",
    "memo": "견적서 확인 완료",
    "updatedAt": "2025-01-24T10:00:00.000Z"
  }
}
```

---

### AI 설정

#### 1. 프롬프트 목록 조회

**Endpoint**: `GET /api/company/cms/ai/prompt/get-list`

**Headers**:
```
x-company-code: company001
Authorization: Bearer {admin_token}
```

**Request**:
```http
GET /api/company/cms/ai/prompt/get-list
x-company-code: company001
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "systemPrompt": "당신은 프로젝트 견적서를 작성하는 전문가입니다...",
    "version": 5,
    "updatedAt": "2025-01-20T10:00:00.000Z",
    "updatedBy": "admin@company001.com"
  }
}
```

---

#### 2. 프롬프트 수정

**Endpoint**: `PATCH /api/company/cms/ai/prompt/update`

**Request**:
```json
{
  "companyCode": "company001",
  "systemPrompt": "수정된 프롬프트 내용...",
  "updatedBy": "admin@company001.com"
}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "systemPrompt": "수정된 프롬프트 내용...",
    "version": 6,
    "updatedAt": "2025-01-24T10:00:00.000Z"
  }
}
```

---

#### 3. 프롬프트 이력 조회

**Endpoint**: `GET /api/company/cms/ai/prompt/history/get-list`

**Query Parameters**:
```
index: number (optional) - 특정 버전 조회
```

**Request**:
```http
GET /api/company/cms/ai/prompt/history/get-list?index=5
x-company-code: company001
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "history": [
      {
        "version": 5,
        "systemPrompt": "이전 프롬프트...",
        "updatedBy": "admin@company001.com",
        "updatedAt": "2025-01-20T10:00:00.000Z"
      },
      {
        "version": 4,
        "systemPrompt": "더 이전 프롬프트...",
        "updatedBy": "admin@company001.com",
        "updatedAt": "2025-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

---

#### 4. 단가표 조회

**Endpoint**: `GET /api/company/cms/unit-prices`

**Query Parameters**:
```
companyCode: string (required)
```

**Request**:
```http
GET /api/company/cms/unit-prices?companyCode=company001
x-company-code: company001
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "unitPrices": [
      {
        "_id": "price_id_123",
        "category": "프론트엔드 개발",
        "subCategory": "화면 개발",
        "task": "일반 화면",
        "unit": "페이지",
        "unitPrice": 50000,
        "minQuantity": 1,
        "maxQuantity": 100
      },
      {
        "_id": "price_id_124",
        "category": "프론트엔드 개발",
        "subCategory": "화면 개발",
        "task": "복잡 화면",
        "unit": "페이지",
        "unitPrice": 100000
      }
    ],
    "total": 150
  }
}
```

---

#### 5. 단가표 업로드 (엑셀)

**Endpoint**: `POST /api/company/cms/unit-prices`

**Content-Type**: `multipart/form-data`

**Request**:
```
FormData:
- file: Excel file (.xlsx)
- companyCode: "company001"
```

**Response**:
```json
{
  "statusCode": 201,
  "message": "success",
  "data": {
    "uploaded": 150,
    "failed": 0,
    "unitPrices": [...]
  }
}
```

---

#### 6. 단가 항목 삭제

**Endpoint**: `DELETE /api/company/cms/unit-prices/:priceId`

**Request**:
```http
DELETE /api/company/cms/unit-prices/price_id_123
x-company-code: company001
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "deletedId": "price_id_123"
  }
}
```

---

#### 7. 단가표 전체 삭제

**Endpoint**: `DELETE /api/company/cms/unit-prices/all`

**Query Parameters**:
```
companyCode: string (required)
```

**Request**:
```http
DELETE /api/company/cms/unit-prices/all?companyCode=company001
x-company-code: company001
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "deletedCount": 150
  }
}
```

---

## 사용자 API

### 채팅

#### 1. 채팅 세션 생성

**Endpoint**: `POST /api/chat/sessions`

**Request (비회원)**:
```json
{
  "companyCode": "company001",
  "guestUuid": "guest_uuid_123"
}
```

**Request (회원)**:
```json
{
  "companyCode": "company001",
  "userId": "user_id_123"
}
```

**Response**:
```json
{
  "statusCode": 201,
  "message": "success",
  "data": {
    "_id": "chat_session_789",
    "companyCode": "company001",
    "userId": "user_id_123",
    "guestUuid": null,
    "createdAt": "2025-01-24T10:00:00.000Z"
  }
}
```

---

#### 2. 채팅 메시지 조회

**Endpoint**: `GET /api/chat/sessions/:sessionId/messages`

**Request**:
```http
GET /api/chat/sessions/chat_session_789/messages
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "messages": [
      {
        "_id": "msg_123",
        "sessionId": "chat_session_789",
        "role": "user",
        "content": "웹사이트 견적 요청",
        "images": [],
        "files": [],
        "createdAt": "2025-01-24T10:00:00.000Z"
      },
      {
        "_id": "msg_124",
        "sessionId": "chat_session_789",
        "role": "assistant",
        "content": "네, 도와드리겠습니다...",
        "estimateId": "estimate_456",
        "createdAt": "2025-01-24T10:01:00.000Z"
      }
    ]
  }
}
```

---

#### 3. 비회원→회원 세션 전환

**Endpoint**: `POST /api/chat/sessions/transfer`

**Request**:
```json
{
  "sessionId": "chat_session_789",
  "userId": "user_id_123"
}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "_id": "chat_session_789",
    "userId": "user_id_123",
    "guestUuid": null,
    "updatedAt": "2025-01-24T10:05:00.000Z"
  }
}
```

---

### 견적서

#### 1. 견적서 업로드

**Endpoint**: `POST /api/estimate/upload`

**Request**:
```json
{
  "companyCode": "company001",
  "userId": "user_id_123",
  "guestUuid": null,
  "estimate": {
    "project_name": "웹사이트 제작",
    "categories": [...],
    "total_amount": 5000000,
    "estimated_period": "8"
  },
  "publisherInfo": {
    "name": "홍길동",
    "email": "hong@example.com",
    "phone": "010-1234-5678",
    "companyName": "홍길동컴퍼니"
  }
}
```

**Response**:
```json
{
  "statusCode": 201,
  "message": "success",
  "data": {
    "_id": "estimate_id_456",
    "uuid": "unique_uuid_789",
    "pdfPath": "/company001/unique_uuid_789.pdf",
    "createdAt": "2025-01-24T10:00:00.000Z"
  }
}
```

---

#### 2. 견적서 다운로드 (PDF)

**Endpoint**: `GET /api/estimate/download/:companyCode/:uuid.pdf`

**Request**:
```http
GET /api/estimate/download/company001/unique_uuid_789.pdf
```

**Response**: PDF 파일 (application/pdf)

---

## 공통 응답 형식

### 성공 응답

```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    // 응답 데이터
  }
}
```

### 에러 응답

```json
{
  "statusCode": 400,
  "message": "error",
  "error": {
    "code": "INVALID_INPUT",
    "message": "잘못된 입력입니다",
    "customMessage": "이메일 형식이 올바르지 않습니다",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

---

## 에러 코드

### 4xx - 클라이언트 에러

| 코드 | 메시지 | 설명 |
|-----|--------|------|
| 400 | INVALID_INPUT | 잘못된 입력 데이터 |
| 401 | UNAUTHORIZED | 인증 실패 (토큰 없음/만료) |
| 403 | FORBIDDEN | 권한 없음 |
| 404 | NOT_FOUND | 리소스를 찾을 수 없음 |
| 409 | CONFLICT | 중복된 데이터 (이메일, 회사코드 등) |
| 422 | VALIDATION_ERROR | 유효성 검사 실패 |

### 5xx - 서버 에러

| 코드 | 메시지 | 설명 |
|-----|--------|------|
| 500 | INTERNAL_SERVER_ERROR | 서버 내부 오류 |
| 502 | BAD_GATEWAY | 게이트웨이 오류 |
| 503 | SERVICE_UNAVAILABLE | 서비스 일시 중단 |

---

## 예시 시나리오

### 시나리오 1: 비회원 견적 생성 및 다운로드

```javascript
// 1. 채팅 세션 생성
const guestUuid = generateUuid();
const session = await createChatSession({
  companyCode: 'company001',
  guestUuid
});

// 2. AI 채팅 (Gemini API - 클라이언트에서 직접 호출)
// ... AI 응답 수신

// 3. 견적서 업로드
const estimate = await uploadEstimate({
  companyCode: 'company001',
  guestUuid,
  estimate: extractedEstimateData,
  publisherInfo: {
    name: '홍길동',
    email: 'hong@example.com',
    phone: '010-1234-5678',
    companyName: '홍길동컴퍼니'
  }
});

// 4. PDF 다운로드
window.open(`/api/estimate/download/company001/${estimate.uuid}.pdf`);
```

---

### 시나리오 2: 회원 로그인 및 채팅 이어가기

```javascript
// 1. 구글 로그인 (초기화)
const initialResponse = await googleLoginInitial({
  providerId: googleUser.id,
  email: googleUser.email,
  name: googleUser.name,
  companyCode: 'company001'
});

if (initialResponse.data.needsUpdate) {
  // 2. 추가 정보 입력
  const updateResponse = await googleLoginUpdate({
    tempToken: initialResponse.data.tempToken,
    name: '홍길동',
    phone: '010-1234-5678',
    companyName: '홍길동컴퍼니',
    email: googleUser.email
  });
  
  localStorage.setItem('token', updateResponse.data.accessToken);
}

// 3. 비회원 세션 전환
if (previousSessionId) {
  await transferChatSession({
    sessionId: previousSessionId,
    userId: user._id
  });
}

// 4. 최신 채팅 로드
const latestSession = await getLatestChatSession(user._id);
const messages = await getSessionMessages(latestSession._id);
```

---

### 시나리오 3: 관리자 - 단가표 업로드

```javascript
// 1. 관리자 로그인
const loginResponse = await adminLogin({
  email: 'admin@company001.com',
  password: 'password123'
});

localStorage.setItem('admin_access_token', loginResponse.data.accessToken);

// 2. 엑셀 파일 업로드
const formData = new FormData();
formData.append('file', excelFile);
formData.append('companyCode', 'company001');

const uploadResponse = await fetch('/api/company/cms/unit-prices', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-company-code': 'company001'
  },
  body: formData
});

// 3. 단가표 조회
const unitPrices = await getUnitPrices('company001');
```

---

## 참고사항

### Rate Limiting
- 일반 API: 100 requests/min
- AI 채팅: 20 requests/min
- 파일 업로드: 10 requests/min

### 파일 업로드 제한
- 이미지: 10MB per file
- 문서: 20MB per file
- 엑셀: 5MB per file

### 페이지네이션 기본값
- page: 1
- limit: 10
- max limit: 100

---

**문서 버전**: 1.0.0  
**최종 수정일**: 2025-01-24
