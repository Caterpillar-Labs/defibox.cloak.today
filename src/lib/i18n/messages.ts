// src/lib/i18n/messages.ts
import type { AppLocale } from "../../types/localeTypes";

export type MessageKey =
  | "hero.title"
  | "hero.subtitle"
  | "wallet.notConnected"
  | "wallet.connected"
  | "wallet.connect"
  | "wallet.refreshBalances"
  | "wallet.disconnect"
  | "wallet.working"
  | "wallet.notRunning"
  | "wallet.connectionClosed"
  | "wallet.loginDeclined"
  | "swap.title"
  | "swap.refreshMarkets"
  | "swap.loading"
  | "swap.payment"
  | "swap.received"
  | "swap.submit"
  | "swap.submitting"
  | "swap.connectFirst"
  | "swap.invalidSlippage"
  | "swap.success"
  | "swap.failedPrefix"
  | "details.title"
  | "details.show"
  | "details.hide"
  | "details.price"
  | "details.poolDepth"
  | "details.fee"
  | "details.minOutput"
  | "details.slippage"
  | "details.bps"
  | "details.memoPlaceholder"
  | "token.selectToken"
  | "token.searchPlaceholder"
  | "token.noTokens"
  | "token.close"
  | "token.amountPlaceholder"
  | "balance.label"
  | "theme.switchToLight"
  | "theme.switchToDark"
  | "theme.light"
  | "theme.dark"
  | "audit.notice"
  | "audit.viewReport"
  | "zactions.title"
  | "zactions.empty"
  | "switchDirection.aria"
  | "language.selector"
  | "language.en"
  | "language.zh"
  | "language.ko"
  | "language.ru";

type MessageCatalog = Record<MessageKey, string>;

const en: MessageCatalog = {
  "hero.title": "Defibox CLOAKed Swap",
  "hero.subtitle": "Direct-pair swaps through swap.defi with full privacy. Because #PrivacyMatters.",
  "wallet.notConnected": "Wallet not connected",
  "wallet.connected": "Connected: {handle}",
  "wallet.connect": "Connect CLOAK",
  "wallet.refreshBalances": "Refresh balances",
  "wallet.disconnect": "Disconnect",
  "wallet.working": "Working...",
  "wallet.notRunning": "CLOAK wallet not running",
  "wallet.connectionClosed": "CLOAK wallet connection closed",
  "wallet.loginDeclined": "Login declined by wallet",
  "swap.title": "Swap",
  "swap.refreshMarkets": "Refresh markets",
  "swap.loading": "Loading...",
  "swap.payment": "Payment",
  "swap.received": "Received",
  "swap.submit": "Swap with CLOAK",
  "swap.submitting": "Submitting...",
  "swap.connectFirst": "Connect wallet first",
  "swap.invalidSlippage": "Invalid slippage bps.",
  "swap.success": "Swap submitted successfully.",
  "swap.failedPrefix": "Swap failed: ",
  "details.title": "Details",
  "details.show": "Show",
  "details.hide": "Hide",
  "details.price": "Price",
  "details.poolDepth": "Pool depth",
  "details.fee": "Fee",
  "details.minOutput": "Min output memo units",
  "details.slippage": "Slippage protection",
  "details.bps": "bps",
  "details.memoPlaceholder": "swap,<min_out_units>,<pair_id>",
  "token.selectToken": "Select token",
  "token.searchPlaceholder": "Search by symbol or contract...",
  "token.noTokens": "No tokens found.",
  "token.close": "Close token selector",
  "token.amountPlaceholder": "Please enter amount",
  "balance.label": "Bal. :",
  "theme.switchToLight": "Switch to light mode",
  "theme.switchToDark": "Switch to dark mode",
  "theme.light": "Light",
  "theme.dark": "Dark",
  "audit.notice": "Audited by PeckShield and Slowmist",
  "audit.viewReport": "View report>",
  "zactions.title": "Current zactions preview",
  "zactions.empty": "Enter an amount to build zactions.",
  "switchDirection.aria": "Switch swap direction",
  "language.selector": "Language",
  "language.en": "English",
  "language.zh": "Chinese",
  "language.ko": "Korean",
  "language.ru": "Russian",
};

