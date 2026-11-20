/**
 * Persistence Operation Result Contract
 *
 * Encapsulates infrastructure result state with in-memory retention resilience.
 */

export type StorageErrorCode = 'QUOTA_EXCEEDED' | 'READ_ONLY' | 'DESERIALIZATION_ERROR' | 'UNKNOWN';

export interface StorageError {
  readonly code: StorageErrorCode;
  readonly message: string;
  readonly originalError?: unknown;
}

export interface StorageOperationResult<T> {
  readonly success: boolean;
  readonly data: T | null;
  readonly error: StorageError | null;
  readonly isRetainedInMemory: boolean;
}

export function createStorageSuccess<T>(
  data: T,
  isRetainedInMemory = false,
): StorageOperationResult<T> {
  return {
    success: true,
    data,
    error: null,
    isRetainedInMemory,
  };
}

export function createStorageFailure<T>(
  code: StorageErrorCode,
  message: string,
  originalError?: unknown,
  fallbackData: T | null = null,
): StorageOperationResult<T> {
  return {
    success: false,
    data: fallbackData,
    error: {
      code,
      message,
      originalError,
    },
    isRetainedInMemory: true,
  };
}
