this.st = function () {
	var vm = new Vue({
		el: '#vt',
		data: {},
		mounted: function () {},
		methods: {
			viewtorrent: function () {
				openOsusumePage()
			},
			viewoption: function () {
				chrome.tabs.create({
					url: "options/option.html"
				})
			}
		}
	})
}
window.onload = st;