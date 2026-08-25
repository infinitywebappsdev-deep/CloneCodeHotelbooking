import firebaseConfig from "../../firebase-applet-config.json";

const PROJECT_ID = firebaseConfig.projectId;
const DATABASE_ID = firebaseConfig.firestoreDatabaseId || "(default)";
const API_KEY = firebaseConfig.apiKey;

const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

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

      if (!res.ok) {
        if (res.status === 404) return [];
        const errText = await res.text();
        console.warn(`Firestore list error (${collection}):`, errText);
        return [];
      }

      const data = await res.json();
      if (!Array.isArray(data)) return [];

      const results: T[] = [];
      for (const item of data) {
        if (item.document && item.document.name) {
          const id = item.document.name.split("/").pop() || "";
          const obj = fromFirestoreFields(item.document.fields);
          results.push({ id, ...obj } as T);
        }
      }
      return results;
    } catch (e) {
      console.warn(`Firestore list exception (${collection}):`, e);
      return [];
    }
  },

  async get<T = Record<string, unknown>>(
    collection: string,
    id: string,
    token?: string,
  ): Promise<T | null> {
    try {
      const url = `${BASE_URL}/${collection}/${encodeURIComponent(id)}?key=${API_KEY}`;
      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        if (res.status === 404) return null;
        return null;
      }

      const doc = await res.json();
      const docId = doc.name?.split("/").pop() || id;
      return { id: docId, ...fromFirestoreFields(doc.fields) } as T;
    } catch (e) {
      console.warn(`Firestore get exception (${collection}/${id}):`, e);
      return null;
    }
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
    const url = `${BASE_URL}/${collection}?documentId=${encodeURIComponent(docId)}&key=${API_KEY}`;

    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (k !== "id" && v !== undefined) {
        fields[k] = toFirestoreValue(v);
      }
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ fields }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Firestore create error (${collection}):`, errText);
      throw new Error(`Firestore error: ${res.statusText}`);
    }

    return { id: docId, ...data } as { id: string } & T;
  },

  async patch<T = Record<string, unknown>>(
    collection: string,
    id: string,
    data: Record<string, unknown>,
    token?: string,
  ): Promise<{ id: string } & T> {
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

    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ fields }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Firestore patch error (${collection}/${id}):`, errText);
      throw new Error(`Firestore error: ${res.statusText}`);
    }

    return { id, ...data } as { id: string } & T;
  },

  async delete(collection: string, id: string, token?: string): Promise<boolean> {
    try {
      const url = `${BASE_URL}/${collection}/${encodeURIComponent(id)}?key=${API_KEY}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return res.ok;
    } catch (e) {
      console.warn(`Firestore delete exception (${collection}/${id}):`, e);
      return false;
    }
  },
};
