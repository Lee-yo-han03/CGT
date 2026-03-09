'use strict';
const API = window.location.origin;
let state = { files: [], sessionId: null, trades: [], tax: null, parsedFiles: [] };

// ===== XSS 방어 (최상단 정의) =====
function escHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ===== 모바일 네비게이션 =====
function toggleMobileNav() {
    const menu = document.getElementById('navMobileMenu');
    const btn = document.getElementById('navHamburger');
    const isOpen = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
    btn.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
}

// ===== Step Navigation =====
function goStep(n) {
    document.querySelectorAll('.step-item').forEach((el, i) => {
        el.classList.remove('active','done');
        el.setAttribute('aria-selected', 'false');
        if (i + 1 < n) el.classList.add('done');
        if (i + 1 === n) { el.classList.add('active'); el.setAttribute('aria-selected', 'true'); }
    });
    ['step1','step2','processingCard'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(`step${n}`);
    if (target) target.classList.remove('hidden');
}

// ===== File Handling =====
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');

uploadZone.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('hover'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('hover'));
uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('hover');
    addFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', e => { addFiles(e.target.files); fileInput.value = ''; });

function addFiles(filesList) {
    for (const f of filesList) {
        if (!state.files.some(x => x.name === f.name && x.size === f.size)) {
            state.files.push(f);
        }
    }
    renderFileList();
}

function removeFile(idx) {
    state.files.splice(idx, 1);
    renderFileList();
}

function renderFileList() {
    const list = document.getElementById('fileList');
    const btn = document.getElementById('analyzeBtn');
    if (state.files.length === 0) {
        list.innerHTML = '';
        btn.classList.add('hidden');
        return;
    }
    btn.classList.remove('hidden');
    list.innerHTML = state.files.map((f, i) => `
        <div class="file-item">
            <div class="file-info">
                <span aria-hidden="true">📄</span>
                <span class="file-info-name">${escHtml(f.name)}</span>
                <span class="file-info-size">(${(f.size/1024).toFixed(1)}KB)</span>
            </div>
            <span class="file-remove" onclick="removeFile(${i})" role="button" tabindex="0"
                  aria-label="${escHtml(f.name)} 파일 삭제" onkeydown="if(event.key==='Enter'||event.key===' ')removeFile(${i})">✕</span>
        </div>
    `).join('');
}

// ===== Client-Side Parsing =====
function parseNumCS(v) {
    if (v == null || v === '') return 0;
    return parseFloat(String(v).replace(/,/g, '')) || 0;
}

function parseDateCS(v) {
    if (!v) return '';
    if (v instanceof Date) {
        return `${v.getFullYear()}-${String(v.getMonth()+1).padStart(2,'0')}-${String(v.getDate()).padStart(2,'0')}`;
    }
    const s = String(v).replace(/\//g, '-').replace(/\./g, '-').trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
    if (/^\d{8}$/.test(s)) return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`;
    return s;
}

function findValCS(obj, keys) {
    for (const k of keys) {
        const kNorm = k.replace(/[\n\r\s]/g, '').toLowerCase();
        for (const ok of Object.keys(obj)) {
            const okNorm = ok.replace(/[\n\r\s]/g, '').toLowerCase();
            if (okNorm === kNorm) {
                if (obj[ok] !== undefined && obj[ok] !== '') return obj[ok];
            }
        }
    }
    return '';
}

function normalizeTradesCS(rawData) {
    return rawData.map(row => {
        const name = String(findValCS(row, ['주식 종목명','주식종목명','종목명','종목','stock_name','name']) || '').trim();
        if (!name) return null;
        const shares = parseNumCS(findValCS(row, ['양도주식수','양도주식 수','취득유형별 양도주식 수','수량','매도수량','shares']));
        if (shares <= 0) return null;
        const sellTotal = parseNumCS(findValCS(row, ['양도가액','매도금액','매도대금','sell_amount']));
        const buyTotal = parseNumCS(findValCS(row, ['취득가액','매수금액','매수대금','buy_amount']));
        const expenses = parseNumCS(findValCS(row, ['제비용','필요경비','수수료','expenses']));
        const plRaw = parseNumCS(findValCS(row, ['손익','비용차감 후 손익','profit_loss','손익금액','양도차익']));
        const profitLoss = plRaw || (sellTotal - buyTotal - expenses);
        const code = String(findValCS(row, ['주식종목코드','종목코드','ISIN','isin','stock_code','ISIN코드']) || '').trim();
        return {
            stock_name: name,
            stock_code: code,
            shares,
            sell_date: parseDateCS(findValCS(row, ['양도일자','매도일자','매도일','sell_date'])),
            sell_price_per_share: parseNumCS(findValCS(row, ['주당양도가액','주당매도가액','매도단가'])),
            sell_total: Math.round(sellTotal),
            buy_date: parseDateCS(findValCS(row, ['취득일자','매수일자','매수일','buy_date'])),
            buy_price_per_share: parseNumCS(findValCS(row, ['주당취득가액','주당매수가액','매수단가'])),
            buy_total: Math.round(buyTotal),
            expenses: Math.round(expenses),
            profit_loss: Math.round(profitLoss),
            country_code: String(findValCS(row, ['국외자산국가코드','국가코드','country']) || 'US'),
        };
    }).filter(Boolean);
}

function calculateTaxCS(trades) {
    const total_sell = trades.reduce((s, t) => s + t.sell_total, 0);
    const total_buy = trades.reduce((s, t) => s + t.buy_total, 0);
    const total_expenses = trades.reduce((s, t) => s + t.expenses, 0);
    const gross_profit_loss = trades.reduce((s, t) => s + t.profit_loss, 0);
    const basic_deduction = 2500000;
    const taxable_income = Math.max(0, gross_profit_loss - basic_deduction);
    const tax_amount = Math.round(taxable_income * 0.22);
    return {
        trade_count: trades.length,
        total_sell, total_buy, total_expenses, gross_profit_loss,
        basic_deduction, taxable_income, tax_amount,
        national_tax: Math.round(taxable_income * 0.20),
        local_tax: Math.round(taxable_income * 0.02),
        profit_trades: trades.filter(t => t.profit_loss > 0).length,
        loss_trades: trades.filter(t => t.profit_loss < 0).length,
    };
}

function autoFillBuyDatesCS(trades) {
    return trades.map(t => {
        const d = {...t};
        if (d.sell_date && d.sell_date.length >= 4) {
            const year = d.sell_date.slice(0, 4);
            const filled = `${year}-01-01`;
            d.buy_date = filled < d.sell_date ? filled : `${parseInt(year)-1}-12-31`;
        }
        return d;
    });
}

// ===== 홈택스 엑셀 생성 (주식_엑셀업로드_양식.xlsx 템플릿 기반) =====
// 템플릿을 base64로 내장하여 4개 시트·스타일·서식을 완전히 보존

function generateHomeTaxExcelCS(trades, autoFill) {
    const workTrades = autoFill ? autoFillBuyDatesCS(trades) : trades;

    // 공식 템플릿 로드 (4개 시트 + 스타일 보존)
    const wb = XLSX.read(HOMETAX_TEMPLATE_B64, { type: 'base64' });
    const ws = wb.Sheets['자료'];

    // 기존 샘플 데이터 행 삭제 (row index 1 이상, 0-indexed)
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:W3');
    for (let R = 1; R <= range.e.r; R++) {
        for (let C = 0; C <= range.e.c; C++) {
            delete ws[XLSX.utils.encode_cell({ r: R, c: C })];
        }
    }

    // 템플릿의 스타일 인덱스 (홀수행/짝수행 교대 적용)
    // odd(idx%2===0): row2 스타일, even(idx%2===1): row3 스타일
    const STYLE = [
        // col:  A    B    C    D    E    F    G    H    I    J    K    L    M    N    O    P    Q    R    S    T    U    V    W
        /* odd */ [21,  20,  31,  34,  22,  22,  22,  22,  22,  23,  23,  22,  23,  23,  23,  26,  25,  27,  26,  28,  24,  24,  24],
        /* even*/ [25,  24,  31,  34,  25,  25,  25,  25,  25,  26,  26,  25,  26,  26,  26,  26,  25,  27,  26,  28,  24,  24,  24],
    ];

    workTrades.forEach((t, idx) => {
        const R = idx + 1;   // 0-indexed: row1 = 첫 데이터행
        const S = STYLE[idx % 2];
        const set = (C, cell) => { ws[XLSX.utils.encode_cell({ r: R, c: C })] = cell; };

        // A: 주식 종목명 (텍스트)
        set(0,  { t: 's', s: S[0],  v: t.stock_name || '' });
        // B: 사업자등록번호 (빈 숫자셀 — 템플릿과 동일)
        set(1,  { t: 'n', s: S[1] });
        // C: 국내/국외 구분 (숫자, 2=국외)
        set(2,  { t: 'n', s: S[2],  v: 2 });
        // D: 취득유형별 양도주식 수 (숫자)
        set(3,  { t: 'n', s: S[3],  v: t.shares != null ? t.shares : 0 });
        // E: 세율구분 (텍스트 코드 '61')
        set(4,  { t: 's', s: S[4],  v: '61' });
        // F: 주식등 종류 (텍스트 코드 '61')
        set(5,  { t: 's', s: S[5],  v: '61' });
        // G: 양도물건 종류 (텍스트 코드 '10')
        set(6,  { t: 's', s: S[6],  v: '10' });
        // H: 취득유형 (텍스트 코드 '01', 선행0 유지)
        set(7,  { t: 's', s: S[7],  v: '01' });
        // I: 양도일자 (YYYY-MM-DD 텍스트 — 시리얼 변환 방지)
        set(8,  { t: 's', s: S[8],  v: t.sell_date || '' });
        // J: 주당양도가액 (숫자, 천단위 구분)
        set(9,  { t: 'n', s: S[9],  v: Math.round(t.sell_price_per_share || 0), z: '#,##0' });
        // K: 양도가액 (숫자, 천단위 구분)
        set(10, { t: 'n', s: S[10], v: Math.round(t.sell_total || 0),           z: '#,##0' });
        // L: 취득일자 (YYYY-MM-DD 텍스트 — 시리얼 변환 방지)
        set(11, { t: 's', s: S[11], v: t.buy_date || '' });
        // M: 주당취득가액 (숫자, 천단위 구분)
        set(12, { t: 'n', s: S[12], v: Math.round(t.buy_price_per_share || 0),  z: '#,##0' });
        // N: 취득가액 (숫자, 천단위 구분)
        set(13, { t: 'n', s: S[13], v: Math.round(t.buy_total || 0),            z: '#,##0' });
        // O: 필요경비 (숫자, 천단위 구분)
        set(14, { t: 'n', s: S[14], v: Math.round(t.expenses || 0),             z: '#,##0' });
        // P~T: 비과세/감면/과세이연 (빈 숫자셀 — 템플릿과 동일)
        set(15, { t: 'n', s: S[15] });
        set(16, { t: 'n', s: S[16] });
        set(17, { t: 'n', s: S[17] });
        set(18, { t: 'n', s: S[18] });
        set(19, { t: 'n', s: S[19] });
        // U: ISIN코드/종목코드 (있으면 텍스트, 없으면 빈 숫자셀)
        if (t.stock_code) {
            set(20, { t: 's', s: S[20], v: t.stock_code });
        } else {
            set(20, { t: 'n', s: S[20] });
        }
        // V: 국외자산국가코드 (텍스트)
        set(21, { t: 's', s: S[21], v: t.country_code || 'US' });
        // W: 국외자산내용 (빈 숫자셀)
        set(22, { t: 'n', s: S[22] });
    });

    // 시트 범위 업데이트
    ws['!ref'] = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: Math.max(workTrades.length, 1), c: 22 }
    });

    return wb;
}


// ===== PDF Client-Side Parser (한국투자증권 형식) =====
function detectCountryCS(code) {
    if (!code) return 'US';
    const p = code.substring(0, 2).toUpperCase();
    return { US:'US', KY:'US', JP:'JP', HK:'HK', GB:'GB', DE:'DE', FR:'FR', CA:'CA', AU:'AU', CN:'CN', TW:'TW', SG:'SG' }[p] || 'US';
}

// ===== 증권사 이름 매핑 =====
const BROKER_NAMES = {
    koreainvestment: '한국투자증권',
    kiwoom:          '키움증권',
    miraeasset:      '미래에셋증권',
    samsung:         '삼성증권',
    nh:              'NH투자증권',
    shinhan:         '신한투자증권',
};

// ===== 한국투자증권 전용 레이아웃 (x좌표 실측값) =====
const KI_LAYOUT = {
    date:     [190, 245],  // 양도일자 YYYY.MM.DD
    name:     [38,  87],   // 종목명
    isin:     [85,  130],  // ISIN 코드
    shares:   [150, 192],  // 양도주식수
    sell:     [295, 352],  // 양도가액
    buy:      [395, 460],  // 취득가액
    expenses: [460, 513],  // 제비용
    pl:       [513, 570],  // 손익
};

// ===== PDF 텍스트에서 증권사 자동 감지 =====
function detectBrokerFromText(text) {
    if (/한국투자증권|Korea\s*Investment/i.test(text))    return 'koreainvestment';
    if (/키움증권|Kiwoom/i.test(text))                    return 'kiwoom';
    if (/미래에셋|Mirae\s*Asset/i.test(text))             return 'miraeasset';
    if (/삼성증권|Samsung\s*Securities/i.test(text))      return 'samsung';
    if (/NH투자증권|NH\s*Investment/i.test(text))         return 'nh';
    if (/신한투자증권|신한금융투자|Shinhan/i.test(text))   return 'shinhan';
    return null;
}

// ===== PDF 아이템을 y±tol px 기준 밴드로 그룹핑 =====
function groupIntoBands(items, tol = 3) {
    const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
    const bands = [];
    for (const item of sorted) {
        const last = bands[bands.length - 1];
        if (last && Math.abs(item.y - last.y) <= tol) {
            last.items.push(item);
        } else {
            bands.push({ y: item.y, items: [item] });
        }
    }
    return bands;
}

// ===== 한국투자증권 전용 파서 (x좌표 실측 검증됨) =====
async function parseKoreaInvestmentPDF(pdf) {
    const trades = [];
    const dateRe = /^(\d{4})\.(\d{2})\.(\d{2})$/;

    for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const vp   = page.getViewport({ scale: 1.0 });
        const tc   = await page.getTextContent();

        const items = [];
        for (const item of tc.items) {
            const t = (item.str || '').trim();
            if (!t) continue;
            items.push({ text: t, x: item.transform[4], y: vp.height - item.transform[5] });
        }

        const bands = groupIntoBands(items);

        for (const band of bands) {
            const dateItem = band.items.find(i => {
                const m = i.text.match(dateRe);
                return m && i.x >= KI_LAYOUT.date[0] && i.x <= KI_LAYOUT.date[1];
            });
            if (!dateItem) continue;

            const dm = dateItem.text.match(dateRe);
            const sellDate = `${dm[1]}-${dm[2]}-${dm[3]}`;
            const block = items.filter(i => Math.abs(i.y - band.y) <= 15);

            const getNum = (xMin, xMax) => {
                const txt = block
                    .filter(i => i.x >= xMin && i.x < xMax)
                    .sort((a, b) => a.y - b.y || a.x - b.x)
                    .map(i => i.text.replace(/,/g, '')).join('');
                return parseFloat(txt) || 0;
            };

            const nameItems = block.filter(i => i.x >= KI_LAYOUT.name[0] && i.x < KI_LAYOUT.name[1])
                .sort((a, b) => a.y - b.y || a.x - b.x);
            const stockName = nameItems.map(i => i.text).join(' ').trim();
            if (!stockName || /합계|소계|합산/.test(stockName)) continue;

            const isinItems = block.filter(i =>
                i.x >= KI_LAYOUT.isin[0] && i.x < KI_LAYOUT.isin[1] && /^[A-Z0-9]+$/i.test(i.text)
            ).sort((a, b) => a.y - b.y || a.x - b.x);
            const stockCode = isinItems.map(i => i.text.toUpperCase()).join('');

            const shares    = getNum(...KI_LAYOUT.shares);
            if (shares <= 0) continue;
            const sellTotal = getNum(...KI_LAYOUT.sell);
            if (sellTotal <= 0) continue;
            const buyTotal  = getNum(...KI_LAYOUT.buy);
            const expenses  = getNum(...KI_LAYOUT.expenses);

            const plItems = block.filter(i => i.x >= KI_LAYOUT.pl[0] && i.x < KI_LAYOUT.pl[1])
                .sort((a, b) => a.y - b.y || a.x - b.x);
            const profitLoss = parseFloat(plItems.map(i => i.text.replace(/,/g, '')).join(''))
                || (sellTotal - buyTotal - expenses);

            trades.push({
                stock_name: stockName, stock_code: stockCode, shares,
                sell_date: sellDate,
                sell_price_per_share: shares > 0 ? Math.round(sellTotal / shares) : 0,
                sell_total: Math.round(sellTotal), buy_date: '',
                buy_price_per_share: shares > 0 ? Math.round(buyTotal / shares) : 0,
                buy_total: Math.round(buyTotal), expenses: Math.round(expenses),
                profit_loss: Math.round(profitLoss), country_code: detectCountryCS(stockCode),
            });
        }
    }
    return trades;
}

// ===== 공통 헤더 감지 파서 (키움·미래에셋·삼성·NH·신한) =====
// PDF 안에 있는 컬럼 헤더의 x좌표를 동적으로 찾아서 파싱합니다.
async function parseGenericBrokerPDF(pdf) {
    const dateRe = /(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})/;

    // 컬럼 헤더 키워드 → 내부 필드명
    const HEADER_MAP = [
        { field: 'name',     re: /^(종목명|주식\s*종목명|종목)$/ },
        { field: 'date',     re: /^(양도일자?|매도일자?|거래일자?|양도일)$/ },
        { field: 'sell',     re: /^(양도가액|매도금액|매도대금|양도금액)$/ },
        { field: 'buy',      re: /^(취득가액|매수금액|매수대금|취득금액)$/ },
        { field: 'expenses', re: /^(제비용|필요경비|수수료|제세금)$/ },
        { field: 'shares',   re: /^(양도주식수?|수량|매도수량|주식수)$/ },
        { field: 'pl',       re: /^(손익|양도차익|손익금액)$/ },
        { field: 'isin',     re: /^(ISIN|종목코드|주식종목코드|ISIN코드)$/i },
    ];

    // 전 페이지 아이템 수집 (페이지 offset으로 y좌표 분리)
    let allItems = [];
    for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const vp   = page.getViewport({ scale: 1.0 });
        const tc   = await page.getTextContent();
        for (const item of tc.items) {
            const t = (item.str || '').trim();
            if (!t) continue;
            allItems.push({
                text: t,
                x: item.transform[4],
                y: (p - 1) * 2000 + (vp.height - item.transform[5]),
            });
        }
    }

    const bands = groupIntoBands(allItems, 4);

    // 헤더 밴드 탐색: HEADER_MAP 키워드가 3개 이상 매칭되는 밴드
    let colPos = null;
    let headerIdx = -1;
    for (let i = 0; i < bands.length; i++) {
        const matched = {};
        for (const { field, re } of HEADER_MAP) {
            const hit = bands[i].items.find(it => re.test(it.text));
            if (hit) matched[field] = hit.x;
        }
        if (Object.keys(matched).length >= 3 && matched.sell) {
            colPos = matched;
            headerIdx = i;
            break;
        }
    }

    if (!colPos) return null; // 헤더 인식 실패

    // 컬럼 x 범위: 현재 컬럼 시작 ~ 다음 컬럼 시작-5
    const sortedX = Object.entries(colPos).sort((a, b) => a[1] - b[1]);
    const colRange = {};
    for (let i = 0; i < sortedX.length; i++) {
        const [field, x] = sortedX[i];
        const nextX = sortedX[i + 1] ? sortedX[i + 1][1] - 5 : x + 90;
        colRange[field] = [x - 5, nextX];
    }

    const trades = [];

    for (let i = headerIdx + 1; i < bands.length; i++) {
        const band = bands[i];
        // ±20px 블록으로 다행 셀 합산
        const block = allItems.filter(it => Math.abs(it.y - band.y) <= 20);

        // 날짜 행 판별
        let dateItem = null;
        if (colPos.date) {
            const [dx0, dx1] = colRange.date;
            dateItem = band.items.find(it => {
                return dateRe.test(it.text) && it.x >= dx0 && it.x < dx1;
            });
        }
        if (!dateItem) {
            dateItem = band.items.find(it => dateRe.test(it.text));
        }
        if (!dateItem) continue;

        const dm = dateItem.text.match(dateRe);
        const sellDate = `${dm[1]}-${dm[2]}-${dm[3]}`;

        const getNum = (field) => {
            if (!colRange[field]) return 0;
            const [x0, x1] = colRange[field];
            const txt = block
                .filter(it => it.x >= x0 && it.x < x1)
                .sort((a, b) => a.x - b.x)
                .map(it => it.text.replace(/,/g, '')).join('');
            return parseFloat(txt) || 0;
        };

        const getStr = (field) => {
            if (!colRange[field]) return '';
            const [x0, x1] = colRange[field];
            return block
                .filter(it => it.x >= x0 && it.x < x1)
                .sort((a, b) => a.y - b.y || a.x - b.x)
                .map(it => it.text).join(' ').trim();
        };

        const stockName = getStr('name');
        if (!stockName || /합계|소계|합산|소합계/.test(stockName)) continue;

        const shares    = getNum('shares');
        if (shares <= 0) continue;
        const sellTotal = getNum('sell');
        if (sellTotal <= 0) continue;
        const buyTotal  = getNum('buy');
        const expenses  = getNum('expenses');

        let profitLoss;
        if (colRange.pl) {
            const [px0, px1] = colRange.pl;
            const plTxt = block
                .filter(it => it.x >= px0 && it.x < px1)
                .sort((a, b) => a.x - b.x)
                .map(it => it.text.replace(/,/g, '')).join('');
            profitLoss = parseFloat(plTxt) || (sellTotal - buyTotal - expenses);
        } else {
            profitLoss = sellTotal - buyTotal - expenses;
        }

        const stockCode = getStr('isin').replace(/\s+/g, '').toUpperCase();

        trades.push({
            stock_name: stockName, stock_code: stockCode, shares,
            sell_date: sellDate,
            sell_price_per_share: shares > 0 ? Math.round(sellTotal / shares) : 0,
            sell_total: Math.round(sellTotal), buy_date: '',
            buy_price_per_share: shares > 0 ? Math.round(buyTotal / shares) : 0,
            buy_total: Math.round(buyTotal), expenses: Math.round(expenses),
            profit_loss: Math.round(profitLoss), country_code: detectCountryCS(stockCode),
        });
    }

    return trades;
}

// ===== PDF 파싱 진입점 =====
async function parsePDFClientSide(file) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const data = await file.arrayBuffer();
    const pdf  = await pdfjsLib.getDocument({ data }).promise;

    // 첫 페이지 텍스트로 증권사 감지
    const firstPage = await pdf.getPage(1);
    const firstTC   = await firstPage.getTextContent();
    const firstText = firstTC.items.map(i => i.str).join(' ');
    const brokerId  = detectBrokerFromText(firstText);
    const brokerName = brokerId ? BROKER_NAMES[brokerId] : null;

    // 한국투자증권만 PDF 파싱 지원
    if (brokerId === 'koreainvestment') {
        const trades = await parseKoreaInvestmentPDF(pdf);
        return { trades, brokerName: '한국투자증권' };
    }

    // 그 외 모든 증권사: Excel/CSV 안내
    throw new Error(
        '현재 PDF 파싱은 한국투자증권만 지원됩니다. ' +
        '다른 증권사는 Excel/CSV 파일로 업로드해주세요.'
    );
}

async function parseFilesClientSide(files, onProgress) {
    const allTrades = [];
    const parsedFiles = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (onProgress) onProgress(i, files.length, file.name);
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext === 'pdf') {
            try {
                const { trades, brokerName } = await parsePDFClientSide(file);
                allTrades.push(...trades);
                parsedFiles.push({
                    filename: file.name,
                    broker: brokerName,
                    trade_count: trades.length,
                    ...(trades.length === 0 ? { error: '거래 데이터를 찾지 못했습니다. Excel 또는 CSV 파일을 사용해주세요.' } : {}),
                });
            } catch(e) {
                parsedFiles.push({ filename: file.name, broker: 'PDF', trade_count: 0, error: e.message });
            }
            continue;
        }
        try {
            const data = await file.arrayBuffer();
            const wb = XLSX.read(data);
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const raw = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
            const trades = normalizeTradesCS(raw);
            allTrades.push(...trades);
            parsedFiles.push({ filename: file.name, broker: '자동감지(Excel/CSV)', trade_count: trades.length });
        } catch(e) {
            parsedFiles.push({ filename: file.name, broker: 'Error', trade_count: 0, error: e.message });
        }
    }
    return { trades: allTrades, parsedFiles };
}

// ===== Upload =====
async function uploadFiles() {
    if (state.files.length === 0) return;

    document.getElementById('step1').classList.add('hidden');
    document.getElementById('processingCard').classList.remove('hidden');

    // 진행률 UI 초기화
    const totalFiles = state.files.length;
    const progressFill = document.getElementById('progressFill');
    const processingMsg = document.getElementById('processingMsg');
    const processingTitle = document.getElementById('processingTitle');
    const fileListEl = document.getElementById('processingFileList');

    fileListEl.innerHTML = state.files.map((f, i) =>
        `<div class="pfl-item" id="pfl-${i}"><span class="pfl-dot"></span><span>${escHtml(f.name)}</span></div>`
    ).join('');
    progressFill.style.width = '0%';
    processingTitle.textContent = '파일 분석 중...';
    processingMsg.textContent = `총 ${totalFiles}개 파일`;

    function updateProgress(index, total, filename) {
        const pct = Math.round((index / total) * 100);
        progressFill.style.width = pct + '%';
        processingMsg.textContent = `${index + 1}/${total} 파일 처리 중... (${filename})`;
        // 이전 파일 완료 표시
        if (index > 0) {
            const prev = document.getElementById(`pfl-${index - 1}`);
            if (prev) prev.className = 'pfl-item done';
        }
        const cur = document.getElementById(`pfl-${index}`);
        if (cur) cur.className = 'pfl-item active';
    }

    async function showCompletion() {
        progressFill.style.width = '100%';
        // 모든 파일 완료 표시
        for (let i = 0; i < totalFiles; i++) {
            const el = document.getElementById(`pfl-${i}`);
            if (el) el.className = 'pfl-item done';
        }
        document.getElementById('processingSpinner').style.display = 'none';
        processingTitle.textContent = '완료!';
        processingMsg.textContent = '계산 결과를 불러오는 중...';
        await new Promise(r => setTimeout(r, 500));
    }

    // 서버 연결 시도 (타임아웃 2초)
    let serverAvailable = false;
    try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 2000);
        const r = await fetch(`${API}/api/health`, { signal: ctrl.signal });
        clearTimeout(tid);
        serverAvailable = r.ok;
    } catch {}

    if (serverAvailable) {
        // 서버 모드: PDF 포함 모든 파일 처리 가능
        const formData = new FormData();
        state.files.forEach(f => formData.append('file', f));
        try {
            const res = await fetch(`${API}/api/upload`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.status === 'success') {
                if (data.trade_count === 0) {
                    document.getElementById('processingCard').classList.add('hidden');
                    goStep(1);
                    const errFile = (data.files || []).find(f => f.error);
                    const msg = errFile ? `파싱 실패: ${errFile.error}` : '거래 데이터를 찾지 못했습니다.\n파일을 확인해주세요.';
                    alert(msg);
                    return;
                }
                state.sessionId = data.session_id;
                state.trades = data.trades;
                state.tax = data.tax;
                state.parsedFiles = data.files;
                document.getElementById('processingCard').classList.add('hidden');
                displayResults();
                goStep(2);
                return;
            }
        } catch {}
    }

    // 브라우저 처리 모드 (PDF.js + XLSX.js 클라이언트 처리)
    const { trades, parsedFiles } = await parseFilesClientSide(state.files, updateProgress);

    if (trades.length === 0) {
        document.getElementById('processingCard').classList.add('hidden');
        goStep(1);
        alert('거래 데이터를 찾지 못했습니다.\n\nPDF: 한국투자증권 양도소득세 내역서 형식을 지원합니다.\nExcel/CSV: 종목명, 양도가액, 취득가액 컬럼이 있어야 합니다.');
        return;
    }

    state.sessionId = null;
    state.trades = trades;
    state.tax = calculateTaxCS(trades);
    state.parsedFiles = parsedFiles;

    await showCompletion();
    document.getElementById('processingCard').classList.add('hidden');
    document.getElementById('processingSpinner').style.display = '';
    displayResults();
    goStep(2);
}

// ===== Add More Files =====
function showAddMore() {
    document.getElementById('addMoreZone').classList.remove('hidden');
    document.getElementById('addFileInput').click();
}

document.getElementById('addFileInput').addEventListener('change', async function(e) {
    if (!e.target.files.length) return;

    document.getElementById('addMoreZone').classList.add('hidden');

    if (state.sessionId) {
        const formData = new FormData();
        for (const f of e.target.files) formData.append('file', f);
        formData.append('session_id', state.sessionId);
        try {
            const res = await fetch(`${API}/api/upload-additional`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.status === 'success') {
                state.trades = data.trades;
                state.tax = data.tax;
                state.parsedFiles = data.files;
                displayResults();
            } else {
                alert(data.error || '추가 업로드 실패');
            }
        } catch (err) {
            alert('에러: ' + err.message);
        }
    } else {
        // 브라우저 모드 추가 업로드
        const { trades, parsedFiles } = await parseFilesClientSide(Array.from(e.target.files));
        state.trades = [...state.trades, ...trades];
        state.parsedFiles = [...state.parsedFiles, ...parsedFiles];
        state.tax = calculateTaxCS(state.trades);
        displayResults();
    }
    e.target.value = '';
});

// ===== Display =====
function displayResults() {
    const { trades, tax, parsedFiles } = state;

    const fr = document.getElementById('fileResults');
    if (parsedFiles && parsedFiles.length > 0) {
        fr.innerHTML = parsedFiles.map(f => `
            <div class="file-item" style="margin-bottom:8px;">
                <div class="file-info">
                    <span aria-hidden="true">📄</span>
                    <span class="file-info-name">${escHtml(f.filename)}</span>
                    <span class="file-broker">${escHtml(f.broker)}</span>
                    <span class="file-info-size">${f.trade_count}건</span>
                </div>
                ${f.error ? `<span style="color:var(--red); font-size:11px;" role="alert">${escHtml(f.error)}</span>` : ''}
            </div>
        `).join('');
    }

    document.getElementById('sumCount').textContent = `${trades.length}건`;
    document.getElementById('sumProfit').textContent = `${tax.profit_trades}건`;
    document.getElementById('sumLoss').textContent = `${tax.loss_trades}건`;
    document.getElementById('tradeCountLabel').textContent = trades.length;

    document.getElementById('taxAmount').textContent = krw(tax.tax_amount);
    const ta2 = document.getElementById('taxAmount2'); if (ta2) ta2.textContent = krw(tax.tax_amount);
    document.getElementById('taxN').textContent = krw(tax.national_tax);
    document.getElementById('taxL').textContent = krw(tax.local_tax);
    document.getElementById('taxSub').textContent = `세율 22% · 기본공제 250만원 적용`;

    document.getElementById('dSell').textContent = krw(tax.total_sell);
    document.getElementById('dBuy').textContent = krw(tax.total_buy);
    document.getElementById('dExp').textContent = krw(tax.total_expenses);
    document.getElementById('dPL').textContent = krw(tax.gross_profit_loss);
    document.getElementById('dDed').textContent = `-${krw(tax.basic_deduction)}`;
    document.getElementById('dTaxable').textContent = krw(tax.taxable_income);

    // 절세 시뮬레이터 자동 채움
    const simGainEl = document.getElementById('simGain');
    if (simGainEl && tax.gross_profit_loss > 0) {
        simGainEl.value = tax.gross_profit_loss;
    }

    // 가산세 카드 초기화
    initPenaltyCard();

    // 공유 버튼 표시
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) shareBtn.style.display = 'inline-flex';

    document.getElementById('tradesBody').innerHTML = trades.map(t => {
        const pl = t.profit_loss || 0;
        return `<tr>
            <td>${escHtml(t.stock_name||'-')}</td>
            <td>${t.shares||0}</td>
            <td>${escHtml(t.sell_date||'-')}</td>
            <td>${num(t.sell_total)}</td>
            <td>${num(t.buy_total)}</td>
            <td>${num(t.expenses)}</td>
            <td class="${pl > 0 ? 'profit' : pl < 0 ? 'loss' : ''}">${num(pl)}</td>
        </tr>`;
    }).join('');

    const errorFiles = parsedFiles.filter(f => f.error);
    const mode = state.sessionId ? '' : ' (브라우저 처리)';
    if (errorFiles.length > 0) {
        const errNames = errorFiles.map(f => escHtml(f.filename)).join(', ');
        document.getElementById('resultAlert').innerHTML =
            `<div class="result-alert result-alert-ok" role="status"><span aria-hidden="true">✅</span><span>${parsedFiles.length}개 파일에서 총 ${trades.length}건 처리${escHtml(mode)}</span></div>` +
            `<div class="result-alert result-alert-warn" role="alert" style="background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;"><span aria-hidden="true">⚠️</span><span>파싱 실패 파일: ${errNames}</span></div>`;
    } else {
        document.getElementById('resultAlert').innerHTML =
            `<div class="result-alert result-alert-ok" role="status"><span aria-hidden="true">✅</span><span>${parsedFiles.length}개 파일에서 총 ${trades.length}건의 거래가 처리되었습니다${escHtml(mode)}</span></div>`;
    }
}

// ===== Download =====
async function downloadExcel() {
    const autoFill = document.getElementById('autoFillCheck').checked;

    if (state.sessionId) {
        // 서버 모드
        try {
            const res = await fetch(`${API}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: state.sessionId, auto_fill_buy_dates: autoFill }),
            });
            if (!res.ok) throw new Error('엑셀 생성 실패');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `홈택스_양도소득세_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('다운로드 실패: ' + err.message);
        }
        return;
    }

    // 브라우저 모드: 클라이언트에서 직접 생성
    if (!state.trades || state.trades.length === 0) {
        alert('다운로드할 거래 데이터가 없습니다.');
        return;
    }
    const wb = generateHomeTaxExcelCS(state.trades, autoFill);
    XLSX.writeFile(wb, `홈택스_양도소득세_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// ===== Reset =====
