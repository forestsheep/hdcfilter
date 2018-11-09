this.st = function () {
	var vm = new Vue({
		el: '#vt',
		data: {
		},
		ready: function () {
		},
		methods: {
			viewtorrent: function () {
                chrome.tabs.create({
                    url: "view/ts.html"
                })
            }
		}
	})
}
window.onload = st;