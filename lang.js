'use strict';

// ===== 번역 사전 =====
const I18N = {
  ko: {
    // Nav
    'nav.home': '홈',
    'nav.privacy': '개인정보처리방침',
    'nav.terms': '이용약관',
    'nav.contact': '문의',
    'nav.contact.insta': '인스타그램 문의',

    // Hero
    'hero.chip': '무료 · 설치 불필요',
    'hero.title': '해외주식 양도소득세<br><em>자동 계산</em>',
    'hero.sub': '지원되는 증권사 거래내역 파일을 올리면 <strong>양도차익과 예상 세금을 계산</strong>합니다.<br>홈택스 신고용 엑셀 파일도 생성됩니다.',
    'hero.cta': '거래내역 파일 올리기',
    'hero.free': '원본 파일은 처리 후 삭제 · 계산 데이터는 최대 1시간 임시 보관',
    'hero.stat1.num': '3분',
    'hero.stat1.label': '평균 처리 시간',
    'hero.stat2.num': '22%',
    'hero.stat2.label': '세율 자동 적용',
    'hero.stat3.num': '250만원',
    'hero.stat3.label': '기본공제 자동 차감',

    // Steps nav
    'step.1': '파일 업로드',
    'step.2': '세금 확인',
    'step.3': '엑셀 다운로드',

    // Step 1
    'step1.card.title': '거래내역 파일 업로드',
    'step1.label': '증권사에서 발급받은 해외주식 양도소득 자료를 업로드하세요.',
    'step1.formats': '증권사별 지원 형식·발급 방법 보기',
    'step1.zone.title': '파일을 드래그하거나 클릭하여 업로드',
    'step1.zone.sub': '증권사별 지원 형식 확인 · 여러 파일 동시 업로드 가능',
    'step1.analyze': '파일 분석 및 세금 계산',

    // Processing
    'processing.title': '파일 분석 중...',
    'processing.sub': '거래내역을 파싱하고 세금을 계산하고 있습니다',

    // Step 2 — Metrics
    'step2.card.title': '세금 계산 결과',
    'metric.pl': '총 양도차익',
    'metric.pl.sub': '매도 − 매수 − 수수료',
    'metric.ded': '기본공제',
    'metric.ded.sub': '연간 일괄 공제',
    'metric.taxable': '과세표준',
    'metric.taxable.sub': '양도차익 − 기본공제',
    'metric.tax': '예상 세금 (22%)',
    'metric.tax.sub': '국세 20% + 지방세 2%',

    'trade.count': '총 거래건수',
    'trade.profit': '이익 거래',
    'trade.loss': '손실 거래',

    'breakdown.title': '계산 상세',
    'breakdown.sell': '총 양도가액 (매도금액)',
    'breakdown.buy': '총 취득가액 (매수금액)',
    'breakdown.exp': '필요경비 (수수료)',
    'breakdown.ded': '기본공제 차감',
    'breakdown.total': '최종 납부세액',

    'taxsplit.national': '국세 (소득세 20%)',
    'taxsplit.local': '지방세 (지방소득세 2%)',

    'trades.details': '거래내역 상세 보기',
    'th.name': '종목명',
    'th.qty': '수량',
    'th.date': '양도일',
    'th.sell': '양도가액',
    'th.buy': '취득가액',
    'th.exp': '경비',
    'th.pnl': '손익',

    'btn.addmore': '+ 파일 추가 업로드',

    // Step 3
    'step3.card.title': '홈택스 신고용 엑셀 다운로드',
    'step3.explain': '아래 버튼으로 다운로드한 엑셀 파일을 홈택스에서 <strong>직접 업로드</strong>하면 거래내역이 자동으로 입력됩니다.',
    'step3.toggle.label': '취득일자 자동 채움',
    'step3.toggle.desc': '체크 시: 양도일 연도 1월 1일을 임시 취득일자로 입력합니다 (예: 양도일 2024-12-31 → 2024-01-01). 실제 매수일이 아닐 수 있으므로 신고 전에 반드시 확인하고 수정하세요.<br><strong style="color:var(--text);">해제 시:</strong> 취득일자가 비어 있으므로 엑셀에서 직접 입력해야 합니다.',
    'step3.caveat': '<strong>자동 입력 날짜는 실제 매수일이 아닙니다.</strong> 기본값은 양도 연도의 1월 1일을 임시 입력합니다. 실제 취득일을 확인해 엑셀에서 수정하세요. 체크를 해제하면 날짜가 비어 있으므로 직접 입력해야 합니다.',
    'result.caveat': '<strong>신고 전 확인</strong> 계산은 업로드 자료에 기록된 원화 금액과 비용을 사용합니다. 종목별 양도·취득 금액, 수수료와 환율 환산액이 원본 내역과 일치하는지 확인하세요. 누락된 거래나 환율을 자동으로 복원하지 않습니다. 결과는 참고용이며 홈택스 신고 내용과 대조해야 합니다.',
    'step3.download': '홈택스 신고용 Excel 다운로드',
    'step3.share': '결과 공유하기',
    'step3.reset': '새 파일로 다시 계산하기',

    // Guide
    'guide.card.title': '홈택스 신고 방법 (4단계)',
    'guide.1.title': '홈택스 접속 및 로그인',
    'guide.1.desc': '<a href="https://www.hometax.go.kr" target="_blank" rel="noopener noreferrer">hometax.go.kr</a> 접속 → 공동·금융인증서로 로그인 → <strong>세금신고 → 양도소득세 → 확정신고</strong>',
    'guide.2.title': '양도소득세 신고 선택',
    'guide.2.desc': '신고서 작성 화면에서 <strong>"주식 등"</strong> 탭 선택 → 양도소득금액 계산 영역 이동',
    'guide.3.title': '생성된 엑셀 파일 업로드',
    'guide.3.desc': '<strong>"엑셀 업로드"</strong> 버튼 클릭 → 다운로드한 Excel 파일 선택 → 거래내역 자동 입력됨',
    'guide.4.title': '내용 확인 후 신고서 제출',
    'guide.4.desc': '업로드된 내용, 특히 <strong>취득일자</strong>를 반드시 확인 → 확인 후 신고서 제출 → 국세·지방세 별도 납부',
    'guide.tip': '<strong>신고 기한:</strong> 매년 <strong>5월 1일 ~ 5월 31일</strong> (전년도 거래분). 기한 미신고 시 가산세 부과.<br><strong>기본공제:</strong> 양도차익 250만원 이하는 납부세액 없음. 단, 신고는 해야 합니다.<br><strong>기한 후 신고의 경우,</strong> 홈택스에서 <strong>\'기한후신고\'</strong> 메뉴를 선택하세요.',

    // Penalty
    'penalty.label': '기한 후 신고',
    'penalty.title': '가산세 계산',
    'penalty.sub': '5월 31일 신고 기한을 넘겼다면 예상 가산세를 미리 계산해보세요. 파일 업로드 시 세금이 자동으로 채워집니다.',
    'penalty.tax.label': '납부세액 (원)',
    'penalty.tax.placeholder': '예: 1650000',
    'penalty.tax.hint': '파일 업로드 후 자동으로 채워집니다',
    'penalty.deadline.label': '신고 기한일',
    'penalty.deadline.hint': '기본값: 전년도 귀속 다음 해 5월 31일',
    'penalty.filedate.label': '신고 예정일 (또는 오늘)',
    'penalty.filedate.hint': '기본값: 오늘 날짜',
    'penalty.btn': '가산세 계산하기',
    'penalty.original': '원래 납부세액',
    'penalty.nonfiling': '무신고 가산세',
    'penalty.latepay': '납부불성실 가산세',
    'penalty.total': '총 납부 예상액',
    'penalty.total.sub': '(원래 세금 + 무신고 가산세 + 납부불성실 가산세)',
    'penalty.breakdown.title': '가산세 계산 상세',
    'penalty.notice': '이 가산세 계산은 <strong>일반 무신고</strong> 기준 참고용입니다. 부정무신고(40%), 감면 특례 등은 반영되지 않았습니다. 정확한 가산세는 세무서 또는 세무사에게 확인하세요.',

    // Simulator
    'sim.label': '절세 전략',
    'sim.title': '절세 시뮬레이션',
    'sim.sub': '12월 31일 전에 손실 종목을 매도하면 세금이 얼마나 줄어드는지 계산해보세요.',
    'sim.gain.label': '올해 실현 양도차익 (원)',
    'sim.gain.placeholder': '예: 10000000',
    'sim.gain.hint': '파일 업로드 후 자동으로 채워집니다',
    'sim.loss.label': '매도 예정 손실액 (원)',
    'sim.loss.placeholder': '예: 3000000',
    'sim.loss.hint': '보유 중인 손실 종목의 예상 손실 금액',
    'sim.btn': '절세액 계산하기',
    'sim.before': '현재 예상 세금',
    'sim.after': '매도 후 예상 세금',
    'sim.saving': '절세 효과',
    'sim.note': '이미 신고 기한이 지났다면 위 세금 계산 결과에서 가산세도 함께 확인하세요.',

    // Trust
    'trust.title': '개인정보 보호 · 안전한 서비스',
    'trust.1.title': '처리 위치를 안내합니다',
    'trust.1.desc': '서버 연결 시 파일은 계산 서버로 전송되어 처리됩니다. 서버를 사용할 수 없으면 브라우저에서 처리합니다.',
    'trust.2.title': '원본 파일과 계산 데이터',
    'trust.2.desc': '서버 처리 시 원본 파일은 파싱 후 삭제됩니다. Excel 생성용 거래 데이터는 서버 메모리에 최대 1시간 보관된 뒤 자동 정리됩니다.',
    'trust.3.title': '외부 서비스와 개인정보',
    'trust.3.desc': '세금 계산에 회원가입은 필요하지 않습니다. 광고와 방문 통계는 각 제공자의 정책에 따라 처리될 수 있습니다. 자세한 내용은 <a href="privacy.html">개인정보처리방침</a>에서 확인하세요.',

    // Who
    'who.label': '이런 분들을 위해',
    'who.title': '혹시 이런 상황이신가요?',
    'who.sub': '해외주식 세금 신고, 생각보다 어렵지 않아요. 양도세이브가 도와드립니다.',
    'who.1.title': '5월 양도소득세 신고를 놓쳤어요',
    'who.1.desc': '매년 5월이 양도소득세 신고 기간인데 깜빡하거나 바빠서 놓치셨나요? <strong>기한 후 신고</strong>로 지금이라도 신고하면 가산세를 크게 줄일 수 있습니다.',
    'who.1.tag': '기한 후 신고 가능',
    'who.2.title': '증권사 대행 신청 기간을 놓쳤어요',
    'who.2.desc': '증권사는 보통 1~2월에 양도소득세 대행 신청을 받습니다. 놓쳤다면 직접 셀프 신고를 해야 하는데, 양도세이브가 <strong>홈택스 업로드용 엑셀을 자동으로</strong> 만들어 드립니다.',
    'who.2.tag': '셀프 신고 지원',
    'who.3.title': '거래가 많아 직접 계산이 어려워요',
    'who.3.desc': '수십~수백 건의 거래를 일일이 계산하는 건 거의 불가능합니다. 증권사 파일을 업로드하면 <strong>모든 거래를 자동으로 합산</strong>해 정확한 세금을 계산합니다.',
    'who.3.tag': '자동 합산 계산',

    // How it works
    'how.label': '사용 방법',
    'how.title': '4단계로 끝나는 세금 계산',
    'how.sub': '복잡한 세금 계산을 파일 업로드 하나로 해결하세요.',
    'how.1.title': '거래내역 다운로드',
    'how.1.desc': '증권사에서 해외주식 양도소득 자료를 받으세요. PDF는 증권사별 지원 형식을 확인하고, Excel·CSV는 거래 금액 열이 포함된 자료를 준비합니다.',
    'how.2.title': '파일 업로드',
    'how.2.desc': '양도세이브에 파일을 드래그&드롭하거나 클릭해서 업로드합니다.',
    'how.3.title': '세금 자동 계산',
    'how.3.desc': '기본공제 250만원 차감 후 22% 세율로 납부세액을 자동 계산합니다.',
    'how.4.title': '홈택스 엑셀 다운로드',
    'how.4.desc': '홈택스 업로드 규격에 맞는 엑셀 파일을 생성해 바로 신고에 사용합니다.',

    // Formula
    'formula.label': '세금 계산 공식',
    'formula.title': '해외주식 양도소득세 계산법',
    'formula.text': '납부세액 = (양도차익 − 250만원) × 22%',
    'formula.detail': '· 양도차익 = 매도금액 − 취득금액 − 필요경비<br>· 국세 20% + 지방소득세 2% = 합산 22%<br><br><strong>예시:</strong> 양도차익 1,000만원<br>→ (1,000만 − 250만) × 22% = <strong style="color:#34D399;">165만원</strong>',
    'broker.label': '지원 증권사',
    'broker.title': '증권사별 지원 형식을 확인하세요',
    'broker.note': '신고 기간: 매년 <strong style="color:var(--text);">5월 1일 ~ 5월 31일</strong><br>전년도 거래분 합산 신고',
    'broker.formats.note': '* 표시된 PDF는 증권사별 문서 레이아웃에 따라 처리 결과가 다를 수 있습니다. 현재 실제 PDF 형식을 확인한 것은 한국투자증권입니다. Excel·CSV는 종목명, 수량, 양도가액, 취득가액 등 거래 열을 포함한 파일을 사용하세요. 필요한 값이 빠지면 계산 결과가 달라질 수 있습니다.',
    'broker.guide.title': '증권사별 거래내역 받는 방법',
    'broker.guide.intro': '아래 명세서를 발급해 업로드하세요. PDF는 증권사별 문서 형식에 따라 지원 여부가 다르며, 앱이나 HTS 업데이트에 따라 메뉴 이름은 달라질 수 있습니다.',
    'broker.guide.open': '발급 메뉴 안내',
    'broker.guide.ki': '홈페이지 고객서비스 → 증명서 발급 → 해외주식 양도소득세 자료 조회/발급 → 계좌와 귀속연도를 선택해 조회 후 PDF로 저장',
    'broker.guide.kiwoom': '영웅문S# 또는 HTS 메뉴 검색에서 ‘해외주식 양도소득세’ 또는 ‘양도소득 과세자료’를 검색하세요. 귀속연도 조회 후 PDF로 저장합니다.',
    'broker.guide.mirae': '홈페이지 서비스 신청/관리 → 증명서 발급/조회 → 해외주식 양도소득세에서 귀속연도 내역을 조회하고 PDF로 저장',
    'broker.guide.samsung': '홈페이지 트레이딩 → 해외주식 → 해외주식양도세조회에서 계좌와 기준연도를 선택해 조회한 뒤 인쇄/PDF로 저장',
    'broker.guide.nh': '나무 앱 또는 QV HTS 메뉴 검색에서 ‘해외주식 양도소득세’ 자료를 찾아 귀속연도 내역을 조회하고 PDF로 저장하세요.',
    'broker.guide.shinhan': '앱/HTS에서 해외주식 양도소득세 메뉴를 검색해 귀속연도 자료를 조회하고 Excel 파일로 내려받으세요.',

    // FAQ
    'faq.label': 'FAQ',
    'faq.title': '자주 묻는 질문',
    'faq.sub': '궁금한 점이 있으면 확인해보세요.',
    'faq.q1': '해외주식 양도소득세란 무엇인가요?',
    'faq.a1': '해외주식 양도소득세는 해외 주식을 매도하여 발생한 양도차익(매도금액 − 취득금액 − 필요경비)에 부과되는 세금입니다. 연간 양도차익에서 기본공제 250만원을 차감한 과세표준에 22%(국세 20% + 지방세 2%)를 적용합니다. 매년 5월 양도소득세 신고 기간에 홈택스에서 신고납부해야 합니다.',
    'faq.q2': '해외주식 세금을 얼마나 내나요?',
    'faq.a2': '양도차익이 250만원 이하면 세금이 없습니다. 250만원을 초과하는 금액의 22%가 납부세액입니다. 예시: 양도차익 500만원 → (500만 − 250만) × 22% = 55만원. 양도차익 1,000만원 → (1,000만 − 250만) × 22% = 165만원.',
    'faq.q3': '해외주식 세금 신고는 언제 하나요?',
    'faq.a3': '해외주식 양도소득세 신고는 매년 5월 1일~31일에 <a href="https://www.hometax.go.kr" target="_blank" rel="noopener noreferrer">홈택스(hometax.go.kr)</a>에서 진행합니다. 전년도 1월 1일~12월 31일 거래를 합산하여 신고합니다. 신고·납부를 놓치면 가산세가 부과될 수 있습니다.',
    'faq.q4': '미국주식·ETF도 세금 계산이 되나요?',
    'faq.a4': '네, 미국주식, 미국 ETF를 포함한 모든 해외주식의 양도소득세를 계산할 수 있습니다. 국가 코드(US 등)가 홈택스 신고용 엑셀에 자동 입력됩니다.',
    'faq.q5': '손실이 나도 신고해야 하나요?',
    'faq.a5': '연간 양도차익이 250만원 이하이거나 손실인 경우 신고 의무는 없습니다. 단, 여러 종목 간 손익을 통산할 수 있으므로 이익 종목과 손실 종목이 섞여 있다면 반드시 합산하여 계산해야 합니다.',
    'faq.q6': '업로드한 파일이 외부에 저장되나요?',
    'faq.a6': '서버 처리 시 원본 파일은 파싱 후 삭제되며, 계산용 거래 데이터는 Excel 생성을 위해 서버 메모리에 최대 1시간 보관된 뒤 자동 정리됩니다. 서버를 사용할 수 없어 브라우저 처리로 전환되면 파일 내용은 계산 서버로 전송되지 않습니다. 광고·방문 통계 등 제3자 서비스 정보는 개인정보처리방침을 확인하세요.',
    'faq.q7': '5월 신고 기한을 놓쳤으면 어떻게 하나요?',
    'faq.a7': '기한 후 신고를 하면 됩니다. 신고하지 않은 것보다 기한 후라도 신고하면 가산세를 크게 줄일 수 있습니다. 양도세이브로 세금을 계산한 후, 홈택스에서 기한 후 신고를 진행하세요.',
    'faq.q8': '기한 후 신고하면 가산세가 얼마나 나오나요?',
    'faq.a8': '기한 후 신고 시 두 가지 가산세가 부과됩니다. ① <strong>무신고 가산세</strong>: 납부세액의 20% (1개월 이내 자진신고 시 50% 감면, 3개월 이내 30% 감면, 6개월 이내 20% 감면). ② <strong>납부불성실 가산세</strong>: 미납세액 × 경과일수 × 0.022% (1일당). 예: 세금 165만원을 3개월 늦게 신고하면 무신고 가산세 약 23.1만원 + 납부불성실 가산세 약 3.3만원 = 약 26.4만원의 추가 부담이 발생합니다.',
    'faq.q9': '증권사 양도소득세 대행을 놓쳤으면?',
    'faq.a9': '증권사 대행 신청 기간(보통 1~2월)을 놓쳤다면 홈택스에서 직접 셀프 신고를 해야 합니다. 양도세이브에서 거래내역을 업로드하면 홈택스 업로드용 엑셀을 자동으로 생성해 드리니, 어렵지 않게 셀프 신고를 완료할 수 있습니다.',

    // Footer
    'footer.disclaimer': '이 서비스는 참고용이며, 최종 신고는 홈택스에서 직접 확인하시기 바랍니다.<br>세금 계산 결과는 법적 효력이 없으며, 정확한 세금은 세무사와 상담하세요.',
    'footer.home': '홈',
    'footer.privacy': '개인정보처리방침',
    'footer.terms': '이용약관',
  },

  en: {
    // Nav
    'nav.home': 'Home',
    'nav.privacy': 'Privacy Policy',
    'nav.terms': 'Terms of Use',
    'nav.contact': 'Contact',
    'nav.contact.insta': 'Instagram',

    // Hero
    'hero.chip': 'Free · No Installation Required',
    'hero.title': 'Overseas Stock<br><em>Capital Gains Tax Calculator</em>',
    'hero.sub': 'Upload a supported brokerage statement to <strong>calculate capital gains and estimated tax</strong>.<br>Generate an Excel file for Hometax filing.',
    'hero.cta': 'Upload Trade Statement',
    'hero.free': 'Original files deleted after parsing · Calculation data held up to 1 hour',
    'hero.stat1.num': '3 min',
    'hero.stat1.label': 'Avg. Processing Time',
    'hero.stat2.num': '22%',
    'hero.stat2.label': 'Tax Rate Auto-Applied',
    'hero.stat3.num': '₩2.5M',
    'hero.stat3.label': 'Basic Deduction Auto-Applied',

    // Steps nav
    'step.1': 'Upload File',
    'step.2': 'Check Tax',
    'step.3': 'Download Excel',

    // Step 1
    'step1.card.title': 'Upload Trade History File',
    'step1.label': 'Upload an overseas stock capital gains statement issued by your broker.',
    'step1.formats': 'Check formats and download instructions by broker',
    'step1.zone.title': 'Drag & drop or click to upload',
    'step1.zone.sub': 'Check formats by broker · Multiple files allowed',
    'step1.analyze': 'Analyze Files & Calculate Tax',

    // Processing
    'processing.title': 'Analyzing files...',
    'processing.sub': 'Parsing trade history and calculating tax',

    // Step 2 — Metrics
    'step2.card.title': 'Tax Calculation Result',
    'metric.pl': 'Total Capital Gain',
    'metric.pl.sub': 'Sell − Buy − Fees',
    'metric.ded': 'Basic Deduction',
    'metric.ded.sub': 'Annual flat deduction',
    'metric.taxable': 'Taxable Amount',
    'metric.taxable.sub': 'Gain − Basic Deduction',
    'metric.tax': 'Estimated Tax (22%)',
    'metric.tax.sub': 'National 20% + Local 2%',

    'trade.count': 'Total Trades',
    'trade.profit': 'Profitable',
    'trade.loss': 'Loss',

    'breakdown.title': 'Calculation Details',
    'breakdown.sell': 'Total Proceeds (Sell Amount)',
    'breakdown.buy': 'Total Cost Basis (Buy Amount)',
    'breakdown.exp': 'Expenses (Fees)',
    'breakdown.ded': 'Basic Deduction',
    'breakdown.total': 'Total Tax Due',

    'taxsplit.national': 'National Tax (Income Tax 20%)',
    'taxsplit.local': 'Local Tax (Local Income Tax 2%)',

    'trades.details': 'View Trade Details',
    'th.name': 'Stock',
    'th.qty': 'Qty',
    'th.date': 'Sell Date',
    'th.sell': 'Proceeds',
    'th.buy': 'Cost Basis',
    'th.exp': 'Fees',
    'th.pnl': 'P&L',

    'btn.addmore': '+ Upload More Files',

    // Step 3
    'step3.card.title': 'Download Excel for Hometax',
    'step3.explain': 'Upload the downloaded Excel file directly to Hometax to <strong>auto-fill your trade history</strong>.',
    'step3.toggle.label': 'Auto-fill acquisition date',
    'step3.toggle.desc': 'Checked: Jan 1 of the sale year is inserted as a placeholder (e.g. sale 2024-12-31 → 2024-01-01). This may not be the actual purchase date; verify and correct it before filing.<br><strong style="color:var(--text);">Unchecked:</strong> The date is left blank for you to enter in Excel.',
    'step3.caveat': '<strong>The inserted date may not be the actual purchase date.</strong> The default inserts Jan 1 of the sale year as a placeholder. Verify the actual acquisition date and correct it in Excel. If unchecked, enter the date yourself.',
    'result.caveat': '<strong>Review before filing.</strong> The calculation uses amounts and expenses recorded in the uploaded statement. Check proceeds, cost basis, fees, and currency conversions against the original. Missing trades or exchange rates are not reconstructed. This is an estimate; verify the figures in Hometax.',
    'step3.download': 'Download Hometax Excel',
    'step3.share': 'Share Result',
    'step3.reset': 'Start Over with New File',

    // Guide
    'guide.card.title': 'How to File on Hometax (4 Steps)',
    'guide.1.title': 'Access & Login to Hometax',
    'guide.1.desc': 'Go to <a href="https://www.hometax.go.kr" target="_blank" rel="noopener noreferrer">hometax.go.kr</a> → Login with certificate → <strong>Tax Filing → Capital Gains Tax → Final Return</strong>',
    'guide.2.title': 'Select Capital Gains Filing',
    'guide.2.desc': 'In the return form, select the <strong>"Stocks, etc."</strong> tab → Go to the capital gains calculation section',
    'guide.3.title': 'Upload the Excel File',
    'guide.3.desc': 'Click <strong>"Excel Upload"</strong> → Select the downloaded Excel file → Trade history is auto-populated',
    'guide.4.title': 'Review & Submit Return',
    'guide.4.desc': 'Verify the uploaded data, especially the <strong>acquisition date</strong> → Submit the return → Pay national and local tax separately',
    'guide.tip': '<strong>Filing deadline:</strong> <strong>May 1–31</strong> each year (for prior year trades). Late filing incurs penalties.<br><strong>Basic deduction:</strong> No tax if gains ≤ ₩2.5M. Filing is still required.<br><strong>For late filing,</strong> select the <strong>"Late Filing"</strong> menu on Hometax.',

    // Penalty
    'penalty.label': 'Late Filing',
    'penalty.title': 'Penalty Calculator',
    'penalty.sub': 'Estimate your late filing penalties if you missed the May 31st deadline. The tax amount is auto-filled after file upload.',
    'penalty.tax.label': 'Tax Amount (KRW)',
    'penalty.tax.placeholder': 'e.g. 1650000',
    'penalty.tax.hint': 'Auto-filled after file upload',
    'penalty.deadline.label': 'Filing Deadline',
    'penalty.deadline.hint': 'Default: May 31st of the following year',
    'penalty.filedate.label': 'Planned Filing Date (or Today)',
    'penalty.filedate.hint': 'Default: Today\'s date',
    'penalty.btn': 'Calculate Penalties',
    'penalty.original': 'Original Tax',
    'penalty.nonfiling': 'Non-filing Penalty',
    'penalty.latepay': 'Late Payment Penalty',
    'penalty.total': 'Total Estimated Payment',
    'penalty.total.sub': '(Original Tax + Non-filing Penalty + Late Payment Penalty)',
    'penalty.breakdown.title': 'Penalty Breakdown',
    'penalty.notice': 'This estimate is based on <strong>general non-filing</strong> scenarios for reference only. Fraud penalties (40%) and reduction exceptions are not included. Confirm exact amounts with a tax office or accountant.',

    // Simulator
    'sim.label': 'Tax Strategy',
    'sim.title': 'Tax Saving Simulator',
    'sim.sub': 'Calculate how much tax you can save by selling loss positions before Dec 31.',
    'sim.gain.label': 'Realized Gain This Year (KRW)',
    'sim.gain.placeholder': 'e.g. 10000000',
    'sim.gain.hint': 'Auto-filled after file upload',
    'sim.loss.label': 'Planned Loss Harvest Amount (KRW)',
    'sim.loss.placeholder': 'e.g. 3000000',
    'sim.loss.hint': 'Estimated loss from holdings you plan to sell',
    'sim.btn': 'Calculate Tax Savings',
    'sim.before': 'Current Estimated Tax',
    'sim.after': 'Tax After Harvesting',
    'sim.saving': 'Tax Savings',
    'sim.note': 'If the filing deadline has passed, also check the penalty calculator above.',

    // Trust
    'trust.title': 'Privacy & Security',
    'trust.1.title': 'Where processing happens',
    'trust.1.desc': 'When the server is available, files are sent to it for processing. If it is unavailable, processing falls back to your browser.',
    'trust.2.title': 'Original files and calculation data',
    'trust.2.desc': 'In server mode, the original file is deleted after parsing. Trade data for Excel generation stays in server memory for up to one hour, then is cleared automatically.',
    'trust.3.title': 'Third-party services and privacy',
    'trust.3.desc': 'Tax calculation does not require an account. Advertising and visit analytics may be processed under each provider’s policies. See the <a href="privacy.html">Privacy Policy</a>.',

    // Who
    'who.label': 'Who It\'s For',
    'who.title': 'Does this sound familiar?',
    'who.sub': 'Filing overseas stock taxes is easier than you think. YangdoSave has you covered.',
    'who.1.title': 'Missed the May Capital Gains Filing',
    'who.1.desc': 'Did you forget or miss the annual May filing deadline? <strong>Late filing</strong> can still significantly reduce your penalties.',
    'who.1.tag': 'Late Filing Available',
    'who.2.title': 'Missed Broker-Assisted Filing',
    'who.2.desc': 'Brokers typically accept delegated filing requests in Jan–Feb. If you missed it, you\'ll need to self-file. YangdoSave <strong>automatically generates the Hometax-ready Excel</strong> for you.',
    'who.2.tag': 'Self-Filing Support',
    'who.3.title': 'Too Many Trades to Calculate Manually',
    'who.3.desc': 'Calculating dozens or hundreds of trades by hand is nearly impossible. Upload your broker file to <strong>automatically aggregate all trades</strong> for an accurate tax result.',
    'who.3.tag': 'Auto Aggregation',

    // How it works
    'how.label': 'How It Works',
    'how.title': 'Done in 4 Simple Steps',
    'how.sub': 'Solve complex tax calculations with just one file upload.',
    'how.1.title': 'Download Trade History',
    'how.1.desc': 'Download an overseas stock capital gains statement from your broker. Check PDF support by broker, and use spreadsheet exports that include transaction amounts.',
    'how.2.title': 'Upload File',
    'how.2.desc': 'Drag & drop or click to upload your file to YangdoSave.',
    'how.3.title': 'Auto Tax Calculation',
    'how.3.desc': 'Automatically deducts ₩2.5M basic deduction and applies the 22% tax rate.',
    'how.4.title': 'Download Hometax Excel',
    'how.4.desc': 'Generates an Excel file in Hometax upload format, ready for immediate filing.',

    // Formula
    'formula.label': 'Tax Formula',
    'formula.title': 'Overseas Stock Capital Gains Tax',
    'formula.text': 'Tax = (Capital Gain − ₩2.5M) × 22%',
    'formula.detail': '· Capital Gain = Sell Amount − Cost Basis − Expenses<br>· National Tax 20% + Local Tax 2% = 22% total<br><br><strong>Example:</strong> Gain of ₩10M<br>→ (₩10M − ₩2.5M) × 22% = <strong style="color:#34D399;">₩1.65M</strong>',
    'broker.label': 'Supported Brokers',
    'broker.title': 'Check file support by broker',
    'broker.note': 'Filing period: <strong style="color:var(--text);">May 1–31</strong> each year<br>Combined filing for all prior-year trades',
    'broker.formats.note': '* PDF support depends on the broker statement layout. The Korea Investment PDF format is the only one confirmed against an actual sample so far. Excel/CSV files should include trade columns such as stock name, quantity, proceeds, and cost basis. Missing values may change the result.',
    'broker.guide.title': 'How to download statements by broker',
    'broker.guide.intro': 'Download the statement below and upload it. PDF support depends on the statement layout; menu names may change after app or HTS updates.',
    'broker.guide.open': 'View download instructions',
    'broker.guide.ki': 'Website: Customer Service → Certificate Issuance → Overseas Stock Capital Gains Tax Statement. Select account and tax year, view, then save as PDF.',
    'broker.guide.kiwoom': 'In Hero S# or HTS, search menus for “overseas stock capital gains tax” or “capital gains tax data.” Select the tax year and save the statement as PDF.',
    'broker.guide.mirae': 'Website: Service Application/Management → Certificate Issuance/Lookup → Overseas Stock Capital Gains Tax. Select the tax year and save as PDF.',
    'broker.guide.samsung': 'Website: Trading → Overseas Stocks → Overseas Stock Capital Gains Tax Lookup. Select account and tax year, then print/save as PDF.',
    'broker.guide.nh': 'In the Namuh app or QV HTS, search menus for overseas stock capital gains tax. Select the tax year and save the statement as PDF.',
    'broker.guide.shinhan': 'Search the app/HTS for overseas stock capital gains tax, select the tax year, and export the statement as Excel.',

    // FAQ
    'faq.label': 'FAQ',
    'faq.title': 'Frequently Asked Questions',
    'faq.sub': 'Find answers to common questions.',
    'faq.q1': 'What is Overseas Stock Capital Gains Tax?',
    'faq.a1': 'The overseas stock capital gains tax is levied on gains (Sell Amount − Cost Basis − Expenses) from selling overseas stocks. A 22% rate (National 20% + Local 2%) applies to the taxable base after subtracting the annual ₩2.5M basic deduction. You must file on Hometax each May.',
    'faq.q2': 'How much tax do I pay on overseas stocks?',
    'faq.a2': 'No tax is owed if your gains are ₩2.5M or less. Above that, 22% applies to the excess. Example: ₩5M gain → (₩5M − ₩2.5M) × 22% = ₩550,000. ₩10M gain → (₩10M − ₩2.5M) × 22% = ₩1,650,000.',
    'faq.q3': 'When do I file overseas stock taxes?',
    'faq.a3': 'File on <a href="https://www.hometax.go.kr" target="_blank" rel="noopener noreferrer">Hometax (hometax.go.kr)</a> between May 1–31 each year for the prior calendar year\'s trades. Missing the deadline results in penalties.',
    'faq.q4': 'Does it work for US stocks and ETFs?',
    'faq.a4': 'Yes. It calculates capital gains tax for all overseas stocks including US stocks and US ETFs. The country code (e.g. US) is automatically entered in the Hometax Excel.',
    'faq.q5': 'Do I need to file if I have a net loss?',
    'faq.a5': 'Filing is not mandatory if your annual gains are ₩2.5M or less, or if you have a net loss. However, if you have a mix of gains and losses across stocks, you must aggregate them all.',
    'faq.q6': 'Are my uploaded files stored externally?',
    'faq.a6': 'In server mode, the original file is deleted after parsing and calculation data stays in server memory for up to one hour for Excel generation, then is cleared automatically. If processing falls back to your browser, file contents are not sent to the calculation server. See the Privacy Policy for advertising and visit analytics.',
    'faq.q7': 'What if I missed the May deadline?',
    'faq.a7': 'You can still file a late return. Filing late is far better than not filing at all — it significantly reduces your penalties. Calculate your tax with YangdoSave, then file a late return on Hometax.',
    'faq.q8': 'How much are late filing penalties?',
    'faq.a8': 'Two penalties apply: ① <strong>Non-filing penalty:</strong> 20% of tax due (reduced by 50% if filed within 1 month, 30% within 3 months, 20% within 6 months). ② <strong>Late payment penalty:</strong> Unpaid tax × days elapsed × 0.022%/day. Example: ₩1.65M tax filed 3 months late → ~₩231K non-filing + ~₩33K late payment = ~₩264K extra.',
    'faq.q9': 'What if I missed broker-assisted filing?',
    'faq.a9': 'Brokers typically accept delegated filing in Jan–Feb. If you missed it, you must self-file on Hometax. Upload your trade history to YangdoSave and we\'ll generate the Hometax-ready Excel — making self-filing straightforward.',

    // Footer
    'footer.disclaimer': 'This service is for reference only. Always verify your final filing directly on Hometax.<br>Tax results have no legal effect. Consult a tax professional for accurate figures.',
    'footer.home': 'Home',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Use',
  }
};

