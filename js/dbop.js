// "use strict"
function openDB() {
    return new Promise((resolve, reject) => {
        let dbopenrequest = window.indexedDB.open("lin", 2)
        // console.log(dbopenrequest)

        dbopenrequest.onerror = function (event) {
            // console.log("fail")
            // console.log("Database error: " + event.target.errorCode)
            reject()
        }

        dbopenrequest.onsuccess = function (event) {
            console.log("success")
            idb = dbopenrequest.result
            resolve()
        }

        dbopenrequest.onupgradeneeded = function (event) {
            // console.log("upg")
            let db = event.target.result
            db.onerror = function (errorEvent) {
                console.log("Error loading database.")
            }
            if (event.oldVersion < 1) {
                let objectStore = db.createObjectStore("torrents", {
                    keyPath: "name"
                })
                objectStore.createIndex("time", "time", {
                    unique: false
                })
                objectStore.createIndex("seed", "seed", {
                    unique: false
                })
                objectStore.createIndex("dl", "dl", {
                    unique: false
                })
                objectStore.createIndex("size", "size", {
                    unique: false
                })
                objectStore.createIndex("avgprg", "avgprg", {
                    unique: false
                })
                objectStore.createIndex("freetime", "freetime", {
                    unique: false
                })

                objectStore = db.createObjectStore("fav", {
                    keyPath: "name"
                })
                objectStore.createIndex("time", "time", {
                    unique: false
                })
                objectStore.createIndex("seed", "seed", {
                    unique: false
                })
                objectStore.createIndex("dl", "dl", {
                    unique: false
                })
                objectStore.createIndex("size", "size", {
                    unique: false
                })
                objectStore.createIndex("avgprg", "avgprg", {
                    unique: false
                })
                objectStore.createIndex("freetime", "freetime", {
                    unique: false
                })
            }
            if (event.oldVersion < 2) {
                let objectStore = db.createObjectStore("no_more_remind", {
                    keyPath: "name"
                })
                objectStore.createIndex("name", "name", {
                    unique: true
                })
            }
        }
    })
}

function clearIDBStroe(storeName) {
    return new Promise((resolve, reject) => {
        let trans = idb.transaction([storeName], "readwrite")
        let os = trans.objectStore(storeName)
        let clearq = os.clear()
        clearq.onsuccess = function (event) {
            resolve()
        }
        clearq.onerror = function (event) {
            // console.log(storeName + "clear fail")
            // console.log("Database error: " + event.target.errorCode)
        }
    })
}

function getOsusumeItems(storeName) {
    return new Promise((resolve, reject) => {
        let trans = idb.transaction(["fav", "no_more_remind"], "readwrite")
        let a1 = []
        let a2 = []
        let objectStoreFav = trans.objectStore("fav")
        objectStoreFav.getAll().onsuccess = function (event) {
            a1 = event.target.result
        }
        let objectStoreRemind = trans.objectStore("no_more_remind")
        objectStoreRemind.getAll().onsuccess = function (event) {
            a2 = event.target.result
        }
        setTimeout(() => {
            resolve(minus(a1, a2))
        }, 300);
    })
}

function noRemindAll(torrents) {
    let trans = idb.transaction(["no_more_remind"], "readwrite")
    let objectStoreFav = trans.objectStore("no_more_remind")
    for (i in torrents) {
        let q = objectStoreFav.add(torrents[i])
        q.onsuccess = function (event) {}
        q.onerror = function (event) {
            console.log(event)
        }
    }
}

function clearRemindAll(torrents) {
    return new Promise((resolve, reject) => {
        let trans = idb.transaction(["no_more_remind"], "readwrite")
        let objectStoreFav = trans.objectStore("no_more_remind")
        let q = objectStoreFav.clear()
        q.onsuccess = function (event) {
            resolve()
        }
        q.onerror = function (event) {
            console.log(event)
        }
    })
}