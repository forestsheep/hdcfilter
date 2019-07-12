this.st = function () {

	String.format = function (src) {
		if (arguments.length == 0) return null;
		var args = Array.prototype.slice.call(arguments, 1);
		return src.replace(/\{(\d+)\}/g, function (m, i) {
			return args[i]
		})
	}

	var vm = new Vue({
		el: '#filter',
		data: {
			config: {
				seedpdl: {
					enable: true,
					ratio: 50
				},
				cdseed: {
					enable: true,
					choose: 0,
					nogt: 20,
					noeq: 1,
					nolt: 3
				},
				cddl: {
					enable: true,
					choose: 0,
					nogt: 100,
					noeq: 0,
					nolt: 100
				},
				elapsedtime: {
					enable: true,
					year: 0,
					month: 0,
					day: 0,
					hour: 2,
					minute: 0
				},
				freetime: {
					enable: true,
					day: 0,
					hour: 2
				},
				cdsize: {
					enable: true,
					choose: 0,
					nogt: 3,
					nolt: 100
				},
				cdavgprg: {
					enable: true,
					pg: 20
				},
				cmcheckloop: 5
			},
			general_visible: false,
			filter_visible: true,
		},
		mounted: function () {
			if (localStorage.config != null) {
				this.config = JSON.parse(localStorage.config)
				//upgrade code
				if (this.config.freetime == undefined) {
					this.config.freetime = {
						enable: true,
						day: 0,
						hour: 2
					}
				}
			}
			if (localStorage.general_visible != null) {
				if (localStorage.general_visible == "true") {
					this.general_visible = true
					this.filter_visible = false
				}
			}
			if (localStorage.filter_visible != null) {
				if (localStorage.filter_visible == "true") {
					this.filter_visible = true
					this.general_visible = false
				}
			}
		},
		methods: {
			do1: function () {},
			saveconfig: function () {
				localStorage.config = JSON.stringify(this.config)
			},
			show_general: function () {
				if (!this.general_visible) {
					this.general_visible = true
					this.filter_visible = false
					localStorage.general_visible = true
					localStorage.filter_visible = false
				}
			},
			show_filter: function () {
				if (!this.filter_visible) {
					this.filter_visible = true
					this.general_visible = false
					localStorage.filter_visible = true
					localStorage.general_visible = false
				}
			},
			checkAlarmUpdate: function () {
				localStorage.config = JSON.stringify(this.config)
				chrome.alarms.clear("mainloop", function (wasCleared) {
					if (wasCleared) {
						chrome.alarms.create("mainloop", {
							delayInMinutes: 1,
							periodInMinutes: parseInt(vm.config.cmcheckloop)
						})
					}
				})
			}
		}
	})
}

window.onload = st;