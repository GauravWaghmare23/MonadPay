export const SIDEBET_ADDRESS =
  "0x8134A534dEF0443effC2131A5E646Bd48dFA4a1C";

export const USDC_ADDRESS =
  "0xfFB32F67C717077702a012971CE4d8785a02BaD4";

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
