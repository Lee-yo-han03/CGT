"""
TaxEasy Global - 다중 증권사 파일 파서 모듈
============================================
지원 증권사: 한국투자증권, 키움증권, 미래에셋증권, 삼성증권, NH투자증권, 토스증권
지원 파일: PDF, XLSX, XLS, CSV
"""

import re
from pathlib import Path
from datetime import datetime

import pdfplumber
import pandas as pd


# ============================================================
# 유틸리티
# ============================================================

def clean_str(v):
    if v is None: return ''
    return str(v).replace('\n', '').strip()

def parse_num(v):
    s = clean_str(v)
    if not s or s == '-': return 0
    s = s.replace(',', '').replace(' ', '')
    try: return float(s)
    except: return 0

def parse_date(v):
    if not v: return ''
    if isinstance(v, datetime): return v.strftime('%Y-%m-%d')
    s = str(v).replace('.', '-').replace('/', '-').strip()
    if len(s) >= 10: return s[:10]
    if len(s) == 8 and s.isdigit(): return f'{s[:4]}-{s[4:6]}-{s[6:8]}'
    return s

def detect_country(code):
    code = str(code).upper()
    prefixes = {'US':'US','KY':'US','JP':'JP','HK':'HK','GB':'GB','DE':'DE',
                'FR':'FR','CA':'CA','AU':'AU','CN':'CN','TW':'TW','SG':'SG'}
    for p, c in prefixes.items():
        if code.startswith(p): return c
    return 'US'


# ============================================================
# 기본 파서 인터페이스
# ============================================================

class BaseBrokerParser:
    """증권사 파서 기본 클래스"""
    BROKER_NAME = 'Unknown'

    def parse_pdf(self, path: str) -> list:
        raise NotImplementedError

    def parse_excel(self, path: str) -> list:
        return GenericExcelParser().parse(path)

    def parse_csv(self, path: str) -> list:
        return GenericExcelParser().parse(path)

    def parse(self, path: str) -> dict:
        ext = Path(path).suffix.lower()
        if ext == '.pdf':
            trades = self.parse_pdf(path)
        elif ext in ('.xlsx', '.xls'):
            trades = self.parse_excel(path)
        elif ext in ('.csv', '.tsv'):
            trades = self.parse_csv(path)
        else:
            raise ValueError(f'지원하지 않는 파일 형식: {ext}')
        return {'broker': self.BROKER_NAME, 'trades': trades, 'count': len(trades)}


# ============================================================
# 범용 Excel/CSV 파서
# ============================================================

class GenericExcelParser:
    """
    범용 엑셀/CSV 파서 - 컬럼명 자동 감지로 대부분의 증권사 형식 처리
    """
    COL_ALIASES = {
        'stock_name': ['주식 종목명','주식종목명','종목명','종목','stock_name','Stock Name','name'],
        'stock_code': ['주식종목코드','종목코드','ISIN','isin','국제증권식별번호','stock_code',
                       'ISIN코드','종목코드(ISIN)','ISIN 코드'],
        'shares': ['양도주식수','양도주식 수','취득유형별 양도주식 수','수량','매도수량',
                   'shares','Quantity','Qty'],
        'sell_date': ['양도일자','매도일자','매도일','sell_date','Sell Date','양도 일자'],
        'sell_pps': ['주당양도가액','주당매도가액','매도단가','sell_price','Sell Price'],
        'sell_total': ['양도가액','매도금액','매도대금','sell_amount','Sell Amount'],
        'buy_date': ['취득일자','매수일자','매수일','buy_date','Buy Date','취득 일자'],
        'buy_pps': ['주당취득가액','주당매수가액','매수단가','buy_price','Buy Price'],
        'buy_total': ['취득가액','매수금액','매수대금','buy_amount','Buy Amount'],
        'expenses': ['제비용','필요경비','수수료','expenses','Commission','Fee','비용'],
        'country': ['국외자산국가코드','국가코드','country','Country','국가'],
        'profit_loss': ['손익','비용차감 후 손익','profit_loss','P&L','손익금액','양도차익'],
    }

    def parse(self, path: str) -> list:
        ext = Path(path).suffix.lower()
        if ext in ('.csv', '.tsv'):
            sep = '\t' if ext == '.tsv' else ','
            df = pd.read_csv(path, sep=sep, header=0, dtype=str)
        else:
            df = pd.read_excel(path, header=0, dtype=str)

        col_map = self._detect_columns(df.columns)
        trades = []
        for _, row in df.iterrows():
            t = self._map_row(row, col_map)
            if t and t['shares'] > 0:
                trades.append(t)
        return trades

    def _detect_columns(self, columns):
        mapping = {}
        cols_norm = {}
        for c in columns:
            norm = str(c).replace('\n', ' ').replace('\r', '').strip()
            cols_norm[norm] = c

        for field, aliases in self.COL_ALIASES.items():
            for alias in aliases:
                for norm_name, orig in cols_norm.items():
                    if alias.lower() in norm_name.lower() or norm_name.lower() in alias.lower():
                        if field not in mapping:
                            mapping[field] = orig
                        break
        return mapping

    def _map_row(self, row, col_map):
        def get(field, default=''):
            if field in col_map:
                v = row.get(col_map[field])
                return v if pd.notna(v) and v != '' else default
            return default

        name = clean_str(get('stock_name'))
        if not name: return None

        shares = parse_num(get('shares'))
        sell_total = int(round(parse_num(get('sell_total'))))
        buy_total = int(round(parse_num(get('buy_total'))))
        expenses = int(round(parse_num(get('expenses'))))
        pl_raw = parse_num(get('profit_loss'))
        pl = int(round(pl_raw)) if pl_raw else sell_total - buy_total - expenses

        code = clean_str(get('stock_code'))

        return {
            'stock_name': name,
            'stock_code': code,
            'stock_type_code': '61',
            'shares': shares,
            'sell_date': parse_date(get('sell_date')),
            'sell_price_per_share': parse_num(get('sell_pps')),
            'sell_total': sell_total,
            'buy_date': parse_date(get('buy_date')),
            'buy_price_per_share': parse_num(get('buy_pps')),
            'buy_total': buy_total,
            'expenses': expenses,
            'profit_loss': pl,
            'country_code': clean_str(get('country')) or detect_country(code),
        }


