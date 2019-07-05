function vList(pageSwitch) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "https://hdchina.org/torrents.php?boardid=" + pageSwitch,
            method: "get",
            async: true,
            success: function (data, textStatus, jqXHR) {
                anaList(data)
                setTimeout(() => {
                    resolve()
                }, 2000);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // console.log('error: ' + jqXHR.getAllResponseHeaders() + textStatus + errorThrown)
                // console.log(jqXHR.responseText)
            }
        })
    })
}

function anaList(htmlResponse) {
    let doc = $(htmlResponse)
    // username
    let duser = doc.find(".userinfo > p:nth-child(2) > span > a > b")
    // console.log(duser.text())
    //userinfo url
    let duserlink = doc.find("#site_header > div.userinfo > p:nth-child(2) > span > a")
    // console.log(duserlink.attr("href"))
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
    //torrent free time remain
    let sfreetime = "#form_torrent > table > tbody > tr:nth-child({0}) > td.t_name > table > tbody > tr > td.discount > span"

    //try indexedDB
    let trans = idb.transaction(["torrents"], "readwrite")
    let objectStore = trans.objectStore("torrents")
    // 查多少条数据，如果是首页全部，i<102
    for (let i = 2; i < 102; i++) {
        let dname1 = doc.find(stringFormat(sname1, i))
        let dname2 = doc.find(stringFormat(sname2, i))
        let dtime = doc.find(stringFormat(stime, i))
        let dsize = doc.find(stringFormat(ssize, i))
        let dseed = doc.find(stringFormat(sseed, i))
        let ddl = doc.find(stringFormat(sdl, i))
        let dcomplete = doc.find(stringFormat(scomplete, i))
        let dprogress = doc.find(stringFormat(sprogress, i))
        let dfree = doc.find(stringFormat(sfree, i))
        let dfreetime = doc.find(stringFormat(sfreetime, i))

        if (dfree.length > 0 && dfree.attr("alt").indexOf("%") == -1 &&
            dprogress.length === 0 //已经开始下载或下载过有进度条的则不进入筛选条件
        ) {
            objectStore.add({
                name: dname1.text(),
                name2: dname2.text(),
                url: "https://hdchina.org/" + dname1.attr("href"),
                time: dtime.text(),
                size: dsize.text(),
                seed: dseed.text() == "" ? 0 : dseed.text(),
                dl: ddl.text() == "" ? 0 : ddl.text(),
                complete: dcomplete.length > 0 ? dcomplete.text() : "0",
                free: dfree.attr("alt"),
                freetime: dfreetime.text(),
                avgprg: null,
                avgspd: null,
                totalspd: null,
                torrentlink: null
            })

        }
    }
}

function ergRecord() {
    return new Promise((resolve, reject) => {
        let trans = idb.transaction(["torrents"], "readwrite")
        let objectStore = trans.objectStore("torrents")
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
        setTimeout(() => {
            resolve()
        }, 20000);
    })
}

function vDetail(name, innerurl) {
    $.ajax({
        url: innerurl,
        method: "get",
        async: true,
        success: function (data, textStatus, jqXHR) {
            anaDetail(name, data)
        },
        error: function (jqXHR, textStatus, errorThrown) {}
    })
}

