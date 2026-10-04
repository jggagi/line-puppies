(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.RentBackup = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const LISTINGS_KEY = 'sh_rental_map_listings';
  const CHECKLIST_KEY = 'sh_rental_map_checklist';
  const RECOVERY_KEY = 'sh_rental_map_recovery';
  const FORMAT = 'opc-rent';
  const VERSION = 1;
  const MAX_BYTES = 2 * 1024 * 1024;
  const MAX_LISTINGS = 1000;
  const MAX_NODES = 100000;
  const MAX_DEPTH = 16;
  const MAX_STRING = 20000;
  const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
  const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
  const NUMERIC_RANGES = {
    rent: [0, 10000000], area_sqm: [0, 100000], bedroom_count: [0, 20],
    dim_a: [0, 10], dim_b: [0, 10], dim_c: [0, 10], dim_d: [0, 10], dim_e: [0, 10],
    greenery_rate: [0, 1], plot_ratio: [0, 100], building_density: [0, 1],
    commute_peak_metro_min: [0, 10000], commute_peak_drive_min: [0, 10000], commute_score_swfc: [0, 10]
  };
  const BOOLEAN_FIELDS = new Set([
    'has_independent_study', 'rl_not_three_bed', 'rl_car_messy', 'rl_wfh-bad', 'rl_wfh_bad',
    'rl_property_bad', 'rl_lease_unstable', 'is_offline'
  ]);
  const STRING_FIELDS = new Set([
    'community', 'unit_id', 'floor', 'orientation', 'renovation', 'detail_url', 'layout_comment', 'lease_terms',
    'viewing_notes', 'noise_risk', 'greenery', 'car_pedestrian_separation', 'property_management',
    'community_atmosphere', 'daily_convenience', 'commute', 'commute_office', 'commute_metro', 'commute_bus',
    'commute_drive', 'commute_parking', 'parking_note', 'caveat', 'landlord_risk'
  ]);

  function fail(code, message) {
    const error = new Error(message);
    error.code = code;
    throw error;
  }

  function assertBoundedJson(value, state = { nodes: 0 }, depth = 0) {
    if (depth > MAX_DEPTH) fail('TOO_DEEP', 'JSON 嵌套过深');
    state.nodes += 1;
    if (state.nodes > MAX_NODES) fail('TOO_COMPLEX', 'JSON 字段数量过多');
    if (typeof value === 'string') {
      if (value.length > MAX_STRING) fail('STRING_TOO_LONG', '文本字段过长');
      return;
    }
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) fail('INVALID_NUMBER', '数值无效');
      return;
    }
    if (value === null || typeof value === 'boolean') return;
    if (Array.isArray(value)) {
      if (Object.getOwnPropertySymbols(value).length) fail('INVALID_OBJECT', 'JSON 数组包含非法字段');
      const descriptors = Object.getOwnPropertyDescriptors(value);
      for (let i = 0; i < value.length; i += 1) {
        if (!Object.prototype.hasOwnProperty.call(descriptors, String(i)) || !('value' in descriptors[i])) {
          fail('INVALID_OBJECT', 'JSON 数组结构无效');
        }
        assertBoundedJson(descriptors[i].value, state, depth + 1);
      }
      return;
    }
    if (typeof value !== 'object' || (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)) {
      fail('INVALID_OBJECT', '只接受普通 JSON 对象');
    }
    if (Object.getOwnPropertySymbols(value).length) fail('INVALID_OBJECT', 'JSON 对象包含非法字段');
    const descriptors = Object.getOwnPropertyDescriptors(value);
    for (const key of Object.keys(descriptors)) {
      if (DANGEROUS_KEYS.has(key)) fail('DANGEROUS_KEY', 'JSON 包含不安全字段名');
      if (!('value' in descriptors[key])) fail('INVALID_OBJECT', 'JSON 对象不能包含访问器字段');
      assertBoundedJson(descriptors[key].value, state, depth + 1);
    }
  }

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function safeHttpUrl(value) {
    if (typeof value !== 'string' || !value || value.length > 4096) return false;
    try {
      const url = new URL(value);
      return (url.protocol === 'http:' || url.protocol === 'https:') && !url.username && !url.password;
    } catch (_) {
      return false;
    }
  }

  function validateListings(value) {
    assertBoundedJson(value);
    if (!Array.isArray(value) || value.length > MAX_LISTINGS) fail('INVALID_LISTINGS', '房源列表格式无效或超过 1000 条');
    const ids = new Set();
    const listings = value.map((item) => {
      if (!item || Array.isArray(item) || typeof item !== 'object') fail('INVALID_LISTING', '房源记录格式无效');
      if (typeof item.id !== 'string' || !SAFE_ID.test(item.id)) fail('INVALID_ID', '房源 ID 格式无效');
      if (ids.has(item.id)) fail('DUPLICATE_ID', '房源 ID 重复');
      ids.add(item.id);
      if (typeof item.community !== 'string' || !item.community.trim()) fail('INVALID_LISTING', '小区名称不能为空');
      if (typeof item.unit_id !== 'string') fail('INVALID_LISTING', '房源标识格式无效');
      for (const key of ['rent', 'area_sqm', 'bedroom_count', 'dim_a', 'dim_b', 'dim_c', 'dim_d', 'dim_e']) {
        if (!Object.prototype.hasOwnProperty.call(item, key)) fail('MISSING_NUMBER', `缺少必需数值字段 ${key}`);
      }
      for (const key of STRING_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(item, key) && item[key] !== null && typeof item[key] !== 'string') {
          fail('INVALID_STRING', `文本字段 ${key} 格式无效`);
        }
      }
      for (const [key, range] of Object.entries(NUMERIC_RANGES)) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          if (typeof item[key] !== 'number' || !Number.isFinite(item[key]) || item[key] < range[0] || item[key] > range[1]) {
            fail('INVALID_NUMBER', `数值字段 ${key} 超出允许范围`);
          }
        }
      }
      for (const key of BOOLEAN_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(item, key) && typeof item[key] !== 'boolean') fail('INVALID_BOOLEAN', `布尔字段 ${key} 格式无效`);
      }
      for (const [key, fieldValue] of Object.entries(item)) {
        if (/(?:url|uri)$/i.test(key) && fieldValue !== null && fieldValue !== '' && !safeHttpUrl(fieldValue)) {
          fail('INVALID_URL', '链接只能使用无凭据的 HTTP(S) 地址');
        }
      }
      return cloneJson(item);
    });
    return listings;
  }

  function validateChecklist(value) {
    assertBoundedJson(value);
    if (!value || Array.isArray(value) || typeof value !== 'object') fail('INVALID_CHECKLIST', '看房清单格式无效');
    const result = {};
    for (const [listingId, items] of Object.entries(value)) {
      if (!SAFE_ID.test(listingId)) fail('INVALID_ID', '清单房源 ID 格式无效');
      if (!items || Array.isArray(items) || typeof items !== 'object') fail('INVALID_CHECKLIST', '清单项目格式无效');
      const safeItems = {};
      for (const [itemId, checked] of Object.entries(items)) {
        if (!SAFE_ID.test(itemId) || typeof checked !== 'boolean') fail('INVALID_CHECKLIST', '清单状态格式无效');
        safeItems[itemId] = checked;
      }
      result[listingId] = safeItems;
    }
    return result;
  }

  function validateState(listings, checklist) {
    return { listings: validateListings(listings), checklist: validateChecklist(checklist) };
  }

  function parseBackup(text) {
    if (typeof text !== 'string' || BufferLike.byteLength(text) > MAX_BYTES) fail('TOO_LARGE', '备份文件不能超过 2 MiB');
    let parsed;
    try { parsed = JSON.parse(text); } catch (_) { fail('INVALID_JSON', 'JSON 文件无法解析'); }
    assertBoundedJson(parsed);
    if (Array.isArray(parsed)) return { kind: 'legacy', listings: validateListings(parsed), checklist: null };
    if (!parsed || typeof parsed !== 'object' || parsed.format !== FORMAT || parsed.version !== VERSION) {
      fail('UNSUPPORTED_VERSION', '备份格式或版本不受支持');
    }
    if (!Object.prototype.hasOwnProperty.call(parsed, 'exportedAt') || typeof parsed.exportedAt !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(parsed.exportedAt) ||
        !Number.isFinite(Date.parse(parsed.exportedAt))) {
      fail('INVALID_BACKUP', '备份时间字段无效');
    }
    return { kind: 'full', listings: validateListings(parsed.listings), checklist: validateChecklist(parsed.checklist) };
  }

  function createEnvelope(listings, checklist, now = new Date()) {
    const state = validateState(listings, checklist);
    return { format: FORMAT, version: VERSION, exportedAt: now.toISOString(), listings: state.listings, checklist: state.checklist };
  }

  function readStoredState(storage, defaults = []) {
    let rawListings;
    let rawChecklist;
    try {
      rawListings = storage.getItem(LISTINGS_KEY);
      rawChecklist = storage.getItem(CHECKLIST_KEY);
    } catch (_) {
      return { ok: false, errorCode: 'STORAGE_UNAVAILABLE', rawListings: null, rawChecklist: null };
    }
    let parsedListings = null;
    let parsedChecklist = null;
    try {
      if (rawListings !== null) {
        if (BufferLike.byteLength(rawListings) > MAX_BYTES) fail('TOO_LARGE', '本地房源数据超过允许大小');
        parsedListings = JSON.parse(rawListings);
      }
      if (rawChecklist !== null) {
        if (BufferLike.byteLength(rawChecklist) > MAX_BYTES) fail('TOO_LARGE', '本地看房清单超过允许大小');
        parsedChecklist = JSON.parse(rawChecklist);
      }
      const listings = rawListings === null ? validateListings(defaults) : validateListings(parsedListings);
      const checklist = rawChecklist === null ? {} : validateChecklist(parsedChecklist);
      let recoveryRaw = null;
      try { recoveryRaw = storage.getItem(RECOVERY_KEY); } catch (_) { /* recovery is optional for reading */ }
      if (recoveryRaw !== null) {
        try {
          const marker = JSON.parse(recoveryRaw);
          if (marker && marker.format === 'opc-rent-recovery' && marker.status === 'pending') {
            return { ok: false, errorCode: 'INTERRUPTED_WRITE', rawListings, rawChecklist };
          }
        } catch (_) { /* malformed recovery metadata does not invalidate intact state */ }
      }
      return { ok: true, listings, checklist, rawListings, rawChecklist };
    } catch (error) {
      return { ok: false, errorCode: error.code || 'INVALID_STORAGE', rawListings, rawChecklist };
    }
  }

  function persistPair(storage, listings, checklist, now = new Date(), expectedRaw = null) {
    const candidate = validateState(listings, checklist);
    const previous = {
      listings: storage.getItem(LISTINGS_KEY),
      checklist: storage.getItem(CHECKLIST_KEY)
    };
    if (expectedRaw && (previous.listings !== expectedRaw.listings || previous.checklist !== expectedRaw.checklist)) {
      const stale = new Error('本地记录已被其他操作更改；请重新核对后再保存。');
      stale.code = 'STALE_STATE';
      stale.rollbackComplete = true;
      throw stale;
    }
    const recovery = { format: 'opc-rent-recovery', version: 1, status: 'pending', savedAt: now.toISOString(), ...previous };
    storage.setItem(RECOVERY_KEY, JSON.stringify(recovery));
    try {
      storage.setItem(LISTINGS_KEY, JSON.stringify(candidate.listings));
      storage.setItem(CHECKLIST_KEY, JSON.stringify(candidate.checklist));
      recovery.status = 'committed';
      storage.setItem(RECOVERY_KEY, JSON.stringify(recovery));
      return {
        listings: candidate.listings, checklist: candidate.checklist,
        rawListings: JSON.stringify(candidate.listings), rawChecklist: JSON.stringify(candidate.checklist)
      };
    } catch (error) {
      let rollbackComplete = true;
      for (const [key, value] of [[LISTINGS_KEY, previous.listings], [CHECKLIST_KEY, previous.checklist]]) {
        try {
          if (value === null) storage.removeItem(key);
          else storage.setItem(key, value);
        } catch (_) { rollbackComplete = false; }
      }
      if (rollbackComplete) {
        try {
          recovery.status = 'rolled-back';
          storage.setItem(RECOVERY_KEY, JSON.stringify(recovery));
        } catch (_) { rollbackComplete = false; }
      }
      const wrapped = new Error(rollbackComplete ? '本地保存失败，已恢复旧记录；恢复副本仍保留' : '本地保存失败，旧记录恢复不完整；请先下载恢复副本');
      wrapped.code = 'PERSIST_FAILED';
      wrapped.rollbackComplete = rollbackComplete;
      wrapped.cause = error;
      throw wrapped;
    }
  }

  function isSnapshotCurrent(storage, rawListings, rawChecklist) {
    try {
      return storage.getItem(LISTINGS_KEY) === rawListings && storage.getItem(CHECKLIST_KEY) === rawChecklist;
    } catch (_) {
      return false;
    }
  }

  function recoveryExport(storage, now = new Date()) {
    let raw;
    try { raw = storage.getItem(RECOVERY_KEY); }
    catch (_) { fail('STORAGE_UNAVAILABLE', '无法读取本地恢复副本'); }
    if (raw === null) fail('NO_RECOVERY', '当前没有本地恢复副本');
    if (BufferLike.byteLength(raw) > MAX_BYTES * 2) fail('TOO_LARGE', '恢复副本超过可安全导出的大小');
    let snapshot;
    try { snapshot = JSON.parse(raw); } catch (_) { return { kind: 'raw', value: raw }; }
    try {
      if (!snapshot || snapshot.format !== 'opc-rent-recovery' || snapshot.version !== 1 || !['pending', 'committed', 'rolled-back'].includes(snapshot.status) ||
          typeof snapshot.listings !== 'string' || typeof snapshot.checklist !== 'string') {
        return { kind: 'raw', value: raw };
      }
      const listings = JSON.parse(snapshot.listings);
      const checklist = JSON.parse(snapshot.checklist);
      return { kind: 'full', envelope: createEnvelope(listings, checklist, now) };
    } catch (_) {
      return { kind: 'raw', value: raw };
    }
  }

  const BufferLike = {
    byteLength(text) {
      if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text).length;
      return unescape(encodeURIComponent(text)).length;
    }
  };

  return Object.freeze({
    LISTINGS_KEY, CHECKLIST_KEY, RECOVERY_KEY, FORMAT, VERSION, MAX_BYTES, MAX_LISTINGS,
    assertBoundedJson, safeHttpUrl, validateListings, validateChecklist, validateState,
    parseBackup, createEnvelope, readStoredState, persistPair, isSnapshotCurrent, recoveryExport
  });
});