# ============================================================
# 한국투자증권 파서
# ============================================================

class KoreaInvestmentParser(BaseBrokerParser):
    BROKER_NAME = '한국투자증권'

    def parse_pdf(self, path: str) -> list:
        trades = []
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                for table in (page.extract_tables() or []):
                    if not table or len(table) < 1: continue
                    cols = len(table[0]) if table[0] else 0
                    if cols == 11:
                        is_hdr = any('종목명' in str(c) for c in table[0] if c)
                        for row in (table[1:] if is_hdr else table):
                            t = self._parse_trade_row(row)
                            if t: trades.append(t)
        return trades

    def _parse_trade_row(self, row):
        if len(row) < 11: return None
        name = clean_str(row[0])
        if not name or '합' in name: return None
        shares = parse_num(row[3])
        sell_total = int(round(parse_num(row[6])))
        buy_total = int(round(parse_num(row[8])))
        expenses = int(round(parse_num(row[9])))
        if shares <= 0 and sell_total <= 0: return None
        code = clean_str(row[1])
        return {
            'stock_name': name, 'stock_code': code,
            'stock_type_code': clean_str(row[2]) or '61',
            'shares': shares,
            'sell_date': parse_date(clean_str(row[4])),
            'sell_price_per_share': parse_num(row[5]),
            'sell_total': sell_total,
            'buy_date': '',
            'buy_price_per_share': parse_num(row[7]),
            'buy_total': buy_total,
            'expenses': expenses,
            'profit_loss': int(round(parse_num(row[10]))),
            'country_code': detect_country(code),
        }


# ============================================================
# 키움증권 파서
# ============================================================