function anaDetail(name, htmlResponse) {
    console.log("anaing: " + name)
    let doc = $(htmlResponse)
    //平均速度
    let savgspeed = "#site_content > div.details_box > table.table_details > tbody > tr:nth-child({0}) > td.rowfollow > span:nth-child(3) > b"
    let stotalspeed = "#site_content > div.details_box > table.table_details > tbody > tr:nth-child({0}) > td.rowfollow > span:nth-child(4) > b"
    let savgprogress = "#site_content > div.details_box > table.table_details > tbody > tr:nth-child({0}) > td.rowfollow > span:nth-child(1)"

    let storrentdllink = "#site_content > div.details_box > table.movie_details > tbody > tr:nth-child(2) > td.info_box > ul:nth-child(1) > li > a.torrentdown_button"

    let trans = idb.transaction(["torrents"], "readwrite")
    let objectStore = trans.objectStore("torrents")

    //速度进度默认为0，如果能取到则赋值
    let nprogress = 0
    let ntotalspeed = 0
    let nspeed = 0
    let dtorrentdllink = doc.find(storrentdllink)
    // console.log("种子地址" + dtorrentdllink.attr("href"))
    //由于表格不是固定，内容过多的情况下，数据可能是在第5条之后
    for (let i = 5; i < 99; i++) {
        let davgspeed = doc.find(stringFormat(savgspeed, i))
        let dtotalspeed = doc.find(stringFormat(stotalspeed, i))
        let davgprogress = doc.find(stringFormat(savgprogress, i))
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
    //修改进度速度等字段
    objectStore.openCursor().onsuccess = function (event) {
        let cursor = event.target.result
        if (cursor) {
            // console.log("Name: " + cursor.key)
            if (cursor.key == name) {
                // console.log(dtorrentdllink.attr("href"))
                const updateData = cursor.value
                updateData.avgprg = nprogress
                updateData.avgspd = nspeed
                updateData.totalspd = ntotalspeed
                updateData.torrentlink = "https://hdchina.org/" + dtorrentdllink.attr("href")
                const upRequest = cursor.update(updateData)
                upRequest.onsuccess = function () {
                    // console.log('a record is updated successful')
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
            if (config.seedpdl.enable) {
                if (seed !== 0 && dl / seed < config.seedpdl.ratio) {
                    // cursor.continue()
                    goNext = true
                }
            } else {
                if (config.cdseed.enable) {
                    if (parseInt(config.cdseed.choose) === 0) {
                        if (seed != parseInt(config.cdseed.noeq)) {
                            // cursor.continue()
                            goNext = true
                        }
                    } else if (parseInt(config.cdseed.choose) === 1) {
                        if (seed >= parseInt(config.cdseed.nolt)) {
                            // cursor.continue()
                            goNext = true
                        }
                    } else if (parseInt(config.cdseed.choose) === 2) {
                        if (seed <= parseInt(config.cdseed.nogt)) {
                            // cursor.continue()
                            goNext = true
                        }
                    }
                }
                if (config.cddl.enable) {
                    if (parseInt(config.cddl.choose) === 0) {
                        if (dl != parseInt(config.cddl.noeq)) {
                            // cursor.continue()
                            goNext = true
                        }
                    } else if (parseInt(config.cddl.choose) === 1) {
                        if (dl >= parseInt(config.cddl.nolt)) {
                            // cursor.continue()
                            goNext = true
                        }
                    } else if (parseInt(config.cddl.choose) === 2) {
                        if (dl <= parseInt(config.cddl.nogt)) {
                            // cursor.continue()
                            goNext = true
                        }
                    }
                }
            }
            if (config.elapsedtime.enable) {
                if (time > parseInt(config.elapsedtime.year) * 518400 + parseInt(config.elapsedtime.month) * 43200 + parseInt(config.elapsedtime.day) * 1440 + parseInt(config.elapsedtime.hour) * 60 + parseInt(config.elapsedtime.minute)) {
                    // cursor.continue()
                    goNext = true
                }
            }
            if (config.cdsize.enable) {
                if (config.cdsize.choose === 0) {
                    if (size > parseInt(config.cdsize.nolt)) {
                        // cursor.continue()
                        goNext = true
                    }
                } else if (config.cdsize.choose === 1) {
                    if (size < parseInt(config.cdsize.nogt)) {
                        // cursor.continue()
                        goNext = true
                    }
                }
            }
            if (config.cdavgprg.enable) {
                if (avgprg >= parseInt(config.cdavgprg.pg)) {
                    // cursor.continue()
                    goNext = true
                }
            }
            if (goNext) {
                cursor.continue()
            } else {
                // console.log("开始推荐")
                // console.log(name)
                // console.log(name2)
                // console.log("分钟:" + time)
                // console.log("平均进度" + avgprg)
                // console.log("seed:" + seed + "  dl:" + dl)
                count++
                // console.log("count:" + count)
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
            openOsusumeTab()
            break
        case 1:
            //我知道了
            break
    }
    chrome.notifications.clear(id)
})

function clearTorrents() {
    return new Promise((resolve, reject) => {
        resolve("torrents")
    })
}

function clearFavs() {
    return new Promise((resolve, reject) => {
        resolve("fav")
    })
}

function vList1() {
    return new Promise((resolve, reject) => {
        resolve("1")
    })
}

function vList2() {
    return new Promise((resolve, reject) => {
        resolve("2")
    })
}

function vList3() {
    return new Promise((resolve, reject) => {
        resolve("3")
    })
}

function looprun() {
    console.clear()
    openDB().then(clearTorrents).then(clearIDBStroe).then(clearFavs).then(clearIDBStroe).then(vList1).then(vList).then(vList2).then(vList).then(vList3).then(vList).then(ergRecord).then(function () {
        if (localStorage.config != null) {
            let config_jsobj = JSON.parse(localStorage.config)
            torrentFilter(config_jsobj)
        }
    })
}

function openOsusumeTab() {
    chrome.tabs.get(parseInt(localStorage.osusumetabid), function (tab) {
        if (chrome.runtime.lastError || tab == undefined) {
            chrome.tabs.create({
                url: "view/ts.html",
                active: true
            }, function (tab) {
                localStorage.osusumetabid = tab.id
            })
        } else {
            chrome.windows.update(tab.windowId, {
                focused: true
            })
            chrome.tabs.update(tab.id, {
                url: "view/ts.html",
                active: true
            }, function (tab) {})
        }
    })
}

chrome.alarms.create("mainloop", {
    delayInMinutes: 1,
    periodInMinutes: 5
})

chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === "mainloop") {
        looprun()
    }
})

looprun()