// ===== 언어 상태 =====
let _currentLang = (function() {
  try { return localStorage.getItem('lang') || 'ko'; } catch(_) { return 'ko'; }
})();

// ===== 언어 적용 =====
function applyLang() {
  const t = I18N[_currentLang] || I18N.ko;

  // textContent
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.textContent = t[key];
  });

  // innerHTML
  document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-html');
    if (t[key] !== undefined) el.innerHTML = t[key];
  });

  // placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-placeholder');
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  // html lang
  document.documentElement.lang = _currentLang === 'en' ? 'en' : 'ko';

  // 토글 버튼 상태 (데스크탑 + 모바일)
  ['langKO', 'langKO_m'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.toggle('active', _currentLang === 'ko');
  });
  ['langEN', 'langEN_m'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.toggle('active', _currentLang === 'en');
  });

  // 배너 텍스트 (JS로 동적 생성되므로 재적용)
  _updateBanner();
}

function _updateBanner() {
  var t = I18N[_currentLang] || I18N.ko;
  var m = new Date().getMonth() + 1;
  var t1 = document.getElementById('bannerText1');
  if (!t1) return;

  if (_currentLang === 'en') {
    if (m >= 1 && m <= 4) {
      t1.innerHTML = '<strong>The May capital gains filing deadline is approaching!</strong><span> — Calculate your taxes now</span>';
    } else if (m === 5) {
      t1.innerHTML = '<strong>⏰ Deadline alert! Due by May 31.</strong><span> — File now</span>';
    } else {
      t1.innerHTML = '<strong>Missed the May capital gains deadline?</strong><span> — Late filing can still significantly reduce your penalties</span>';
    }
  } else {
    if (m >= 1 && m <= 4) {
      t1.innerHTML = '<strong>5월 양도소득세 신고 기한이 다가옵니다!</strong><span> — 지금 미리 세금을 계산해두세요</span>';
    } else if (m === 5) {
      t1.innerHTML = '<strong>⏰ 신고 기한 마감! 5월 31일까지입니다.</strong><span> — 지금 바로 신고하세요</span>';
    } else {
      t1.innerHTML = '<strong>5월 양도소득세 신고를 놓치셨나요?</strong><span> — 기한 후 신고로 지금도 가산세를 줄일 수 있습니다</span>';
    }
  }
}

// ===== 언어 전환 (전역 함수) =====
function setLang(lang) {
  if (lang !== 'ko' && lang !== 'en') return;
  _currentLang = lang;
  try { localStorage.setItem('lang', lang); } catch(_) {}
  applyLang();
}

// ===== 현재 언어 반환 (app.js에서 참조 가능) =====
function getLang() {
  return _currentLang;
}

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', applyLang);
