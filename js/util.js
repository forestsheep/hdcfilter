function stringFormat(src) {
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

function openOsusumePage() {
    if (localStorage.osusumetabid != null) {
        chrome.tabs.get(parseInt(localStorage.osusumetabid), function (tab) {
            if (chrome.runtime.lastError || tab == undefined) {
                createTsHtml()
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
    } else {
        createTsHtml()
    }
}

function createTsHtml() {
    chrome.tabs.create({
        url: "view/ts.html"
    }, function (tab) {
        localStorage.osusumetabid = tab.id
    })
}