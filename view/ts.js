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
			torrents: []
		},
		ready: function () {
			let dbopenrequest = window.indexedDB.open("lin", 1)
			dbopenrequest.onsuccess = function (event) {
				console.log("success")
				let idb = dbopenrequest.result
				let trans = idb.transaction(["fav"], "readwrite")
				let objectStore = trans.objectStore("fav")
				objectStore.getAll().onsuccess = function(event) {
					console.log(event.target.result);
					//vue的特殊写法
					vm.torrents.push(event.target.result)
				}
			}
		},
		methods: {
			do1: function () {}
		}
	})
}

window.onload = st;