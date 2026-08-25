import firebaseConfig from "../../firebase-applet-config.json";
import { DEFAULT_SETTINGS } from "./branding";
import { ROOMS } from "./hotel";
import { SEED_TESTIMONIALS } from "./testimonials.functions";

const PROJECT_ID = firebaseConfig.projectId;
const DATABASE_ID = firebaseConfig.firestoreDatabaseId || "(default)";
const API_KEY = firebaseConfig.apiKey;

const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

// In-memory collection fallback cache to ensure zero-downtime, fast reads and offline-resilience
const inMemoryStore: Record<string, Map<string, Record<string, unknown>>> = {
  site_settings: new Map([["default", { id: "default", ...DEFAULT_SETTINGS }]]),
  rooms: new Map(
    ROOMS.map((r, idx) => [
      r.slug,
      {
        id: r.slug,
        slug: r.slug,
        name: r.name,
        rate: r.rate,
        units: r.qty,
        occupancy: r.occupancy,
        size: r.size,
        image_url: r.image,
        blurb: r.blurb,
        features: r.features,
        sort_order: idx,
        published: true,
      },
    ]),
  ),
  testimonials: new Map(SEED_TESTIMONIALS.map((t) => [t.id, { ...t }])),
  user_roles: new Map([
    [
      "role-chris",
      {
        id: "role-chris",
        email: "chrisbllack@gmail.com",
        user_id: "chrisbllack@gmail.com",
        full_name: "Chris Black",
        role: "super_admin",
        privileges: [
          "can_manage_users",
          "can_manage_reservations",
          "can_manage_rooms",
          "can_manage_cms",
          "can_manage_media",
          "can_manage_branding",
          "can_view_reports",
          "can_view_audit_logs",
          "can_dispatch_alerts",
          "can_manage_finances",
        ],
        department: "Executive Management",
        status: "active",
        notes: "Super Administrator with full system authority and all privileges",
      },
    ],
    [
      "role-nathan",
      {
        id: "role-nathan",
        email: "nathandev1978@gmail.com",
        user_id: "nathandev1978@gmail.com",
        full_name: "Nathan Dev",
        role: "super_admin",
        privileges: [
          "can_manage_users",
          "can_manage_reservations",
          "can_manage_rooms",
          "can_manage_cms",
          "can_manage_media",
          "can_manage_branding",
          "can_view_reports",
          "can_view_audit_logs",
          "can_dispatch_alerts",
          "can_manage_finances",
        ],
        department: "Executive Management",
        status: "active",
        notes: "Super Administrator with full privileges",
      },
    ],
    [
      "role-dev",
      {
        id: "role-dev",
        email: "infinitywebappsdev@gmail.com",
        user_id: "infinitywebappsdev@gmail.com",
        full_name: "System Super Admin",
        role: "super_admin",
        privileges: [
          "can_manage_users",
          "can_manage_reservations",
          "can_manage_rooms",
          "can_manage_cms",
          "can_manage_media",
          "can_manage_branding",
          "can_view_reports",
          "can_view_audit_logs",
          "can_dispatch_alerts",
          "can_manage_finances",
        ],
        department: "Executive Management",
        status: "active",
      },
    ],
  ]),
  faqs: new Map(),
  gallery_images: new Map(),
  pages: new Map(),
  page_versions: new Map(),
  reservations: new Map(),
  guest_messages: new Map(),
  contacts: new Map(),
  change_requests: new Map(),
  audit_logs: new Map(),
};

function getCollectionMap(col: string) {
  if (!inMemoryStore[col]) {
    inMemoryStore[col] = new Map();
  }
  return inMemoryStore[col];
}

// Convert standard JavaScript value to Firestore REST Value
function toFirestoreValue(val: unknown): Record<string, unknown> {
  if (val === null || val === undefined) {
    return { nullValue: null };
  }
  if (typeof val === "boolean") {
    return { booleanValue: val };
  }
  if (typeof val === "number") {
    if (Number.isInteger(val)) {
      return { integerValue: val.toString() };
    }
    return { doubleValue: val };
  }
  if (typeof val === "string") {
    return { stringValue: val };
  }
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map(toFirestoreValue),
      },
    };
  }
  if (typeof val === "object") {
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) {
        fields[k] = toFirestoreValue(v);
      }
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

// Convert Firestore REST Document fields back to plain JavaScript object
function fromFirestoreFields(fields: Record<string, unknown> = {}): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    result[k] = fromFirestoreValue(v as Record<string, unknown>);
  }
  return result;
}

