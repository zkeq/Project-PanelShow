import { useState, useEffect } from 'react';
import { executeJsCode } from '@/lib/api';

interface UseExecuteCodeResult {
  value: string;
  loading: boolean;
  error: string | null;
}

/**
 * 执行 JS 代码并返回结果的 Hook
 * @param code - 要执行的 JS 代码
 * @param fallback - 代码执行失败时的回退值
 * @returns 执行结果、加载状态和错误信息
 */
export function useExecuteCode(code: string | undefined, fallback: string = ''): UseExecuteCodeResult {
  const [value, setValue] = useState<string>(fallback);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code || code.trim() === '') {
      setValue(fallback);
      return;
    }

    let cancelled = false;

    const execute = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await executeJsCode(code);

        if (cancelled) return;

        if (response.success) {
          // 将结果转换为字符串
          const resultStr = response.result !== null && response.result !== undefined
            ? String(response.result)
            : fallback;
          setValue(resultStr);
        } else {
          setError('执行失败');
          setValue(fallback);
        }
      } catch (err) {
        if (cancelled) return;

        setError(err instanceof Error ? err.message : '执行出错');
        setValue(fallback);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    execute();

    return () => {
      cancelled = true;
    };
  }, [code, fallback]);

  return { value, loading, error };
}