function resetAll() {
    state = { files: [], sessionId: null, trades: [], tax: null, parsedFiles: [] };
    document.getElementById('fileList').innerHTML = '';
    document.getElementById('analyzeBtn').classList.add('hidden');
    document.getElementById('fileInput').value = '';
    // 가산세 카드 초기화
    const pc = document.getElementById('penaltyCard');
    if (pc) pc.classList.add('hidden');
    const pt = document.getElementById('penaltyToggle');
    if (pt) pt.checked = false;
    const pi = document.getElementById('penaltyInputs');
    if (pi) pi.classList.add('hidden');
    const pr = document.getElementById('penaltyResult');
    if (pr) pr.classList.add('hidden');
    goStep(1);
}

// ===== Helpers =====
function krw(n) { return (n||0).toLocaleString('ko-KR') + '원'; }
function num(n) { return (n||0).toLocaleString('ko-KR'); }

// ===== 절세 시뮬레이션 =====
function simulateTaxSaving() {
    const gainRaw = document.getElementById('simGain').value.trim();
    const lossRaw = document.getElementById('simLoss').value.trim();

    if (!gainRaw) {
        document.getElementById('simGain').focus();
        document.getElementById('simGain').classList.add('sim-input--error');
        setTimeout(() => document.getElementById('simGain').classList.remove('sim-input--error'), 1500);
        return;
    }

    const gain = Math.max(0, parseFloat(gainRaw) || 0);
    const loss = Math.abs(parseFloat(lossRaw) || 0); // 음수 입력 시 절댓값으로 처리

    const DEDUCTION = 2500000;
    const RATE = 0.22;
    const taxBefore = Math.round(Math.max(0, gain - DEDUCTION) * RATE);
    const newGain = Math.max(0, gain - loss);
    const taxAfter = Math.round(Math.max(0, newGain - DEDUCTION) * RATE);
    const saving = taxBefore - taxAfter;

    document.getElementById('simTaxBefore').textContent = krw(taxBefore);
    document.getElementById('simTaxAfter').textContent = krw(taxAfter);
    document.getElementById('simSaving').textContent = saving > 0 ? `−${krw(saving)}` : krw(0);

    let desc;
    if (loss <= 0) {
        desc = '매도 예정 손실액을 입력하면 절세 효과를 계산합니다.';
    } else if (saving > 0) {
        desc = `손실 종목을 ${krw(loss)} 매도하면 과세표준이 줄어들어 세금을 약 <strong style="color:var(--green);">${krw(saving)}</strong> 절감할 수 있습니다.` +
               `<br>단, 실제 매도 전에 거래 수수료·환율 변동·향후 주가 회복 가능성도 함께 고려하세요.`;
    } else {
        desc = `손실 매도 후에도 과세표준이 기본공제(250만원) 이하여서 세금 차이가 없습니다.`;
    }
    // 면책 문구 항상 표시
    desc += `<br><span style="color:var(--muted);font-size:11px;">⚠️ 이 시뮬레이션은 참고용이며, 실제 절세 효과는 매도 시점의 환율·시세·수수료에 따라 달라질 수 있습니다. 정확한 세금은 세무사와 상담하세요.</span>`;

    document.getElementById('simDesc').innerHTML = desc;
    document.getElementById('simResult').classList.remove('hidden');
}

