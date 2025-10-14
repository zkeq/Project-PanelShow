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
          // 增加请求计数
          activeRequests++;

          const response = await executeJsCode(code);

          // 减少请求计数并处理队列
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
          // 减少请求计数并处理队列
          activeRequests--;
          executeNextInQueue();

          if (cancelled) return;

          const errorMessage = err instanceof Error ? err.message : '执行出错';
          const isNetworkError = errorMessage.includes('Failed to fetch')
            || errorMessage.includes('NetworkError')
            || errorMessage.includes('CORS')
            || errorMessage.includes('ERR_FAILED');

          const isLastAttempt = attempt === maxRetries;

          // 如果是网络/CORS错误，不要重试,直接失败
          if (isNetworkError || isLastAttempt) {
            setError(errorMessage);
            setValue(fallback);
            setLoading(false);
            return; // 停止重试
          } else {
            await delay(500 * (attempt + 1));
          }
        }
      }
    };

    // 如果当前活跃请求数已达上限，加入队列
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
