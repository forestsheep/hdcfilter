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
			no_more_torrents: []
		},
		mounted: function () {
			let _this = this
			openDB().then(getOsusumeItems).then(function (value) {
				_this.torrents = value
			})
		},
		methods: {
			noMoreRemind: function (item, index) {
				this.torrents.splice(index, 1)
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
			}
		}
	})
}

window.onload = st;