// ===== 결과 공유하기 =====
async function shareResult() {
    const tax = state.tax;
    if (!tax) return;
    const text = `📊 해외주식 양도소득세 계산 결과\n총 양도차익: ${krw(tax.gross_profit_loss)}\n예상 납부세액: ${krw(tax.tax_amount)}\n\n양도세이브에서 무료로 계산해보세요!`;
    const url = 'https://yangdosave.kr';
    if (navigator.share) {
        try { await navigator.share({ title: '해외주식 양도소득세 계산 결과 | 양도세이브', text, url }); } catch {}
    } else {
        try {
            await navigator.clipboard.writeText(`${text}\n${url}`);
            alert('결과가 클립보드에 복사되었습니다.');
        } catch { alert(`공유 링크: ${url}`); }
    }
}


// ===== FAQ Accordion =====
function toggleFaq(btn) {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
    }
}

// ===================================================================
// ===== 피드백 (리액션 + 댓글): Firebase 우선, localStorage 폴백 ====
// ===================================================================

const REACTION_KEYS = ['fast', 'accurate', 'helpful', 'easy', 'improve'];
const LS_VOTED    = 'yangdosave_reactions_v1';   // 내가 누른 리액션 (중복 방지)
const LS_COUNTS   = 'yangdosave_react_cnt_v1';   // 로컬 카운트 (Firebase 없을 때)
const LS_COMMENTS = 'yangdosave_comments_v1';    // 로컬 댓글 (Firebase 없을 때)

