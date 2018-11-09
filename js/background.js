String.format = function (src) {
    if (arguments.length === 0) return null
    let args = Array.prototype.slice.call(arguments, 1)
    return src.replace(/\{(\d+)\}/g, function (m, i) {
        return args[i]
    })
}

function parseDate(DateString) {
    let ptnyear = new RegExp(/\d+(?=年)/g)
    let totalmin = 0
    let rtyear
    if ((rtyear = ptnyear.exec(DateString)) != null) {
        totalmin += parseInt(rtyear[0]) * 60 * 24 * 30 * 12
    }

    let ptnmonth = new RegExp(/\d+(?=月)/g)
    let rtmonth
    if ((rtmonth = ptnmonth.exec(DateString)) != null) {
        totalmin += parseInt(rtmonth[0]) * 60 * 24 * 30
    }

    let ptnday = new RegExp(/\d+(?=天)/g)
    let rtday
    if ((rtday = ptnday.exec(DateString)) != null) {
        totalmin += parseInt(rtday[0]) * 60 * 24
    }

    let ptnhour = new RegExp(/\d+(?=时)/g)
    let rthour
    if ((rthour = ptnhour.exec(DateString)) != null) {
        totalmin += parseInt(rthour[0]) * 60
    }

    let ptnminute = new RegExp(/\d+(?=分)/g)
    let rtminute
    if ((rtminute = ptnminute.exec(DateString)) != null) {
        totalmin += parseInt(rtminute[0])
    }
    return totalmin
}

function parseSize(sizeString) {
    let ptnsize = new RegExp(/\d+/g)
    let rtsize
    if ((rtsize = ptnsize.exec(sizeString)) != null) {
        return parseInt(rtsize[0])
    }
}

function vList() {
    $.ajax({
        url: "https://hdchina.org/torrents.php",
        method: "get",
        async: true,
        success: function (data, textStatus, jqXHR) {
            anaList(data)
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // console.log('error: ' + jqXHR.getAllResponseHeaders() + textStatus + errorThrown)
            // console.log(jqXHR.responseText)
        }
    })
}

