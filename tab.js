var KEY = 'ediktabs1'

window.onload = function () {
    new Vue({
            el: '#app',
            data: {
                tabs: [],
                searchText: ''
            },
            methods: {
                getTabs: function () {
                    var self = this

                    var oldTabs = localStorage.getItem(KEY)
                    if (oldTabs != "undefined" && oldTabs != null) {
                        self.tabs = JSON.parse(oldTabs).sort(function (a, b) {
                            return b.id - a.id
                        })
                    }
                    //新进入
                    if (sessionStorage.getItem('history.length') != history.length) {
                        sessionStorage.setItem('history.length', history.length);
                    } else {
                        return
                    }
                    // var timestamp = new Date().getTime()
                    window['chrome']['tabs']['query']({}, function (tabs) {
                        var newTabs = [];
                        var j = 0
                        for (i in tabs) {
                            var theTab = tabs[i]

                            if (!theTab.active && theTab.hasOwnProperty("title")) {
                                var newTab = {
                                    id: theTab.id,
                                    title: theTab.title,
                                    url: theTab.url,
                                    favIconUrl: theTab.favIconUrl
                                }
                                newTabs.push(newTab)
                                chrome.tabs.remove(theTab.id, function () {
                                    // console.log('The tabs has been closed.');
                                });
                                j++
                            } else if (!theTab.active) {
                                chrome.tabs.remove(theTab.id, function () {
                                    // console.log('The tabs has been closed.');
                                });
                            }
                        }
                        if (j > 0) {
                            var tab = {}
                            tab.id = new Date().getTime()
                            tab.data = newTabs
                            self.tabs.unshift(tab)
                            self.saveTabs()
                        }
                    })

                },
                del: function (pid, id) {
                    var tabs = this.tabs
                    var newTabs = []
                    for (var i = 0; i < tabs.length; i++) {
                        var tab = tabs[i]
                        if (tab.id == pid) {
                            var newTab = []
                            for (var j = 0; j < tab.data.length; j++) {
                                var t = tab.data[j]
                                if (t.id != id) {
                                    newTab.push(t)
                                }
                            }
                            if (newTab.length > 0) {
                                newTabs.push({
                                    id: tab.id,
                                    data: newTab
                                })
                            }
                        } else {
                            newTabs.push(tab)
                        }
                    }
                    // this.tabs[parentIndex].data.splice(index, 1)
                    // if (this.tabs[parentIndex].data.length === 0) {
                    //     this.tabs.splice(parentIndex, 1)
                    // }
                    this.tabs = newTabs
                    this.saveTabs()
                },
                delAll: function (pid) {
                    var self = this
                    var tabs = this.tabs
                    var newTabs = []
                    for (var i = 0; i < tabs.length; i++) {
                        var tab = tabs[i]
                        if (tab.id == pid) {
                            if (self.searchText != '') {
                                var newTab = []
                                for (var j = 0; j < tab.data.length; j++) {
                                    var t = tab.data[j]
                                    if (t.title.indexOf(self.searchText) == -1) {
                                        newTab.push(t)
                                    }
                                }
                                if (newTab.length > 0) {
                                    newTabs.push({
                                        id: tab.id,
                                        data: newTab
                                    })
                                }
                            }
                        } else {
                            newTabs.push(tab)
                        }
                    }
                    this.tabs = newTabs
                    this.saveTabs()
                },
                open: function (pid, id, url) {
                    // var tab = this.tabs[parentIndex].data[index]
                    window.chrome.tabs.create({
                        // windowId: wId,
                        // index: 0,
                        url: url,
                        active: false,
                        pinned: false,
                        // openerTabId: tId
                    }, function (tab) {
                    });
                },
                openAll: function (pid) {
                    var self = this
                    var tabs = this.tabs
                    var newTabs = []
                    for (var i = 0; i < tabs.length; i++) {
                        var tab = tabs[i]
                        if (tab.id == pid) {
                            for (var j = 0; j < tab.data.length; j++) {
                                var t = tab.data[j]
                                if (self.searchText != '') {
                                    if (t.title.indexOf(self.searchText) != -1) {
                                        self.open(0, 0, t.url)
                                    }
                                } else {
                                    self.open(0, 0, t.url)
                                }

                            }
                        }
                    }

                },
                saveTabs: function () {
                    if (this.tabs != null) {
                        localStorage.setItem(KEY, JSON.stringify(this.tabs))
                    }
                }
            },
            mounted:

                function () {
                    this.getTabs()
                }

            ,
            computed: {
                getTabData: function () {
                    var self = this
                    var tabs = JSON.parse(JSON.stringify(this.tabs))
                    var arr = []
                    for (i in tabs) {
                        var tab = tabs[i]
                        var tabArr = {id: tab.id}
                        tabArr.data = tab.data.filter(function (value2) {
                            return value2.title.indexOf(self.searchText) != -1
                        })
                        if (tabArr.data.length > 0) {
                            arr.push(tabArr)
                        }
                    }
                    return arr
                }
            }
            ,
            filters: {
                formatDate: function (time) {
                    var date = new Date(time);
                    return formatDate(date, 'yyyy-MM-dd hh:mm');
                }
            }
        }
    )

}

function formatDate(date, fmt) {
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    var o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
    }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            var str = o[k] + ''
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
        }
    }
    return fmt
}

function padLeftZero(str) {
    return ('00' + str).substr(str.length)
}

