"use client"

const DB_NAME = "SocialFlowMediaDB"
const STORE_NAME = "media"
const DB_VERSION = 1

export const MediaDB = {
    open: (): Promise<IDBDatabase> => {
        return new Promise((resolve, reject) => {
            if (typeof window === "undefined") {
                reject(new Error("Browser only"))
                return
            }
            const request = indexedDB.open(DB_NAME, DB_VERSION)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result)

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME)
                }
            }
        })
    },

    saveMedia: async (id: string, base64OrBlob: string): Promise<void> => {
        const db = await MediaDB.open()
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite")
            const store = transaction.objectStore(STORE_NAME)
            const request = store.put(base64OrBlob, id)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve()
        })
    },

    getMedia: async (id: string): Promise<string | null> => {
        const db = await MediaDB.open()
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly")
            const store = transaction.objectStore(STORE_NAME)
            const request = store.get(id)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result || null)
        })
    },

    deleteMedia: async (id: string): Promise<void> => {
        const db = await MediaDB.open()
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite")
            const store = transaction.objectStore(STORE_NAME)
            const request = store.delete(id)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve()
        })
    }
}
