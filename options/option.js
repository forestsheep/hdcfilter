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
			}
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
			}
		}
	})
}

window.onload = st;