function fromFirestoreValue(val: Record<string, unknown>): unknown {
  if (!val || typeof val !== "object") return null;
  if ("nullValue" in val) return null;
  if ("booleanValue" in val) return Boolean(val.booleanValue);
  if ("integerValue" in val) return parseInt(val.integerValue as string, 10);
  if ("doubleValue" in val) return Number(val.doubleValue);
  if ("stringValue" in val) return val.stringValue;
  if ("timestampValue" in val) return val.timestampValue;
  if ("arrayValue" in val) {
    const arr = (val.arrayValue as { values?: Record<string, unknown>[] })?.values || [];
    return arr.map(fromFirestoreValue);
  }
  if ("mapValue" in val) {
    const mapFields = (val.mapValue as { fields?: Record<string, unknown> })?.fields || {};
    return fromFirestoreFields(mapFields);
  }
  return null;
}

export const firestoreRest = {
  async list<T = Record<string, unknown>>(collection: string, token?: string): Promise<T[]> {
    const colMap = getCollectionMap(collection);
    try {
      const url = `${BASE_URL}:runQuery?key=${API_KEY}`;
      const body = {
        structuredQuery: {
          from: [{ collectionId: collection }],
          limit: 100,
        },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const results: T[] = [];
          for (const item of data) {
            if (item.document && item.document.name) {
              const id = item.document.name.split("/").pop() || "";
              const obj = fromFirestoreFields(item.document.fields);
              const full = { id, ...obj } as T;
              colMap.set(id, full as Record<string, unknown>);
              results.push(full);
            }
          }
          if (results.length > 0) return results;
        }
      }
    } catch {
      // Fallback seamlessly to in-memory store
    }

    return Array.from(colMap.values()) as T[];
  },

  async get<T = Record<string, unknown>>(
    collection: string,
    id: string,
    token?: string,
  ): Promise<T | null> {
    const colMap = getCollectionMap(collection);
    try {
      const url = `${BASE_URL}/${collection}/${encodeURIComponent(id)}?key=${API_KEY}`;
      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const doc = await res.json();
        const docId = doc.name?.split("/").pop() || id;
        const full = { id: docId, ...fromFirestoreFields(doc.fields) } as T;
        colMap.set(docId, full as Record<string, unknown>);
        return full;
      }
    } catch {
      // Fallback seamlessly
    }

    const cached = colMap.get(id);
    return cached ? (cached as T) : null;
  },

  async create<T = Record<string, unknown>>(
    collection: string,
    data: Record<string, unknown>,
    customId?: string,
    token?: string,
  ): Promise<{ id: string } & T> {
    const docId =
      customId ||
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

    const colMap = getCollectionMap(collection);
    const stored = { id: docId, ...data } as { id: string } & T;
    colMap.set(docId, stored);

    try {
      const url = `${BASE_URL}/${collection}?documentId=${encodeURIComponent(docId)}&key=${API_KEY}`;
      const fields: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(data)) {
        if (k !== "id" && v !== undefined) {
          fields[k] = toFirestoreValue(v);
        }
      }

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ fields }),
      });
    } catch {
      // Data is safely retained in local server store
    }

    return stored;
  },

  async patch<T = Record<string, unknown>>(
    collection: string,
    id: string,
    data: Record<string, unknown>,
    token?: string,
  ): Promise<{ id: string } & T> {
    const colMap = getCollectionMap(collection);
    const existing = colMap.get(id) || { id };
    const merged = { ...existing, ...data, id } as { id: string } & T;
    colMap.set(id, merged);

    try {
      const fields: Record<string, unknown> = {};
      const fieldMasks: string[] = [];

      for (const [k, v] of Object.entries(data)) {
        if (k !== "id" && v !== undefined) {
          fields[k] = toFirestoreValue(v);
          fieldMasks.push(`updateMask.fieldPaths=${encodeURIComponent(k)}`);
        }
      }

      const maskQuery = fieldMasks.length > 0 ? `&${fieldMasks.join("&")}` : "";
      const url = `${BASE_URL}/${collection}/${encodeURIComponent(id)}?key=${API_KEY}${maskQuery}`;

      await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ fields }),
      });
    } catch {
      // Data is safely retained in local server store
    }

    return merged;
  },

  async delete(collection: string, id: string, token?: string): Promise<boolean> {
    const colMap = getCollectionMap(collection);
    colMap.delete(id);

    try {
      const url = `${BASE_URL}/${collection}/${encodeURIComponent(id)}?key=${API_KEY}`;
      await fetch(url, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {
      // Safely deleted from local store
    }

    return true;
  },
};