const zh: MessageCatalog = {
  "hero.title": "Defibox CLOAK 兑换",
  "hero.subtitle": "通过 swap.defi 直接交易对兑换，全程隐私保护。#PrivacyMatters",
  "wallet.notConnected": "钱包未连接",
  "wallet.connected": "已连接：{handle}",
  "wallet.connect": "连接 CLOAK",
  "wallet.refreshBalances": "刷新余额",
  "wallet.disconnect": "断开连接",
  "wallet.working": "处理中...",
  "wallet.notRunning": "CLOAK 钱包未运行",
  "wallet.connectionClosed": "CLOAK 钱包连接已关闭",
  "wallet.loginDeclined": "钱包拒绝了登录",
  "swap.title": "兑换",
  "swap.refreshMarkets": "刷新市场",
  "swap.loading": "加载中...",
  "swap.payment": "支付",
  "swap.received": "收到",
  "swap.submit": "使用 CLOAK 兑换",
  "swap.submitting": "提交中...",
  "swap.connectFirst": "请先连接钱包",
  "swap.invalidSlippage": "滑点 bps 无效。",
  "swap.success": "兑换提交成功。",
  "swap.failedPrefix": "兑换失败：",
  "details.title": "详情",
  "details.show": "展开",
  "details.hide": "收起",
  "details.price": "价格",
  "details.poolDepth": "池深度",
  "details.fee": "手续费",
  "details.minOutput": "最小输出 memo 单位",
  "details.slippage": "滑点保护",
  "details.bps": "bps",
  "details.memoPlaceholder": "swap,<min_out_units>,<pair_id>",
  "token.selectToken": "选择代币",
  "token.searchPlaceholder": "按符号或合约搜索...",
  "token.noTokens": "未找到代币。",
  "token.close": "关闭代币选择器",
  "token.amountPlaceholder": "请输入数量",
  "balance.label": "余额：",
  "theme.switchToLight": "切换到浅色模式",
  "theme.switchToDark": "切换到深色模式",
  "theme.light": "浅色",
  "theme.dark": "深色",
  "audit.notice": "由 PeckShield 和 Slowmist 审计",
  "audit.viewReport": "查看报告>",
  "zactions.title": "当前 zactions 预览",
  "zactions.empty": "输入数量以生成 zactions。",
  "switchDirection.aria": "切换兑换方向",
  "language.selector": "语言",
  "language.en": "英语",
  "language.zh": "中文",
  "language.ko": "韩语",
  "language.ru": "俄语",
};

const ko: MessageCatalog = {
  "hero.title": "Defibox CLOAK 스왑",
  "hero.subtitle": "swap.defi를 통한 직접 페어 스왑, 완전한 프라이버시. #PrivacyMatters",
  "wallet.notConnected": "지갑이 연결되지 않음",
  "wallet.connected": "연결됨: {handle}",
  "wallet.connect": "CLOAK 연결",
  "wallet.refreshBalances": "잔액 새로고침",
  "wallet.disconnect": "연결 해제",
  "wallet.working": "처리 중...",
  "wallet.notRunning": "CLOAK 지갑이 실행되지 않음",
  "wallet.connectionClosed": "CLOAK 지갑 연결이 종료됨",
  "wallet.loginDeclined": "지갑에서 로그인이 거부됨",
  "swap.title": "스왑",
  "swap.refreshMarkets": "마켓 새로고침",
  "swap.loading": "로딩 중...",
  "swap.payment": "지불",
  "swap.received": "수령",
  "swap.submit": "CLOAK으로 스왑",
  "swap.submitting": "제출 중...",
  "swap.connectFirst": "먼저 지갑을 연결하세요",
  "swap.invalidSlippage": "슬리피지 bps가 유효하지 않습니다.",
  "swap.success": "스왑이 성공적으로 제출되었습니다.",
  "swap.failedPrefix": "스왑 실패: ",
  "details.title": "세부 정보",
  "details.show": "표시",
  "details.hide": "숨기기",
  "details.price": "가격",
  "details.poolDepth": "풀 깊이",
  "details.fee": "수수료",
  "details.minOutput": "최소 출력 memo 단위",
  "details.slippage": "슬리피지 보호",
  "details.bps": "bps",
  "details.memoPlaceholder": "swap,<min_out_units>,<pair_id>",
  "token.selectToken": "토큰 선택",
  "token.searchPlaceholder": "심볼 또는 컨트랙트로 검색...",
  "token.noTokens": "토큰을 찾을 수 없습니다.",
  "token.close": "토큰 선택기 닫기",
  "token.amountPlaceholder": "수량을 입력하세요",
  "balance.label": "잔액:",
  "theme.switchToLight": "라이트 모드로 전환",
  "theme.switchToDark": "다크 모드로 전환",
  "theme.light": "라이트",
  "theme.dark": "다크",
  "audit.notice": "PeckShield 및 Slowmist 감사 완료",
  "audit.viewReport": "보고서 보기>",
  "zactions.title": "현재 zactions 미리보기",
  "zactions.empty": "zactions를 생성하려면 수량을 입력하세요.",
  "switchDirection.aria": "스왑 방향 전환",
  "language.selector": "언어",
  "language.en": "영어",
  "language.zh": "중국어",
  "language.ko": "한국어",
  "language.ru": "러시아어",
};

