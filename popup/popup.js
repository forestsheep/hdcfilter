this.st = function () {
	var vm = new Vue({
		el: '#vt',
		data: {},
		ready: function () {},
		methods: {
			viewtorrent: function () {
				chrome.tabs.get(parseInt(localStorage.osusumetabid), function (tab) {
					if (tab == undefined) {
						chrome.tabs.create({
							url: "view/ts.html"
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
						}, function (tab) {
						})
					}
				})
			}
		}
	})
}
window.onload = st;