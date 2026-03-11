# TaxEasy Global v3.0
## 해외 주식 양도소득세 자동 계산 플랫폼

---

## 📋 프로젝트 개요

TaxEasy Global은 한국 거주자들이 해외 주식 거래로 인한 양도소득세를 **자동으로 계산**하고, **홈택스 제출용 Excel 파일**을 생성하는 웹 애플리케이션입니다.

### 핵심 기능
- ✅ **증권사 자동 감지** — 한국투자증권, 키움증권 등 여러 증권사 PDF/Excel 자동 인식
- ✅ **다중 파일 업로드** — 여러 증권사의 파일을 한 번에 업로드 가능
- ✅ **취득일자 자동채움** — 양도일 연도의 1월 1일로 자동 입력 (또는 수동 입력)
- ✅ **양도소득세 자동 계산** — 22% 세율 적용, 250만원 기본공제
- ✅ **홈택스 신고 안내** — 5단계 신고 가이드 포함

---

## 📁 파일 구조

```
TaxEasy_Complete/
├── server_v3.py                      # 최종 백엔드 서버 (Python HTTP API)
├── index.html                        # 최종 프론트엔드 (3-스텝 UI)
├── parsers.py                        # 증권사별 파서 (자동 감지)
├── taxeasy_engine.py                 # 독립형 엔진 (스탠드얼론)
├── TaxEasy_Global_사업기획서.docx    # 사업 기획 문서
├── TaxEasy_Prototype.html            # 초기 프로토타입 (참고용)
├── test_e2e.py                       # E2E 테스트 스크립트
└── README.md                         # 이 파일
```

---

## 🚀 구동 방법

### 1️⃣ 전체 웹 앱 실행 (권장)

```bash
# 1. 서버 시작
python3 server_v3.py

# 2. 브라우저에서 열기
http://localhost:8080
```

**특징:**
- 브라우저 UI로 쉽게 사용
- 다중 파일 업로드 지원
- 취득일자 자동채움 옵션 제공
- 결과 Excel 직접 다운로드

---

### 2️⃣ 독립형 엔진 (스크립트)

한국투자증권 PDF를 파싱해서 바로 Excel 생성:

```bash
python3 taxeasy_engine.py
```

**특징:**
- 외부 의존성 최소화
- 코드 레벨에서 커스터마이징 가능
- 자동화 스크립트에 통합 가능

---

## 📊 데이터 흐름

```
PDF/Excel (증권사)
         ↓
  자동감지 파서
         ↓
  거래 데이터 추출
         ↓
  세금 계산
  (양도차익 - 기본공제) × 22%
         ↓
  홈택스 Excel 생성
         ↓
  다운로드 (홈택스 제출용)
```

---

## 💰 세금 계산 공식

```
양도차익 = 양도가액 - 취득가액 - 필요경비
과세표준 = max(0, 양도차익 - 250만원)
양도소득세 = 과세표준 × 22%
           = 국세(20%) + 지방세(2%)
```

---

## 🔧 기술 스택

| 항목 | 기술 |
|------|------|
| **Backend** | Python 3, http.server |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Excel** | openpyxl |
| **PDF** | pdfplumber |
| **API** | RESTful (JSON) |

---

## 📝 API 엔드포인트

### POST /api/upload
여러 파일 업로드 및 파싱
```json
Request: multipart/form-data (파일 여러 개)
Response: {
  "status": "success",
  "session_id": "a379dbd0c9c1",
  "trade_count": 19,
  "trades": [...],
  "tax": {
    "total_sell": 50611487,
    "total_buy": 42648866,
    "gross_profit_loss": 7883597,
    "taxable_income": 5383597,
    "tax_amount": 1184391
  }
}
```

### POST /api/upload-additional
기존 세션에 추가 파일 업로드
```json
Request: multipart/form-data + session_id
Response: 위와 동일
```

### POST /api/generate
홈택스 Excel 생성 및 다운로드
```json
Request: {
  "session_id": "a379dbd0c9c1",
  "auto_fill_buy_dates": true
}
Response: Binary Excel file
```

### GET /api/health
헬스 체크
```json
Response: {
  "status": "ok",
  "version": "3.0.0",
  "sessions": 1
}
```

---

## ✅ 검증 결과

**E2E 테스트 (최종 v3.0 통과)**
- [x] 증권사 자동감지 (한국투자증권 ✓)
- [x] 19건 거래 파싱
- [x] 참조 파일과 100% 금액 일치 (19/19건)
- [x] 세금 계산 정확성 (1,184,391원)
- [x] 취득일자 자동채움 ON/OFF 정상 동작
- [x] 다중 파일 업로드 지원
- [x] 홈택스 신고 안내 포함

---

## 📞 지원 증권사

- ✅ 한국투자증권 (PDF)
- ✅ 키움증권 (Excel)
- ✅ 미래에셋증권 (Excel)
- ✅ 삼성증권 (Excel)
- ✅ NH투자증권 (Excel)
- ✅ 토스증권 (Excel)
- ✅ 일반 Excel/CSV

---

## 🔒 보안 및 개인정보

- 모든 계산은 **로컬에서만** 수행
- 서버에 파일이 **저장되지 않음** (메모리만 사용)
- HTTPS 적용 권장 (프로덕션 배포시)

---

## 📌 주요 의존성

```
openpyxl==3.10.0+  (Excel 생성)
pdfplumber==0.9.0+  (PDF 파싱)
```

설치:
```bash
pip install openpyxl pdfplumber
```

---

## 🔄 향후 확장 사항

- [ ] 클라우드 배포 (AWS/Heroku)
- [ ] 모바일 앱
- [ ] 거래 편집 UI
- [ ] 다국어 지원 (영어, 중국어)
- [ ] API 토큰 인증
- [ ] 데이터베이스 연동 (히스토리 저장)

---

## 📄 라이선스

Private Project (개인 사용)

---

## 👨‍💻 개발자

Yohan (dldygks030521@gmail.com)

---

**Last Updated**: 2026-03-05
**Version**: 3.0.0