// ── localStorage helpers ──────────────────────────────────────────
function getVotedReactions() {
    try { return JSON.parse(localStorage.getItem(LS_VOTED) || '{}'); } catch { return {}; }
}
function setVotedReaction(key, voted) {
    const v = getVotedReactions();
    if (voted) v[key] = true; else delete v[key];
    localStorage.setItem(LS_VOTED, JSON.stringify(v));
}
function getLocalCounts() {
    try { return JSON.parse(localStorage.getItem(LS_COUNTS) || '{}'); } catch { return {}; }
}
function setLocalCount(key, count) {
    const c = getLocalCounts(); c[key] = count;
    localStorage.setItem(LS_COUNTS, JSON.stringify(c));
}
function getLocalComments() {
    try { return JSON.parse(localStorage.getItem(LS_COMMENTS) || '[]'); } catch { return []; }
}
function saveLocalComment(name, text) {
    const list = getLocalComments();
    list.unshift({ name: name || '익명', text, createdAt: new Date().toISOString() });
    localStorage.setItem(LS_COMMENTS, JSON.stringify(list.slice(0, 50)));
}

// ── UI 공통 ──────────────────────────────────────────────────────
function updateReactionUI(key, count, active) {
    const countEl = document.getElementById(`rc-${key}`);
    if (countEl) countEl.textContent = count;
    const btn = document.querySelector(`.reaction-btn[data-key="${key}"]`);
    if (!btn) return;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
}