class KiwoomParser(BaseBrokerParser):
    """
    키움증권 해외주식 양도소득세 계산내역
    PDF 형식: 종목명, 종목코드, 매도일자, 매수일자, 수량, 매도단가, 매수단가,
              매도금액(원화), 매수금액(원화), 수수료, 세금, 손익
    Excel: 유사한 컬럼 구성
    """
    BROKER_NAME = '키움증권'

    def parse_pdf(self, path: str) -> list:
        trades = []
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                for table in (page.extract_tables() or []):
                    if not table or len(table) < 2: continue
                    cols = len(table[0]) if table[0] else 0
                    if cols < 8: continue

                    header_row = None
                    for i, row in enumerate(table):
                        row_str = ' '.join(str(c) for c in row if c)
                        if '종목' in row_str and ('양도' in row_str or '매도' in row_str):
                            header_row = i
                            break

                    start = (header_row + 1) if header_row is not None else 0
                    for row in table[start:]:
                        t = self._try_parse_row(row, cols)
                        if t: trades.append(t)
        return trades

    def _try_parse_row(self, row, cols):
        """키움증권 PDF 행 파싱 - 다양한 컬럼 수에 대응"""
        name = clean_str(row[0])
        if not name or any(kw in name for kw in ['합계','소계','종목명','총']): return None

        # 키움 표준: 종목명, 코드, 매도일, 매수일, 수량, 매도금액, 매수금액, 수수료, 손익
        if cols >= 10:
            code = clean_str(row[1])
            shares = parse_num(row[4])
            if shares <= 0: return None
            return {
                'stock_name': name, 'stock_code': code,
                'stock_type_code': '61', 'shares': shares,
                'sell_date': parse_date(clean_str(row[2])),
                'sell_price_per_share': parse_num(row[5]),
                'sell_total': int(round(parse_num(row[6]))),
                'buy_date': parse_date(clean_str(row[3])),
                'buy_price_per_share': parse_num(row[7]),
                'buy_total': int(round(parse_num(row[8]))),
                'expenses': int(round(parse_num(row[9]))),
                'profit_loss': int(round(parse_num(row[-1]))) if cols > 10 else 0,
                'country_code': detect_country(code),
            }
        elif cols >= 8:
            code = clean_str(row[1])
            shares = parse_num(row[3])
            if shares <= 0: return None
            sell_total = int(round(parse_num(row[5])))
            buy_total = int(round(parse_num(row[6])))
            expenses = int(round(parse_num(row[7])))
            return {
                'stock_name': name, 'stock_code': code,
                'stock_type_code': '61', 'shares': shares,
                'sell_date': parse_date(clean_str(row[2])),
                'sell_price_per_share': 0,
                'sell_total': sell_total,
                'buy_date': '',
                'buy_price_per_share': 0,
                'buy_total': buy_total,
                'expenses': expenses,
                'profit_loss': sell_total - buy_total - expenses,
                'country_code': detect_country(code),
            }
        return None


# ============================================================
# 미래에셋증권 파서
# ============================================================

class MiraeAssetParser(BaseBrokerParser):
    """
    미래에셋증권 해외주식 양도소득세 계산내역
    PDF/Excel 형식이 한국투자증권과 유사하나 컬럼 순서 차이 있음
    """
    BROKER_NAME = '미래에셋증권'

    def parse_pdf(self, path: str) -> list:
        trades = []
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                for table in (page.extract_tables() or []):
                    if not table or len(table) < 2: continue
                    cols = len(table[0]) if table[0] else 0
                    if cols < 8: continue
                    header_idx = self._find_header(table)
                    start = (header_idx + 1) if header_idx is not None else 0
                    for row in table[start:]:
                        t = self._try_parse(row, cols)
                        if t: trades.append(t)
        return trades

    def _find_header(self, table):
        for i, row in enumerate(table):
            s = ' '.join(str(c) for c in row if c)
            if '종목' in s and ('양도' in s or '매도' in s or '취득' in s):
                return i
        return None

    def _try_parse(self, row, cols):
        name = clean_str(row[0])
        if not name or any(kw in name for kw in ['합계','소계','종목명','총','비고']): return None

        # 미래에셋 형식: 종목명, 코드, 수량, 매도일, 매도금액, 취득일, 취득금액, 비용, 손익
        if cols >= 9:
            code = clean_str(row[1])
            shares = parse_num(row[2])
            if shares <= 0: return None
            sell_total = int(round(parse_num(row[4])))
            buy_total = int(round(parse_num(row[6])))
            expenses = int(round(parse_num(row[7])))
            return {
                'stock_name': name, 'stock_code': code,
                'stock_type_code': '61', 'shares': shares,
                'sell_date': parse_date(clean_str(row[3])),
                'sell_price_per_share': int(round(sell_total / shares)) if shares else 0,
                'sell_total': sell_total,
                'buy_date': parse_date(clean_str(row[5])),
                'buy_price_per_share': int(round(buy_total / shares)) if shares else 0,
                'buy_total': buy_total,
                'expenses': expenses,
                'profit_loss': int(round(parse_num(row[8]))) if cols > 8 else sell_total - buy_total - expenses,
                'country_code': detect_country(code),
            }
        return None


# ============================================================
# 삼성증권 파서
# ============================================================

