# MongoDB 사용 가이드

## 📋 목차

- [설치](#설치)
- [접속](#접속)
- [쿼리 사용법](#쿼리-사용법)
  - [여기닷 상점 회원가입 유저 목록](#여기닷-상점-회원가입-유저-목록)
  - [여기닷 상담요청 접수 이력](#여기닷-상담요청-접수-이력)
  - [채팅 이력](#채팅-이력)
- [여기닷 프롬포트 수정](#여기닷-프롬포트-수정)

---

## 🚀 설치

MongoDB Compass GUI 클라이언트를 다운로드하여 설치해주세요.

**다운로드 링크:**

```
https://downloads.mongodb.com/compass/mongodb-compass-1.46.10-win32-x64.exe
```

---

## 🔗 접속

MongoDB Compass에서 연결할 때 다음 URL을 사용하세요:

```
mongodb://heredot:new123!%40%23@1.234.5.29:27017/
```

---

## 🔍 쿼리 사용법

### 여기닷 상점 회원가입 유저 목록

**단계:**

1. `aigo` 데이터베이스 선택
2. `users` 컬렉션 선택
3. 쿼리 작성 부분에 다음 조건 입력

**MongoDB Compass에서:**

```json
{ "usingService": "heredot" }
```

**MongoShell에서:**

```javascript
db.users.find({ usingService: 'heredot' });
```

---

### 여기닷 상담요청 접수 이력

**단계:**

1. `heredot` 데이터베이스 선택
2. `estimate_requests` 컬렉션 선택
3. `Aggregations` 탭으로 이동
4. 아래 파이프라인 작성

**MongoDB Compass Aggregations에서:**

```json
[
  {
    "$lookup": {
      "from": "chat_sessions",
      "localField": "chatSession",
      "foreignField": "_id",
      "as": "chatSessionInfo"
    }
  },
  {
    "$unwind": {
      "path": "$chatSessionInfo",
      "preserveNullAndEmptyArrays": true
    }
  },
  {
    "$project": {
      "title": 1,
      "estimateId": 1,
      "estimateFile": 1,
      "createAt": 1,
      "user.name": 1,
      "user.email": 1,
      "chatSession": 1,
      "chatSessionInfo.title": 1,
      "chatSessionInfo.isGuest": 1,
      "chatSessionInfo.createAt": 1
    }
  }
]
```

**MongoShell에서:**

```javascript
db.estimate_requests.aggregate([
  {
    $lookup: {
      from: 'chat_sessions',
      localField: 'chatSession',
      foreignField: '_id',
      as: 'chatSessionInfo',
    },
  },
  {
    $unwind: {
      path: '$chatSessionInfo',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $project: {
      title: 1,
      estimateId: 1,
      estimateFile: 1,
      createAt: 1,
      'user.name': 1,
      'user.email': 1,
      chatSession: 1,
      'chatSessionInfo.title': 1,
      'chatSessionInfo.isGuest': 1,
      'chatSessionInfo.createAt': 1,
    },
  },
]);
```

#### 📄 견적서 데이터 확인

조회된 데이터에서 `estimateId` 값을 찾은 후:

**단계:**

1. `aigo` 데이터베이스로 이동
2. `estimate_histories` 컬렉션 선택
3. 다음 쿼리 작성

```json
{ "_id": { "$in": ["찾고자하는_견적서_파일_id들"] } }
```

---

### 채팅 이력

**단계:**

1. `heredot` 데이터베이스 선택
2. `chat_sessions` 컬렉션 선택
3. `Aggregations` 탭으로 이동
4. 아래 파이프라인 작성

**MongoDB Compass Aggregations에서:**

```json
[
  {
    "$lookup": {
      "from": "chat_messages",
      "let": { "session_id": "$_id" },
      "pipeline": [{ "$match": { "$expr": { "$eq": ["$session", "$$session_id"] } } }, { "$sort": { "createAt": -1 } }],
      "as": "messages"
    }
  }
]
```

**MongoShell에서:**

```javascript
db.chat_sessions.aggregate([
  {
    $lookup: {
      from: 'chat_messages',
      let: { session_id: '$_id' },
      pipeline: [{ $match: { $expr: { $eq: ['$session', '$$session_id'] } } }, { $sort: { createAt: -1 } }],
      as: 'messages',
    },
  },
]);
```

---

## ⚙️ 여기닷 프롬포트 수정

**단계:**

1. `heredot` 데이터베이스 선택
2. `ai_prompts` 컬렉션 선택
3. 데이터의 `name` 필드를 확인하여 수정

**프롬포트 타입별 매핑:**

- `인삿말` → `GREETING`
- `핵심 지침서` → `INSTRUCTION`
- `기타` → `OTHER`

**수정 방법:**
`content` 필드에 원하는 데이터를 입력하시면 됩니다.