function renderComments(items) {
    const list = document.getElementById('commentList');
    if (!list) return;
    if (!items || items.length === 0) {
        list.innerHTML = '<p class="comment-empty">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>';
        return;
    }
    list.innerHTML = items.map(d => {
        const raw = d.data ? d.data() : d;
        const name = escHtml(raw.name || '익명');
        const text = escHtml(raw.text || '');
        const ts   = raw.createdAt?.toDate ? raw.createdAt.toDate() : new Date(raw.createdAt || Date.now());
        const date = ts.toLocaleDateString('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit' });
        return `<div class="comment-item">
            <div class="comment-meta">
                <span class="comment-name">${name}</span>
                <span class="comment-date">${date}</span>
            </div>
            <div class="comment-body">${text}</div>
        </div>`;
    }).join('');
}

function showFeedbackLocalNote() {
    const sec = document.getElementById('feedbackSection');
    if (!sec || sec.querySelector('.feedback-local-note')) return;
    const note = document.createElement('p');
    note.className = 'feedback-local-note';
    note.style.cssText = 'font-size:11px;color:var(--muted);text-align:center;margin-top:8px;';
    note.textContent = '※ 현재 이 기기에만 저장됩니다 (Firebase 미연결)';
    sec.querySelector('.feedback-inner')?.appendChild(note);
}

