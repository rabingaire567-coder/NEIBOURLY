import { beforeEach, describe, expect, it } from 'vitest';
import { readJson, removeKey, storageKey, uid, writeJson, clearAll, hasUserData } from '@/lib/storage';

describe('uid', () => {
  it('does not repeat', () => {
    const ids = new Set(Array.from({ length: 500 }, () => uid('post')));
    expect(ids.size).toBe(500);
  });

  it('keeps the prefix and stays safe in a URL', () => {
    const id = uid('post');
    expect(id.startsWith('post-')).toBe(true);
    expect(id).not.toMatch(/[/\\?#%]/);
  });
});

describe('readJson and writeJson', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('survives a full round trip', () => {
    writeJson('round-trip', { a: 1, b: ['x'] });
    expect(readJson('round-trip', null)).toEqual({ a: 1, b: ['x'] });
  });

  it('falls back when a key is missing', () => {
    expect(readJson('never-written', 'default')).toBe('default');
  });

  it('falls back when stored JSON is corrupt', () => {
    localStorage.setItem(storageKey('broken'), '{not json');
    expect(readJson('broken', 'safe')).toBe('safe');
  });
});

describe('removeKey', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('leaves other keys alone', () => {
    writeJson('keep-me', 1);
    writeJson('remove-me', 2);
    removeKey('remove-me');
    expect(readJson('remove-me', null)).toBeNull();
    expect(readJson('keep-me', null)).toBe(1);
  });
});

describe('clearAll', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('empties every owned key and reports the change', () => {
    writeJson('posts', [1, 2, 3]);
    writeJson('settings', { lang: 'ne' });
    expect(hasUserData()).toBe(true);
    clearAll();
    expect(hasUserData()).toBe(false);
  });
});
