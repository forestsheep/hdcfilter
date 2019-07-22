this.st = function () {

    String.format = function (src) {
        if (arguments.length == 0) return null;
        var args = Array.prototype.slice.call(arguments, 1);
        return src.replace(/\{(\d+)\}/g, function (m, i) {
            return args[i]
        })
    }

    var vm = new Vue({
        el: '#torrentlist',
        data: {
            torrents: [],
            no_more_torrents: [],
            sort: {
                release_time: null,
                size: null,
                seed: null,
                downloading: null,
                avg_prg: null,
                free_remain: null
            }

        },
        mounted: function () {
            let _this = this
            openDB().then(getOsusumeItems).then(function (value) {
                _this.torrents = value
            })
        },
        methods: {
            noMoreRemind: function (item, index) {
                setTimeout(() => {
                    this.torrents.splice(index, 1)
                }, 300);
                let dbopenrequest = window.indexedDB.open("lin", 2)
                dbopenrequest.onsuccess = function (event) {
                    let idb = dbopenrequest.result
                    let trans = idb.transaction(["no_more_remind"], "readwrite")
                    let objectStore = trans.objectStore("no_more_remind")
                    let q = objectStore.add(item)
                    q.onsuccess = function (event) {}
                    q.onerror = function (event) {
                        console.log(event.target)
                    }
                }
            },
            noMoreRemindAll: function () {
                let _this = this

                function giveTorrents() {
                    return new Promise((resolve, reject) => {
                        resolve(_this.torrents)
                    })
                }
                openDB().then(giveTorrents).then(noRemindAll).then(function () {
                    _this.torrents = []
                })
            },
            clearNoMoreRemindAll: function () {
                let _this = this
                openDB().then(clearRemindAll).then(getOsusumeItems).then(function (value) {
                    _this.torrents = value
                })
            },
            clearOtherSort: function (sortName) {
                for (i in this.sort) {
                    if (i != sortName) {
                        this.sort[i] = null
                    }
                }
            },
            sortByReleaseTime: function () {
                this.clearOtherSort("release_time")
                if (this.sort.release_time) {
                    this.torrents.sort(function (a, b) {
                        if (parseDate(a.time) < parseDate(b.time)) {
                            return 1
                        } else {
                            return -1
                        }
                    })
                    this.sort.release_time = false
                } else {
                    this.torrents.sort(function (a, b) {
                        if (parseDate(a.time) > parseDate(b.time)) {
                            return 1
                        } else {
                            return -1
                        }
                    })
                    this.sort.release_time = true
                }
            },
            sortBySize: function () {
                this.clearOtherSort("size")
                if (this.sort.size) {
                    this.torrents.sort(function (a, b) {
                        console.log(parseSize(a.size))
                        console.log(parseSize(b.size))
                        console.log(parseSize(a.size) - parseSize(b.size))
                        if (parseSize(a.size) - parseSize(b.size) > 0) {
                            return 1
                        } else {
                            return -1
                        }
                    })
                    this.sort.size = false
                } else {
                    this.torrents.sort(function (a, b) {
                        if (parseSize(b.size) - parseSize(a.size) > 0) {
                            return 1
                        } else {
                            return -1
                        }
                    })
                    this.sort.size = true
                }
            },
            sortBySeed: function () {
                this.clearOtherSort("seed")
                if (this.sort.seed) {
                    this.torrents.sort(function (a, b) {
                        if (a.seed - b.seed < 0) {
                            return 1
                        } else {
                            return -1
                        }
                    })
                    this.sort.seed = false
                } else {
                    this.torrents.sort(function (a, b) {
                        if (b.seed - a.seed < 0) {
                            return 1
                        } else {
                            return -1
                        }
                    })
                    this.sort.seed = true
                }
            },
            sortByDownloading: function () {
                this.clearOtherSort("downloading")
                if (this.sort.downloading) {
                    this.torrents.sort(function (a, b) {
                        if (a.dl < b.dl) {
                            return 1
                        } else {
                            return -1
                        }
                    })
                    this.sort.downloading = false
                } else {
                    this.torrents.sort(function (a, b) {
                        if (b.dl < a.dl) {
                            return 1
                        } else {
                            return -1
                        }
                    })
                    this.sort.downloading = true
                }
            },
            sortByAvgPrg: function () {
                this.clearOtherSort("avg_prg")
                if (this.sort.avg_prg) {
                    this.torrents.sort(function (a, b) {
                        if (a.avgprg - b.avgprg < 0) {
                            return 1
                        } else {
                            return -1
                        }
                    })
                    this.sort.avg_prg = false
                } else {
                    this.torrents.sort(function (a, b) {
                        if (b.avgprg - a.avgprg < 0) {
                            return 1
                        } else {
                            return -1
                        }
                    })
                    this.sort.avg_prg = true
                }
            },
            sortByFreeRemain: function () {
                this.clearOtherSort("free_remain")
                if (this.sort.free_remain) {
                    this.torrents.sort(function (a, b) {
                        if (parseDate(a.freetime) < parseDate(b.freetime)) {
                            return 1
                        } else {
                            return -1
                        }
                    })
                    this.sort.free_remain = false
                } else {
                    this.torrents.sort(function (a, b) {
                        if (parseDate(a.freetime) > parseDate(b.freetime)) {
                            return 1
                        } else {
                            return -1
                        }
                    })
                    this.sort.free_remain = true
                }
            },
            gotoOption: function () {
                chrome.tabs.create({
					url: "options/option.html"
				})
            }
        }
    })
}

window.onload = st;