// ── Firebase 상태 뱃지 ────────────────────────────────────────────
function setFbStatus(connected) {
    const el = document.getElementById('fbStatus');
    if (!el) return;
    if (connected) {
        el.innerHTML = '<span style="color:#059669;">● Firebase 연결됨</span>';
    } else {
        el.innerHTML = '<span style="color:#F59E0B;">● 로컬 저장 중 (Firebase 미연결 — 이 기기에만 저장됩니다)</span>';
    }
}

// ── 리액션 로드 ───────────────────────────────────────────────────
async function loadReactions() {
    const voted = getVotedReactions();

    // Firebase 모듈 스크립트가 완료될 때까지 대기 (최대 5초)
    if (window._firebaseReady) {
        await Promise.race([window._firebaseReady, new Promise(r => setTimeout(r, 5000))]);
    }

    const fs = window._fs;
    if (window.db && fs) {
        try {
            console.log('[Firebase] loadReactions 시작...');
            const snap = await fs.getDocs(fs.collection(window.db, 'reactions'));
            console.log('[Firebase] Firestore read success — reactions 문서 수:', snap.size);
            snap.forEach(d => {
                const { key, count } = d.data();
                if (REACTION_KEYS.includes(key)) updateReactionUI(key, count || 0, !!voted[key]);
            });
            setFbStatus(true);
            return;
        } catch(e) {
            console.error('[Firebase] Firestore write error —', e.code, e.message);
            setFbStatus(false);
        }
    } else {
        console.warn('[Firebase] db 또는 _fs 없음 — localStorage 폴백');
    }
    // localStorage 폴백
    const counts = getLocalCounts();
    REACTION_KEYS.forEach(k => updateReactionUI(k, counts[k] || 0, !!voted[k]));
    setFbStatus(false);
    showFeedbackLocalNote();
}

