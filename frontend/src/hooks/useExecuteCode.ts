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
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const execute = async () => {
      setLoading(true);
      setError(null);

      const maxRetries = 2;

      for (let attempt = 0; attempt <= maxRetries && !cancelled; attempt++) {
        try {
          const response = await executeJsCode(code);

          if (cancelled) return;

          if (response.success) {
            const resultStr = response.result !== null && response.result !== undefined
              ? String(response.result)
              : fallback;
            setValue(resultStr);
            setLoading(false);
            setError(null);
            return;
          }

          throw new Error('执行失败');
        } catch (err) {
          if (cancelled) return;

          const isLastAttempt = attempt === maxRetries;
          if (isLastAttempt) {
            setError(err instanceof Error ? err.message : '执行出错');
            setValue(fallback);
            setLoading(false);
          } else {
            await delay(500 * (attempt + 1));
          }
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
