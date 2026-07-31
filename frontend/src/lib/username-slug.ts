import { pinyin } from 'pinyin-pro';

const MAX_SLUG_LENGTH = 20;

/**
 * 按长度截断 slug，保证不切断拼音音节（在连字符边界处截断），
 * 且结果不会以连字符结尾。
 */
function truncateSlug(slug: string, maxLength: number): string {
  if (slug.length <= maxLength) return slug;
  let cut = slug.slice(0, maxLength);
  // 优先在连字符边界截断，避免出现不完整的拼音音节
  const lastHyphen = cut.lastIndexOf('-');
  if (lastHyphen > 0) {
    cut = cut.slice(0, lastHyphen);
  }
  return cut.replace(/-+$/g, '');
}

/**
 * 将用户名（可能包含中文）转换为合法的站点地址 slug。
 *
 * 规则：
 * - 中文字符转为无声调拼音（如「张三」-> "zhangsan"）
 * - 其他非法字符（空格、符号等）统一折叠为连字符
 * - 结果只包含小写字母、数字、连字符，且不以连字符开头/结尾、不含连续连字符
 * - 站点地址长度限制为 3~20 个字符（与 SiteAddressInput 校验规则保持一致）
 *
 * 这样可避免用户主页 URL 出现很长的百分号编码（如 /project/%E5%BC%A0%E4%B8%89）。
 */
export function slugifyUsername(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  // 中文（含非 ASCII）转拼音，其余字符保持原样；toneType: 'none' 去掉声调
  const converted = pinyin(trimmed, {
    toneType: 'none',
    nonZh: 'consecutive',
  });

  const slug = converted
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // 非法字符折叠为连字符
    .replace(/-{2,}/g, '-') // 去掉连续连字符
    .replace(/^-+|-+$/g, ''); // 去掉首尾连字符

  return truncateSlug(slug, MAX_SLUG_LENGTH);
}