// ── 리액션 토글 ───────────────────────────────────────────────────
async function toggleReaction(btn) {
    const key = btn.dataset.key;
    if (!key) return;

    const voted      = getVotedReactions();
    const isActive   = !!voted[key];
    const delta      = isActive ? -1 : 1;
    const countEl    = document.getElementById(`rc-${key}`);
    const currentCnt = parseInt(countEl?.textContent || '0', 10);
    const newCnt     = Math.max(0, currentCnt + delta);

    // 낙관적 UI
    updateReactionUI(key, newCnt, !isActive);
    setVotedReaction(key, !isActive);

    if (window.db && window._fs) {
        const fs = window._fs;
        try {
            const ref = fs.doc(window.db, 'reactions', key);
            await fs.runTransaction(window.db, async tx => {
                const snap = await tx.get(ref);
                const prev = snap.exists() ? (snap.data().count || 0) : 0;
                tx.set(ref, { key, count: Math.max(0, prev + delta) }, { merge: true });
            });
            return;
        } catch(e) {
            console.warn('Firebase 리액션 저장 실패 — localStorage 폴백:', e.message);
            // UI는 낙관적으로 유지, localStorage에 저장
        }
    }
    // localStorage 폴백: 카운트 저장
    setLocalCount(key, newCnt);
    showFeedbackLocalNote();
}

// ── 댓글 로드 ─────────────────────────────────────────────────────
async function loadComments() {
    if (window.db && window._fs) {
        const fs = window._fs;
        try {
            const q = fs.query(fs.collection(window.db, 'comments'), fs.orderBy('createdAt', 'desc'), fs.limit(50));
            const snap = await fs.getDocs(q);
            renderComments(snap.docs);
            return;
        } catch(e) { console.warn('Firebase 댓글 로드 실패:', e.message); }
    }
    // localStorage 폴백
    renderComments(getLocalComments());
}