const ru: MessageCatalog = {
  "hero.title": "Defibox CLOAK обмен",
  "hero.subtitle": "Прямой обмен пар через swap.defi с полной приватностью. #PrivacyMatters",
  "wallet.notConnected": "Кошелек не подключен",
  "wallet.connected": "Подключено: {handle}",
  "wallet.connect": "Подключить CLOAK",
  "wallet.refreshBalances": "Обновить балансы",
  "wallet.disconnect": "Отключить",
  "wallet.working": "Обработка...",
  "wallet.notRunning": "Кошелек CLOAK не запущен",
  "wallet.connectionClosed": "Соединение с кошельком CLOAK закрыто",
  "wallet.loginDeclined": "Вход отклонен кошельком",
  "swap.title": "Обмен",
  "swap.refreshMarkets": "Обновить рынки",
  "swap.loading": "Загрузка...",
  "swap.payment": "Оплата",
  "swap.received": "Получение",
  "swap.submit": "Обмен через CLOAK",
  "swap.submitting": "Отправка...",
  "swap.connectFirst": "Сначала подключите кошелек",
  "swap.invalidSlippage": "Недопустимое значение slippage bps.",
  "swap.success": "Обмен успешно отправлен.",
  "swap.failedPrefix": "Ошибка обмена: ",
  "details.title": "Детали",
  "details.show": "Показать",
  "details.hide": "Скрыть",
  "details.price": "Цена",
  "details.poolDepth": "Глубина пула",
  "details.fee": "Комиссия",
  "details.minOutput": "Мин. единицы memo на выходе",
  "details.slippage": "Защита от проскальзывания",
  "details.bps": "bps",
  "details.memoPlaceholder": "swap,<min_out_units>,<pair_id>",
  "token.selectToken": "Выбрать токен",
  "token.searchPlaceholder": "Поиск по символу или контракту...",
  "token.noTokens": "Токены не найдены.",
  "token.close": "Закрыть выбор токена",
  "token.amountPlaceholder": "Введите сумму",
  "balance.label": "Бал.:",
  "theme.switchToLight": "Переключить на светлую тему",
  "theme.switchToDark": "Переключить на темную тему",
  "theme.light": "Светлая",
  "theme.dark": "Темная",
  "audit.notice": "Проверено PeckShield и Slowmist",
  "audit.viewReport": "Смотреть отчет>",
  "zactions.title": "Предпросмотр текущих zactions",
  "zactions.empty": "Введите сумму для создания zactions.",
  "switchDirection.aria": "Сменить направление обмена",
  "language.selector": "Язык",
  "language.en": "Английский",
  "language.zh": "Китайский",
  "language.ko": "Корейский",
  "language.ru": "Русский",
};

export const messages: Record<AppLocale, MessageCatalog> = { en, zh, ko, ru };

export function translate(locale: AppLocale, key: MessageKey, vars?: Record<string, string>): string {
  const template = messages[locale][key] ?? messages.en[key] ?? key;
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, value),
    template,
  );
}
