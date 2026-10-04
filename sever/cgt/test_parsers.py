"""Regression tests for broker detection and fail-closed PDF parsing."""
import contextlib
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest.mock import patch


def load_parser_module(pdf_pages):
    pdfplumber = types.ModuleType('pdfplumber')
    pdfplumber.open = lambda _path: contextlib.nullcontext(types.SimpleNamespace(pages=pdf_pages))
    pandas = types.ModuleType('pandas')
    pandas.DataFrame = object
    with patch.dict(sys.modules, {'pdfplumber': pdfplumber, 'pandas': pandas}):
        sys.path.insert(0, str(Path(__file__).parent))
        import parsers
        return parsers


class ParserRegressionTests(unittest.TestCase):
    def test_broker_detection_searches_all_pages(self):
        parser_module = load_parser_module([
            types.SimpleNamespace(extract_text=lambda: '연간 거래 내역'),
            types.SimpleNamespace(extract_text=lambda: '키움증권 해외주식'),
        ])
        with tempfile.NamedTemporaryFile(suffix='.pdf') as pdf:
            self.assertEqual(parser_module.AutoDetectParser().detect_broker(pdf.name), 'kiwoom')

    def test_unknown_broker_does_not_fall_back_to_korea_investment(self):
        parser_module = load_parser_module([
            types.SimpleNamespace(extract_text=lambda: 'Unknown brokerage statement'),
        ])
        with tempfile.NamedTemporaryFile(suffix='.pdf') as pdf:
            with self.assertRaisesRegex(ValueError, '증권사를 판별할 수 없는 PDF'):
                parser_module.AutoDetectParser().parse(pdf.name)

    def test_empty_supported_broker_pdf_returns_clear_error(self):
        parser_module = load_parser_module([
            types.SimpleNamespace(
                extract_text=lambda: '한국투자증권',
                extract_tables=lambda: [],
            ),
        ])
        with tempfile.NamedTemporaryFile(suffix='.pdf') as pdf:
            with self.assertRaisesRegex(ValueError, '거래를 찾지 못했습니다'):
                parser_module.AutoDetectParser().parse(pdf.name)

    def test_korea_investment_row_mapping_is_preserved(self):
        parser_module = load_parser_module([])
        row = ['Apple', 'US0378331005', '61', '2', '2024.05.01', '100',
               '200', '80', '160', '2', '38']
        trade = parser_module.KoreaInvestmentParser()._parse_trade_row(row)
        self.assertEqual(trade['stock_name'], 'Apple')
        self.assertEqual(trade['shares'], 2)
        self.assertEqual(trade['sell_total'], 200)
        self.assertEqual(trade['buy_total'], 160)
        self.assertEqual(trade['expenses'], 2)
        parser_module._validate_trades([trade], '한국투자증권')

    def test_incomplete_trade_is_rejected(self):
        parser_module = load_parser_module([])
        with self.assertRaisesRegex(ValueError, '수량'):
            parser_module._validate_trades([{
                'stock_name': 'Apple', 'shares': 0, 'sell_total': 100,
                'buy_total': 50, 'profit_loss': 50,
            }], '테스트 증권사')


if __name__ == '__main__':
    unittest.main()