class SamsungParser(BaseBrokerParser):
    BROKER_NAME = '삼성증권'

    def parse_pdf(self, path: str) -> list:
        # 삼성증권도 유사한 테이블 형태
        return self._generic_pdf_parse(path)

    def _generic_pdf_parse(self, path: str) -> list:
        trades = []
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                for table in (page.extract_tables() or []):
                    if not table or len(table) < 2: continue
                    cols = len(table[0]) if table[0] else 0
                    if cols < 7: continue
                    for row in table:
                        name = clean_str(row[0])
                        if not name or any(kw in name for kw in ['합계','소계','종목명','총','비고','주식']): continue
                        shares = parse_num(row[2] if cols > 3 else row[1])
                        if shares <= 0: continue
                        t = self._flexible_parse(row, cols, name)
                        if t: trades.append(t)
        return trades

    def _flexible_parse(self, row, cols, name):
        """유연한 파싱 - 컬럼 수에 따라 적응"""
        code = clean_str(row[1]) if cols > 1 else ''
        nums = [parse_num(row[i]) for i in range(2, cols)]
        shares = nums[0] if nums else 0
        if shares <= 0: return None

        sell_total = int(round(nums[2])) if len(nums) > 2 else 0
        buy_total = int(round(nums[4])) if len(nums) > 4 else 0
        expenses = int(round(nums[5])) if len(nums) > 5 else 0

        return {
            'stock_name': name, 'stock_code': code,
            'stock_type_code': '61', 'shares': shares,
            'sell_date': parse_date(clean_str(row[3])) if cols > 3 else '',
            'sell_price_per_share': int(round(nums[1])) if len(nums) > 1 else 0,
            'sell_total': sell_total,
            'buy_date': parse_date(clean_str(row[5])) if cols > 5 else '',
            'buy_price_per_share': int(round(nums[3])) if len(nums) > 3 else 0,
            'buy_total': buy_total,
            'expenses': expenses,
            'profit_loss': sell_total - buy_total - expenses,
            'country_code': detect_country(code),
        }


# ============================================================
# NH투자증권 / 토스증권 파서 (범용 기반)
# ============================================================

class NHParser(BaseBrokerParser):
    BROKER_NAME = 'NH투자증권'
    def parse_pdf(self, path): return KoreaInvestmentParser().parse_pdf(path)  # 유사 형태

class TossParser(BaseBrokerParser):
    BROKER_NAME = '토스증권'
    def parse_pdf(self, path): return KoreaInvestmentParser().parse_pdf(path)


# ============================================================
# 자동 감지 파서 (브로커 자동 판별)
# ============================================================

class AutoDetectParser:
    """파일 내용을 분석하여 증권사를 자동 감지하고 적절한 파서를 선택"""

    PARSERS = {
        'koreainvestment': KoreaInvestmentParser,
        'kiwoom': KiwoomParser,
        'mirae': MiraeAssetParser,
        'samsung': SamsungParser,
        'nh': NHParser,
        'toss': TossParser,
    }

    BROKER_KEYWORDS = {
        '한국투자증권': 'koreainvestment',
        'KOREA INVESTMENT': 'koreainvestment',
        '키움증권': 'kiwoom',
        'KIWOOM': 'kiwoom',
        '미래에셋': 'mirae',
        'MIRAE ASSET': 'mirae',
        '삼성증권': 'samsung',
        'SAMSUNG': 'samsung',
        'NH투자': 'nh',
        'NH INVESTMENT': 'nh',
        '토스증권': 'toss',
        'TOSS': 'toss',
    }

    def detect_broker(self, path: str) -> str:
        ext = Path(path).suffix.lower()
        text = ''

        if ext == '.pdf':
            try:
                with pdfplumber.open(path) as pdf:
                    if pdf.pages:
                        text = pdf.pages[0].extract_text() or ''
            except:
                pass
        elif ext in ('.xlsx', '.xls'):
            try:
                df = pd.read_excel(path, header=None, nrows=5)
                text = df.to_string()
            except:
                pass
        elif ext in ('.csv', '.tsv'):
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    text = f.read(2000)
            except:
                pass

        text_upper = text.upper()
        for keyword, broker_id in self.BROKER_KEYWORDS.items():
            if keyword.upper() in text_upper:
                return broker_id

        return 'auto'

    def parse(self, path: str, broker_hint: str = None) -> dict:
        broker_id = broker_hint or self.detect_broker(path)

        if broker_id in self.PARSERS:
            parser = self.PARSERS[broker_id]()
        else:
            parser = KoreaInvestmentParser()

        ext = Path(path).suffix.lower()
        if ext == '.pdf':
            trades = parser.parse_pdf(path)
        elif ext in ('.xlsx', '.xls', '.csv', '.tsv'):
            trades = GenericExcelParser().parse(path)
        else:
            raise ValueError(f'지원하지 않는 파일: {ext}')

        return {
            'broker': parser.BROKER_NAME,
            'broker_id': broker_id,
            'trades': trades,
            'count': len(trades),
            'file': str(Path(path).name),
        }
