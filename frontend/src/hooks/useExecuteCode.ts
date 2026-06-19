import { useState, useEffect } from 'react';
import { executeJsCode } from '@/lib/api';

interface UseExecuteCodeResult {
  value: string;
  loading: boolean;
  error: string | null;
}

// 全局请求队列，用于限制并发请求数量
let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 24;
const requestQueue: Array<() => void> = [];

function executeNextInQueue() {
  if (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
    const next = requestQueue.shift();
    if (next) next();
  }
}

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
      // 如果组件已卸载，跳过执行并让队列继续
      if (cancelled) {
        executeNextInQueue();
        return;
      }

      setLoading(true);
      setError(null);

      const maxRetries = 2;

      for (let attempt = 0; attempt <= maxRetries && !cancelled; attempt++) {
        try {
          activeRequests++;
          const response = await executeJsCode(code);
          activeRequests--;
          executeNextInQueue();

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
          activeRequests--;
          executeNextInQueue();

          if (cancelled) return;

          const errorMessage = err instanceof Error ? err.message : '执行出错';
          const isNetworkError = errorMessage.includes('Failed to fetch')
            || errorMessage.includes('NetworkError')
            || errorMessage.includes('CORS')
            || errorMessage.includes('ERR_FAILED');

          const isLastAttempt = attempt === maxRetries;

          if (isNetworkError || isLastAttempt) {
            setError(errorMessage);
            setValue(fallback);
            setLoading(false);
            return;
          } else {
            await delay(500 * (attempt + 1));
          }
        }
      }
    };

    if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
      requestQueue.push(execute);
    } else {
      execute();
    }

    return () => {
      cancelled = true;
    };
  }, [code, fallback]);

  return { value, loading, error };
}
