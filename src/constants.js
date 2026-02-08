export const SIDEBET_ADDRESS =
  "0xE9e6CB225A5091399a03db4734b020400A113852";

export const USDC_ADDRESS =
  "0xeb091A84e4E1C8bbB4F9bFf4Cc74fD978256C0F4";

export const RESOLVER_ADDRESS =
  "0x37e7d89A399a9dBaa49085b800dE948bD1F1E606";

export const USDC_DECIMALS = 6;

export const SIDEBET_ABI = [
  "function betYes(uint256)",
  "function betNo(uint256)",
  "function totalYes() view returns (uint256)",
  "function totalNo() view returns (uint256)",
  "function resolved() view returns (bool)",
  "function outcome() view returns (bool)",
  "function resolve(bool)",
  "function claim()",
  "event BetPlaced(address indexed user, bool side, uint256 amount)",
  "event Resolved(bool outcome)",
  "event Claimed(address indexed user, uint256 payout)"
];

export const USDC_ABI = [
  "function approve(address,uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)"
];