function anaList(htmlResponse) {
    let doc = $(htmlResponse)
    // username
    let duser = doc.find(".userinfo > p:nth-child(2) > span > a > b")
    console.log(duser.text())
    //userinfo url
    let duserlink = doc.find("#site_header > div.userinfo > p:nth-child(2) > span > a")
    console.log(duserlink.attr("href"))
    //torrent name1
    let sname1 = "#form_torrent > table > tbody > tr:nth-child({0}) > td.t_name > table > tbody > tr > td:nth-child(2) > h3 > a"
    //torrnet name2
    let sname2 = "#form_torrent > table > tbody > tr:nth-child({0}) > td.t_name > table > tbody > tr > td:nth-child(2) > h4"
    //torrnet elapsed time
    let stime = "#form_torrent > table > tbody > tr:nth-child({0}) > td.t_time > span"
    //torrent size
    let ssize = "#form_torrent > table > tbody > tr:nth-child({0}) > td.t_size"
    //torrent seed
    let sseed = "#form_torrent > table > tbody > tr:nth-child({0}) > td.t_torrents > a"
    //torrent downloader
    let sdl = "#form_torrent > table > tbody > tr:nth-child({0}) > td.t_leech > a"
    //torrent completed
    let scomplete = "#form_torrent > table > tbody > tr:nth-child({0}) > td.t_completed > a"
    //torrent progress bar
    let sprogress = "#form_torrent > table > tbody > tr:nth-child({0}) > td.t_name > table > tbody > tr > td:nth-child(2) > div > div > div"
    //torrent isfree
    let sfree = "#form_torrent > table > tbody > tr:nth-child({0}) > td.t_name > table > tbody > tr > td.discount > p > img"

    //try indexedDB
    let trans = idb.transaction(["torrents"], "readwrite")
    let objectStore = trans.objectStore("torrents");
    // 查多少条数据，如果是首页全部，i<102
    for (let i = 2; i < 102; i++) {
        let dname1 = doc.find(String.format(sname1, i))
        let dname2 = doc.find(String.format(sname2, i))
        let dtime = doc.find(String.format(stime, i))
        let dsize = doc.find(String.format(ssize, i))
        let dseed = doc.find(String.format(sseed, i))
        let ddl = doc.find(String.format(sdl, i))
        let dcomplete = doc.find(String.format(scomplete, i))
        let dprogress = doc.find(String.format(sprogress, i))
        let dfree = doc.find(String.format(sfree, i))

        if (dfree.length > 0 && dfree.attr("alt").indexOf("%") == -1 &&
                dprogress.length === 0 //已经开始下载或下载过有进度条的则不进入筛选条件
            ) {
                objectStore.add({
                    name: dname1.text(),
                    name2: dname2.text(),
                    url: dname1.attr("href"),
                    time: dtime.text(),
                    size: dsize.text(),
                    seed: dseed.text() == "" ? 0 : dseed.text(),
                    dl: ddl.text() == "" ? 0 : ddl.text(),
                    complete: dcomplete.length > 0 ? dcomplete.text() : "0",
                    free: dfree.attr("alt"),
                    avgprg: null,
                    avgspd: null,
                    totalspd: null
                })

            }
        }
    }

    function ergRecord() {
        let trans = idb.transaction(["torrents"], "readwrite")
        let objectStore = trans.objectStore("torrents");
        objectStore.openCursor().onsuccess = function (event) {
            let cursor = event.target.result
            if (cursor) {
                // console.log("Name: " + cursor.key)
                vDetail(cursor.key, cursor.value.url)
                cursor.continue()
            } else {
                // console.log("No more entries!")
            }
        }
    }

    function vDetail(name, innerurl) {
        $.ajax({
            url: "https://hdchina.org/" + innerurl,
            method: "get",
            async: true,
            success: function (data, textStatus, jqXHR) {
                anaDetail(name, data)
            },
            error: function (jqXHR, textStatus, errorThrown) {}
        })
    }

    function anaDetail(name, htmlResponse) {
        let doc = $(htmlResponse)
        //平均速度
        let savgspeed = "#site_content > div.details_box > table.table_details > tbody > tr:nth-child({0}) > td.rowfollow > span:nth-child(3) > b"
        let stotalspeed = "#site_content > div.details_box > table.table_details > tbody > tr:nth-child({0}) > td.rowfollow > span:nth-child(4) > b"
        let savgprogress = "#site_content > div.details_box > table.table_details > tbody > tr:nth-child({0}) > td.rowfollow > span:nth-child(1)"

        let trans = idb.transaction(["torrents"], "readwrite")
        let objectStore = trans.objectStore("torrents")

        //速度进度默认为0，如果能取到则赋值
        let nprogress = 0
        let ntotalspeed = 0
        let nspeed = 0
        //由于表格不是固定，内容过多的情况下，数据可能是在第5条之后
        for (let i = 5; i < 99; i++) {
            let davgspeed = doc.find(String.format(savgspeed, i))
            let dtotalspeed = doc.find(String.format(stotalspeed, i))
            let davgprogress = doc.find(String.format(savgprogress, i))
            if (davgprogress.text() != "") {
                nspeed = davgspeed.text()
                ntotalspeed = dtotalspeed.text()
                // 平均进度
                let ptn = new RegExp(/\d+(?=%)/g)
                let pt
                if ((pt = ptn.exec(davgprogress.text())) != null) {
                    nprogress = parseInt(pt[0])
                }
                break
            }
        }
        //修改进度速度字段
        objectStore.openCursor().onsuccess = function (event) {
            let cursor = event.target.result
            if (cursor) {
                console.log("Name: " + cursor.key)
                if (cursor.key == name) {
                    const updateData = cursor.value
                    updateData.avgprg = nprogress
                    updateData.avgspd = nspeed
                    updateData.totalspd = ntotalspeed
                    const upRequest = cursor.update(updateData)
                    upRequest.onsuccess = function () {
                        console.log('a record is updated successful')
                    }
                }
                cursor.continue()
            } else {
                // console.log("No more entries!")
            }
        }
    }

    function torrentFilter(config) {
        let count = 0
        let trans = idb.transaction(["torrents", "fav"], "readwrite")
        let objectStore = trans.objectStore("torrents")
        let objectStore1 = trans.objectStore("fav")
        objectStore.openCursor().onsuccess = function (event) {
            let cursor = event.target.result
            if (cursor) {
                let name = cursor.key
                let name2 = cursor.value.name2
                let time = parseDate(cursor.value.time)
                let size = parseSize(cursor.value.size)
                let seed = cursor.value.seed
                let dl = cursor.value.dl
                let complete = cursor.value.complete
                let free = cursor.value.free
                let avgprg = cursor.value.avgprg
                let avgspd = cursor.value.avgspd
                let totalspd = cursor.value.totalspd
                let goNext = false
                console.log(name)
                if (config.seedpdl.enable) {
                    if (seed !== 0 && dl / seed < config.seedpdl.ratio) {
                        // cursor.continue()
                        console.log(1)
                        goNext = true
                    }
                } else {
                    if (config.cdseed.enable) {
                        if (parseInt(config.cdseed.choose) === 0) {
                            if (seed != parseInt(config.cdseed.noeq)) {
                                // cursor.continue()
                                console.log(2)
                                goNext = true
                            }
                        } else if (parseInt(config.cdseed.choose) === 1) {
                            if (seed >= parseInt(config.cdseed.nolt)) {
                                // cursor.continue()
                                console.log(3)
                                goNext = true
                            }
                        } else if (parseInt(config.cdseed.choose) === 2) {
                            if (seed <= parseInt(config.cdseed.nogt)) {
                                // cursor.continue()
                                console.log(4)
                                goNext = true
                            }
                        }
                    }
                    if (config.cddl.enable) {
                        if (parseInt(config.cddl.choose) === 0) {
                            if (dl != parseInt(config.cddl.noeq)) {
                                // cursor.continue()
                                console.log(5)
                                goNext = true
                            }
                        } else if (parseInt(config.cddl.choose) === 1) {
                            if (dl >= parseInt(config.cddl.nolt)) {
                                // cursor.continue()
                                console.log(6)
                                goNext = true
                            }
                        } else if (parseInt(config.cddl.choose) === 2) {
                            if (dl <= parseInt(config.cddl.nogt)) {
                                // cursor.continue()
                                console.log(7)
                                console.log(config.cddl.nogt)
                                console.log(dl)
                                goNext = true
                            }
                        }
                    }
                }
                if (config.elapsedtime.enable) {
                    if (time > parseInt(config.elapsedtime.year) * 518400 + parseInt(config.elapsedtime.month) * 43200 + parseInt(config.elapsedtime.day) * 1440 + parseInt(config.elapsedtime.hour) * 60 + parseInt(config.elapsedtime.minute)) {
                        // cursor.continue()
                        console.log(8)
                        goNext = true
                    }
                }
                if (config.cdsize.enable) {
                    if (config.cdsize.choose === 0) {
                        if (size > parseInt(config.cdsize.nolt)) {
                            // cursor.continue()
                            console.log(9)
                            goNext = true
                        }
                    } else if (config.cdsize.choose === 1) {
                        if (size < parseInt(config.cdsize.nogt)) {
                            // cursor.continue()
                            console.log(10)
                            goNext = true
                        }
                    }
                }
                if (config.cdavgprg.enable) {
                    if (avgprg >= parseInt(config.cdavgprg.pg)) {
                        // cursor.continue()
                        console.log(11)
                        console.log(config.cdavgprg.pg)
                        console.log(avgprg)
                        goNext = true
                    }
                }
                if (goNext) {
                    cursor.continue()
                } else {
                    console.log("开始推荐")
                    console.log(name)
                    console.log(name2)
                    console.log("分钟:" + time)
                    console.log("平均进度" + avgprg)
                    console.log("seed:" + seed + "  dl:" + dl)
                    count++
                    console.log("count:" + count)
                    // console.log(cursor.value)
                    let questadd = objectStore1.put(cursor.value)
                    questadd.onsuccess = function (event) {
                        // console.log("add into fav success")
                    }
                    questadd.onerror = function (event) {
                        // console.log("add into fav error:" + event.target)
                    }
                    cursor.continue()
                }
            } else {
                // console.log("No more entries!")
                // console.log("为您找到了" + count + "条")
                msgs = "为您找到了" + count + "条"
                if (chrome.notifications && count != 0) {
                    let opt = {
                        type: "basic",
                        iconUrl: '/icons/seed64.png',
                        title: "看看好种子吧",
                        message: msgs,
                        contextMessage: "HDC种子提醒",
                        buttons: [{
                            title: '查看详情',
                        }, {
                            title: '我知道了',
                        }]
                    }
                    chrome.notifications.create("osusume", opt)
                }
            }
        }
    }

    chrome.notifications.onButtonClicked.addListener(function (id, buttonIndex) {
        switch (buttonIndex) {
            case 0:
                //查看详情
                chrome.tabs.create({
                    url: "view/ts.html"
                })
                break
            case 1:
                //我知道了
                break
        }
        chrome.notifications.clear(id);
    })

    chrome.alarms.create("mainloop", {
        delayInMinutes: 1,
        periodInMinutes: 2
    })

    chrome.alarms.onAlarm.addListener(function (alarm) {
        if (alarm.name === "mainloop") {
            looprun()
        }
    })

    function looprun() {
        setTimeout(() => {
            vList()
        }, 2000)
        setTimeout(() => {
            ergRecord()
        }, 10000)
        setTimeout(() => {
            if (localStorage.config != null) {
                // console.log(JSON.parse(localStorage.config))
                let config_jsobj = JSON.parse(localStorage.config)
                torrentFilter(config_jsobj)
            }
        }, 20000)
    }
    // console.log(JSON.parse(localStorage.config))

    function openDB() {
        let dbopenrequest = window.indexedDB.open("lin", 1)
        console.log(dbopenrequest)

        dbopenrequest.onerror = function (event) {
            console.log("fail")
            console.log("Database error: " + event.target.errorCode);
        }

        dbopenrequest.onsuccess = function (event) {
            console.log("success")
            idb = dbopenrequest.result
            //上来先清一下数据
            clearIDBStroe(idb, "torrents")
            clearIDBStroe(idb, "fav")
        }

        dbopenrequest.onupgradeneeded = function (event) {
            console.log("upg")
            let db = event.target.result;
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
        }
    }

    function clearIDBStroe(IDBInstance, storeName) {
        let trans = IDBInstance.transaction([storeName], "readwrite")
        let os = trans.objectStore(storeName)
        let clearq = os.clear()
        clearq.onsuccess = function (event) {
            console.log(storeName + "clear all")
        }
        clearq.onerror = function (event) {
            console.log(storeName + "clear fail")
            console.log("Database error: " + event.target.errorCode)
        }
    }

    let idb
    openDB()
    looprun()