// ── 댓글 등록 ─────────────────────────────────────────────────────
async function submitComment() {
    const nameEl = document.getElementById('cmtName');
    const textEl = document.getElementById('cmtText');
    const name   = (nameEl?.value || '').trim();
    const text   = (textEl?.value || '').trim();

    if (!text) { textEl?.focus(); return; }
    if (text.length > 500) { alert('댓글은 500자 이내로 작성해주세요.'); return; }

    const submitBtn = document.querySelector('.comment-submit');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '등록 중...'; }

    try {
        if (window.db && window._fs) {
            const fs = window._fs;
            try {
                await fs.addDoc(fs.collection(window.db, 'comments'), {
                    name: name || '익명', text,
                    createdAt: fs.serverTimestamp(),
                });
                console.log('[Firebase] Firestore write success — comment saved');
            } catch(e) {
                console.warn('[Firebase] Firestore write error — localStorage 폴백:', e.message);
                saveLocalComment(name, text);
                showFeedbackLocalNote();
            }
        } else {
            console.warn('[Firebase] db 없음 — localStorage 폴백');
            saveLocalComment(name, text);
            showFeedbackLocalNote();
        }
        if (nameEl) nameEl.value = '';
        if (textEl) textEl.value = '';
        const charEl = document.getElementById('cmtChar');
        if (charEl) charEl.textContent = '0 / 500';
        await loadComments();
    } catch(e) {
        console.error('댓글 저장 실패:', e.message);
    } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = '등록'; }
    }
}

// 댓글 글자수 카운터
(function() {
    const textEl = document.getElementById('cmtText');
    const charEl = document.getElementById('cmtChar');
    if (textEl && charEl) {
        textEl.addEventListener('input', () => {
            charEl.textContent = `${textEl.value.length} / 500`;
        });
    }
})();

// 페이지 로드 시 데이터 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadReactions();
    loadComments();
});

// ===================================================================
// ===== 기한후 신고 가산세 계산기 =====================================
// ===================================================================

function initPenaltyCard() {
    const card = document.getElementById('penaltyCard');
    const deadlineEl = document.getElementById('penaltyDeadline');
    const fileDateEl = document.getElementById('penaltyFileDate');
    const toggleEl  = document.getElementById('penaltyToggle');
    const inputsEl  = document.getElementById('penaltyInputs');
    if (!card || !deadlineEl || !fileDateEl) return;

    // 카드 표시
    card.classList.remove('hidden');

    // 거래내역에서 양도 연도 자동 감지
    let tradeYear = new Date().getFullYear() - 1;
    if (state.trades && state.trades.length > 0) {
        const years = state.trades
            .map(t => t.sell_date ? parseInt(t.sell_date.substring(0, 4)) : 0)
            .filter(y => y > 2000);
        if (years.length > 0) tradeYear = Math.max(...years);
    }

    // 신고기한: 거래 연도 다음 해 5월 31일
    const deadlineStr = `${tradeYear + 1}-05-31`;
    deadlineEl.value = deadlineStr;

    // 오늘 날짜
    const today = new Date().toISOString().substring(0, 10);
    fileDateEl.value = today;

    // 오늘이 기한 이후이면 자동으로 체크 + 입력 영역 표시
    if (today > deadlineStr) {
        if (toggleEl) toggleEl.checked = true;
        if (inputsEl) inputsEl.classList.remove('hidden');
    }
}

function togglePenaltyCalc() {
    const checked = document.getElementById('penaltyToggle')?.checked;
    const inputsEl = document.getElementById('penaltyInputs');
    const resultEl = document.getElementById('penaltyResult');
    if (!inputsEl) return;
    if (checked) {
        inputsEl.classList.remove('hidden');
    } else {
        inputsEl.classList.add('hidden');
        if (resultEl) resultEl.classList.add('hidden');
    }
}

function calculatePenalty() {
    const originalTax = (state.tax && state.tax.tax_amount) ? state.tax.tax_amount : 0;
    if (originalTax <= 0) {
        alert('납부할 세금이 없어 가산세가 발생하지 않습니다.');
        return;
    }

    const deadline = document.getElementById('penaltyDeadline').value;
    const fileDate = document.getElementById('penaltyFileDate').value;
    if (!deadline || !fileDate) { alert('날짜를 모두 입력해주세요.'); return; }

    const diffDays = Math.round((new Date(fileDate) - new Date(deadline)) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
        alert('신고 예정일이 기한 내입니다. 가산세가 없습니다.');
        return;
    }

    // ── 무신고 가산세 ──
    const nonFilingBase = originalTax * 0.20;
    let reduction = 0, reductionLabel = '';
    if (diffDays <= 30)       { reduction = 0.5; reductionLabel = '1개월 이내 자진신고 → 50% 감면'; }
    else if (diffDays <= 90)  { reduction = 0.3; reductionLabel = '1~3개월 이내 자진신고 → 30% 감면'; }
    else if (diffDays <= 180) { reduction = 0.2; reductionLabel = '3~6개월 이내 자진신고 → 20% 감면'; }
    else                      { reduction = 0;   reductionLabel = '6개월 초과 → 감면 없음'; }
    const nonFilingFinal = Math.round(nonFilingBase * (1 - reduction));

    // ── 납부불성실 가산세 ──
    const latePayTax = Math.round(originalTax * diffDays * 0.00022);

    // ── 합계 ──
    const totalPenalty = nonFilingFinal + latePayTax;
    const grandTotal   = originalTax + totalPenalty;

    // ── UI 업데이트 ──
    document.getElementById('penOriginalTax').textContent = krw(originalTax);
    document.getElementById('penNonFiling').textContent   = krw(nonFilingFinal);
    document.getElementById('penNonFilingSub').textContent = reductionLabel;
    document.getElementById('penLatePay').textContent     = krw(latePayTax);
    document.getElementById('penLatePaySub').textContent  = `경과 ${diffDays}일 × 0.022%`;
    document.getElementById('penTotal').textContent       = krw(grandTotal);

    document.getElementById('penBreakdown').innerHTML = `
        <strong>무신고 가산세:</strong> ${krw(originalTax)} × 20% = ${krw(Math.round(nonFilingBase))}
        ${reduction > 0 ? ` → 자진신고 감면(${Math.round(reduction*100)}%) 적용 후 ${krw(nonFilingFinal)}` : ''}<br>
        <strong>납부불성실 가산세:</strong> ${krw(originalTax)} × ${diffDays}일 × 0.022% = ${krw(latePayTax)}<br>
        <strong>가산세 합계:</strong> ${krw(nonFilingFinal)} + ${krw(latePayTax)} = ${krw(totalPenalty)}<br>
        <strong>최종 납부 예상액:</strong> ${krw(originalTax)} + ${krw(totalPenalty)} = ${krw(grandTotal)}
    `;

    document.getElementById('penaltyResult').classList.remove('hidden');
}
