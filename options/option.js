this.st = function() {

	String.format = function(src){
		if (arguments.length == 0) return null;
		var args = Array.prototype.slice.call(arguments, 1);
		return src.replace(/\{(\d+)\}/g, function(m, i){
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
					minute: 0,
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
				}
			},
			show_right1 : true,
			show_right2 : false,
			show_right3 : false
		},
		ready: function() {
			if (localStorage.config != null) {
				this.config = JSON.parse(localStorage.config)
			}
		},
		methods: {
			do1: function() {
			},
			saveconfig: function () {
				localStorage.config = JSON.stringify(this.config)
			},
			one: function() {
				if (!this.show_right1) {
					this.show_right1 = true
					this.show_right2 = false
					this.show_right3 = false
				} else {
				}
			},
			two: function() {
				if (!this.show_right2) {
					this.show_right2 = true
					this.show_right1 = false
					this.show_right3 = false
				} else {
				}
			},
			three: function() {
				if (!this.show_righ3) {
					this.show_right3 = true
					this.show_right1 = false
					this.show_right2 = false
				} else {
				}
			}
		}
	})
}

window.onload = st;