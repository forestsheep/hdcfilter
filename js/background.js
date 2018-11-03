String.format = function (src) {
    if (arguments.length === 0) return null
    let args = Array.prototype.slice.call(arguments, 1)
    return src.replace(/\{(\d+)\}/g, function (m, i) {
        return args[i]
    })
}

function parseDate(DateString) {
    let ptnyear = new RegExp(/\d+(?=年)/g)
    var totalmin = 0
    var rtyear
    if ((rtyear = ptnyear.exec(DateString)) != null) {
        totalmin += parseInt(rtyear[0]) * 60 * 24 * 30 * 12
    }
    
    let ptnmonth = new RegExp(/\d+(?=月)/g)
    var rtmonth
    if ((rtmonth = ptnmonth.exec(DateString)) != null) {
        totalmin += parseInt(rtmonth[0]) * 60 * 24 * 30
    }
    
    let ptnday = new RegExp(/\d+(?=天)/g)
    var rtday
    if ((rtday = ptnday.exec(DateString)) != null) {
        totalmin += parseInt(rtday[0]) * 60 *24
    }
    
    let ptnhour = new RegExp(/\d+(?=时)/g)
    var rthour
    if ((rthour = ptnhour.exec(DateString)) != null) {
        totalmin += parseInt(rthour[0]) * 60
    }
    
    let ptnminute = new RegExp(/\d+(?=分)/g)
    var rtminute
    if ((rtminute = ptnminute.exec(DateString)) != null) {
        totalmin += parseInt(rtminute[0])
    }
    return totalmin
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

        if (dfree.length > 0
            && dprogress.length === 0 //已经开始下载或下载过有进度条的则不进入筛选条件
            ) {
                db.transaction(function (tx) {
                    tx.executeSql('INSERT INTO info (name, name2, url, time, size, seed, dl, complete, free) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)', [dname1.text(), dname2.text(), dname1.attr("href"), dtime.text(), dsize.text(), dseed.text() == "" ? 0 : dseed.text(), ddl.text() == "" ? 0 : ddl.text(), (dcomplete.length > 0 ? dcomplete.text() : "0"), dfree.attr("alt")])
                 })
            }
    }
}

function ergRecord() {
    db.transaction(function (tx) {
        tx.executeSql('SELECT name, url FROM info', [], function (tx, results) {
            for (var i = 0;  i < results.rows.length; i++) {
                // console.log(results.rows.item(i).name)
                // console.log(results.rows.item(i).url)
                vDetail(results.rows.item(i).name, results.rows.item(i).url)
            }
        })
    })
}

function vDetail(name, innerurl) {
    $.ajax({
        url: "https://hdchina.org/" + innerurl,
        method: "get",
        async: true,
        success: function (data, textStatus, jqXHR) {
            anaDetail(name, data)
        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    })
}

function anaDetail(name, htmlResponse) {
    let doc = $(htmlResponse)
    //平均速度
    let savgspeed = "#site_content > div.details_box > table.table_details > tbody > tr:nth-child({0}) > td.rowfollow > span:nth-child(3) > b"
    let stotalspeed = "#site_content > div.details_box > table.table_details > tbody > tr:nth-child({0}) > td.rowfollow > span:nth-child(4) > b"
    let savgprogress = "#site_content > div.details_box > table.table_details > tbody > tr:nth-child({0}) > td.rowfollow > span:nth-child(1)"
    //由于表格不是固定，内容过多的情况下，数据可能是在第5条之后
    for (let i = 5; i < 30; i++) {
        let davgspeed = doc.find(String.format(savgspeed, i))
        let dtotalspeed = doc.find(String.format(stotalspeed, i))
        let davgprogress = doc.find(String.format(savgprogress, i))
        if (davgspeed.text() !== "") {
            console.log(name)
            // 平均进度
            let ptn = new RegExp(/\d+(?=%)/g)
            var pt
            if ((pt = ptn.exec(davgprogress.text())) != null) {
                console.log(pt[0])
            }
            db.transaction(function (tx) {
                tx.executeSql('UPDATE info SET avgprg=?, avgspd=?, totalspd=? WHERE name=?', [parseInt(pt[0]), davgspeed.text(), dtotalspeed.text(), name], function (tx, results) {
                })
            })
            break
        } else {
        }
    }
}

let db = openDatabase('hdctdb', '1.0', 'save sth', 2 * 1024 * 1024)

db.transaction(function (tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS info (name unique, name2, url, time, size, seed INTEGER, dl INTEGER, complete, free, avgprg INTEGER, avgspd, totalspd)')
    tx.executeSql('DELETE FROM info')
})


// vList()

function torrentFilter(ltseed, seedpdl, ltavgprg) {
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM info', [], function (tx, results) {
            var count = 0
            for (var i = 0;  i < results.rows.length; i++) {
                if (results.rows.item(i).seed * seedpdl > results.rows.item(i).dl) {
                    continue
                } else if (results.rows.item(i).seed > ltseed) {
                    continue
                } else if (results.rows.item(i).avgprg > ltavgprg) {
                    continue
                }
                console.log(results.rows.item(i).name)
                console.log(results.rows.item(i).name2)
                console.log(results.rows.item(i).time)
                console.log(results.rows.item(i).avgprg)
                console.log(parseDate(results.rows.item(i).time))
                console.log("seed:" + results.rows.item(i).seed + "  dl:" + results.rows.item(i).dl)
                count++
            }
            msgs = "为您推荐了" + count + "条"
            if (chrome.notifications) {
                var opt = {
                    type: "basic",
                    iconUrl: '/icons/e.png',
                    title: "下点种子吗？",
                    message: msgs,
                    contextMessage: "HDC种子提醒",
                    buttons: [{
                        title: '查看详情',
                    }, {
                        title: '我知道了',
                    }]
                };
                chrome.notifications.create("", opt);
            }
        })
    })
    
}

chrome.notifications.onButtonClicked.addListener(function(id, buttonIndex) {
    switch (buttonIndex) {
        case 0:
            chrome.tabs.create({
                url: "https://cybozush.cybozu.cn/g/timecard/index.csp?"
            });
            break;
        case 1:
            break;
    }
    chrome.notifications.clear(id);
});

chrome.alarms.create("mainloop", {
    delayInMinutes: 1,
    periodInMinutes: 1
})

chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === "mainloop") {
        // looprun()
    }
})

function looprun() {
    // vList()
    // setTimeout(() => {
    //     ergRecord()
    // }, 5000)
    // setTimeout(() => {
    //     torrentFilter(2, 20, 40)
    // }, 20000)
    // console.log(JSON.parse(localStorage.config))
}

looprun()


