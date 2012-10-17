require.memoize("app",[ "vendor/jquery", "lib/clock/countdown", "lib/clock/flipclock", "lib/clock/layout/flipclock", "lib/clock/layout/flipclockSeconds", "lib/clock/layout/countdown", "lib/ui/dialog", "lib/ui/buttons", "lib/ui/toggle", "lib/ui/blinker", "lib/utils", "lib/analytics" ],
function(require, exports, module) {
var $ = require("vendor/jquery").jQuery, config = require("lib/config"), analytics = require("lib/analytics"), utils = require("lib/utils"), flipclock = require("lib/clock/flipclock"), countdown = require("lib/clock/countdown"), layouts = {
    timeAMPM: require("lib/clock/layout/flipclock").layout,
    timeAMPMsec: require("lib/clock/layout/flipclockSeconds").layout,
    countdown: require("lib/clock/layout/countdown").layout
}, dialog = require("lib/ui/dialog"), buttons = require("lib/ui/buttons"), toggle = require("lib/ui/toggle"), blinker = require("lib/ui/blinker");
var layout, countdown_blink, active_page = "", App = {
    page: {
        clock: "clock",
        countdown: "countdown"
    }
};
exports.analytics = analytics;
exports.boot = function() {
    countdown.init();
    $(document).on({
        hide_dialog: dialog.hide,
        save_settings: function() {
            var options_dialog = dialog.get("options");
            dialog.hide();
            $(".toggle", options_dialog).each(function(i) {
                var toggle = $(this);
                toggle.trigger("confirm");
                var binding = toggle.data("binding"), value = toggle.data("value");
                config.set(binding, value);
            });
            if (active_page === App.page.clock) {
                stopClock();
                initClock();
                resize();
            }
        },
        hide_settings: function() {
            var options_dialog = dialog.get("options");
            dialog.hide();
            $(".toggle", options_dialog).trigger("reset");
        }
    });
    $(window).resize(resize);
    $(window).hashchange(function() {
        return function() {
            var splitHash = [], section = "", data = "";
            var hash = location.hash;
            analytics._gaq && analytics._gaq.push([ "_trackPageview", hash ]);
            if (hash.indexOf("#") >= 0) {
                hash = hash.replace("#!", "");
                hash = hash.replace("#", "");
                splitHash = hash.split("/");
                section = splitHash[1];
                data = splitHash[2];
            }
            switch (section) {
              case "c":
              case "countdown":
                stopClock();
                active_page = App.page.countdown;
                var params = utils.parseTimeOutOfParams(data);
                layout = countdown.load(params);
                break;
              default:
                if (active_page === App.page.clock) break;
                stopClock();
                active_page = App.page.clock;
                initClock();
            }
            resize();
        };
    }());
    $(function documentReady() {
        dialog.create({
            id: "about",
            template: "templates/about.twig",
            container: $("#body")
        }).create({
            id: "countdown",
            template: "templates/countdown.twig",
            container: $("#body")
        }).create({
            id: "options",
            template: "templates/options.twig",
            container: $("#body"),
            data: config.data()
        }, function(content) {
            toggle.init($(".toggle", content));
        }).complete(function() {
            var container = $(".dialog_container");
            container.bind("touchend mouseup", function(e) {
                if (e.srcElement.className.indexOf("dialog_container") > -1) {
                    dialog.hide();
                }
            });
        });
        $("#toolbar").on("click", function(e) {
            e.preventDefault();
            return false;
        });
        var toggle_toolbar = function(e) {
            if (e.returnValue === false) return false;
            $("body").toggleClass("toolbar_active");
            e.preventDefault();
        };
        $("#container, #toolbarContainer").bind({
            click: toggle_toolbar,
            touchstart: toggle_toolbar
        });
        $("#container").addClass("blink_transition");
        buttons.init();
        setTimeout(function() {
            $(window).hashchange();
        }, 10);
    });
};
function center(element) {
    var element_width = element.outerWidth(), element_height = element.outerHeight(), window_width = $("body").width(), window_height = $("body").height();
    if (element_height < window_height) {
        element.css("top", (window_height - element_height) / 2 + "px");
    }
    if (element_width < window_width) {
        element.css("left", (window_width - element_width) / 2 + "px");
    }
}
function resize(e) {
    center($(".time_box"));
    center($(".countdown_box"));
}
function stopClock() {
    $("#container").empty();
    if (layout) {
        layout.stop(false);
        layout.unload();
    }
}
function initClock() {
    var params = {
        container: $("#container"),
        start: true
    }, format = config.getShowSeconds() ? layouts.timeAMPMsec : layouts.timeAMPM;
    layout = flipclock.load(format, params);
}

});require.memoize("vendor/jquery",[],
function(require, exports, module) {
(function(a, b) {
    function G(a) {
        var b = F[a] = {};
        return p.each(a.split(s), function(a, c) {
            b[c] = !0;
        }), b;
    }
    function J(a, c, d) {
        if (d === b && a.nodeType === 1) {
            var e = "data-" + c.replace(I, "-$1").toLowerCase();
            d = a.getAttribute(e);
            if (typeof d == "string") {
                try {
                    d = d === "true" ? !0 : d === "false" ? !1 : d === "null" ? null : +d + "" === d ? +d : H.test(d) ? p.parseJSON(d) : d;
                } catch (f) {}
                p.data(a, c, d);
            } else d = b;
        }
        return d;
    }
    function K(a) {
        var b;
        for (b in a) {
            if (b === "data" && p.isEmptyObject(a[b])) continue;
            if (b !== "toJSON") return !1;
        }
        return !0;
    }
    function ba() {
        return !1;
    }
    function bb() {
        return !0;
    }
    function bh(a) {
        return !a || !a.parentNode || a.parentNode.nodeType === 11;
    }
    function bi(a, b) {
        do a = a[b]; while (a && a.nodeType !== 1);
        return a;
    }
    function bj(a, b, c) {
        b = b || 0;
        if (p.isFunction(b)) return p.grep(a, function(a, d) {
            var e = !!b.call(a, d, a);
            return e === c;
        });
        if (b.nodeType) return p.grep(a, function(a, d) {
            return a === b === c;
        });
        if (typeof b == "string") {
            var d = p.grep(a, function(a) {
                return a.nodeType === 1;
            });
            if (be.test(b)) return p.filter(b, d, !c);
            b = p.filter(b, d);
        }
        return p.grep(a, function(a, d) {
            return p.inArray(a, b) >= 0 === c;
        });
    }
    function bk(a) {
        var b = bl.split("|"), c = a.createDocumentFragment();
        if (c.createElement) while (b.length) c.createElement(b.pop());
        return c;
    }
    function bC(a, b) {
        return a.getElementsByTagName(b)[0] || a.appendChild(a.ownerDocument.createElement(b));
    }
    function bD(a, b) {
        if (b.nodeType !== 1 || !p.hasData(a)) return;
        var c, d, e, f = p._data(a), g = p._data(b, f), h = f.events;
        if (h) {
            delete g.handle, g.events = {};
            for (c in h) for (d = 0, e = h[c].length; d < e; d++) p.event.add(b, c, h[c][d]);
        }
        g.data && (g.data = p.extend({}, g.data));
    }
    function bE(a, b) {
        var c;
        if (b.nodeType !== 1) return;
        b.clearAttributes && b.clearAttributes(), b.mergeAttributes && b.mergeAttributes(a), c = b.nodeName.toLowerCase(), c === "object" ? (b.parentNode && (b.outerHTML = a.outerHTML), p.support.html5Clone && a.innerHTML && !p.trim(b.innerHTML) && (b.innerHTML = a.innerHTML)) : c === "input" && bv.test(a.type) ? (b.defaultChecked = b.checked = a.checked, b.value !== a.value && (b.value = a.value)) : c === "option" ? b.selected = a.defaultSelected : c === "input" || c === "textarea" ? b.defaultValue = a.defaultValue : c === "script" && b.text !== a.text && (b.text = a.text), b.removeAttribute(p.expando);
    }
    function bF(a) {
        return typeof a.getElementsByTagName != "undefined" ? a.getElementsByTagName("*") : typeof a.querySelectorAll != "undefined" ? a.querySelectorAll("*") : [];
    }
    function bG(a) {
        bv.test(a.type) && (a.defaultChecked = a.checked);
    }
    function bY(a, b) {
        if (b in a) return b;
        var c = b.charAt(0).toUpperCase() + b.slice(1), d = b, e = bW.length;
        while (e--) {
            b = bW[e] + c;
            if (b in a) return b;
        }
        return d;
    }
    function bZ(a, b) {
        return a = b || a, p.css(a, "display") === "none" || !p.contains(a.ownerDocument, a);
    }
    function b$(a, b) {
        var c, d, e = [], f = 0, g = a.length;
        for (; f < g; f++) {
            c = a[f];
            if (!c.style) continue;
            e[f] = p._data(c, "olddisplay"), b ? (!e[f] && c.style.display === "none" && (c.style.display = ""), c.style.display === "" && bZ(c) && (e[f] = p._data(c, "olddisplay", cc(c.nodeName)))) : (d = bH(c, "display"), !e[f] && d !== "none" && p._data(c, "olddisplay", d));
        }
        for (f = 0; f < g; f++) {
            c = a[f];
            if (!c.style) continue;
            if (!b || c.style.display === "none" || c.style.display === "") c.style.display = b ? e[f] || "" : "none";
        }
        return a;
    }
    function b_(a, b, c) {
        var d = bP.exec(b);
        return d ? Math.max(0, d[1] - (c || 0)) + (d[2] || "px") : b;
    }
    function ca(a, b, c, d) {
        var e = c === (d ? "border" : "content") ? 4 : b === "width" ? 1 : 0, f = 0;
        for (; e < 4; e += 2) c === "margin" && (f += p.css(a, c + bV[e], !0)), d ? (c === "content" && (f -= parseFloat(bH(a, "padding" + bV[e])) || 0), c !== "margin" && (f -= parseFloat(bH(a, "border" + bV[e] + "Width")) || 0)) : (f += parseFloat(bH(a, "padding" + bV[e])) || 0, c !== "padding" && (f += parseFloat(bH(a, "border" + bV[e] + "Width")) || 0));
        return f;
    }
    function cb(a, b, c) {
        var d = b === "width" ? a.offsetWidth : a.offsetHeight, e = !0, f = p.support.boxSizing && p.css(a, "boxSizing") === "border-box";
        if (d <= 0 || d == null) {
            d = bH(a, b);
            if (d < 0 || d == null) d = a.style[b];
            if (bQ.test(d)) return d;
            e = f && (p.support.boxSizingReliable || d === a.style[b]), d = parseFloat(d) || 0;
        }
        return d + ca(a, b, c || (f ? "border" : "content"), e) + "px";
    }
    function cc(a) {
        if (bS[a]) return bS[a];
        var b = p("<" + a + ">").appendTo(e.body), c = b.css("display");
        b.remove();
        if (c === "none" || c === "") {
            bI = e.body.appendChild(bI || p.extend(e.createElement("iframe"), {
                frameBorder: 0,
                width: 0,
                height: 0
            }));
            if (!bJ || !bI.createElement) bJ = (bI.contentWindow || bI.contentDocument).document, bJ.write("<!doctype html><html><body>"), bJ.close();
            b = bJ.body.appendChild(bJ.createElement(a)), c = bH(b, "display"), e.body.removeChild(bI);
        }
        return bS[a] = c, c;
    }
    function ci(a, b, c, d) {
        var e;
        if (p.isArray(b)) p.each(b, function(b, e) {
            c || ce.test(a) ? d(a, e) : ci(a + "[" + (typeof e == "object" ? b : "") + "]", e, c, d);
        }); else if (!c && p.type(b) === "object") for (e in b) ci(a + "[" + e + "]", b[e], c, d); else d(a, b);
    }
    function cz(a) {
        return function(b, c) {
            typeof b != "string" && (c = b, b = "*");
            var d, e, f, g = b.toLowerCase().split(s), h = 0, i = g.length;
            if (p.isFunction(c)) for (; h < i; h++) d = g[h], f = /^\+/.test(d), f && (d = d.substr(1) || "*"), e = a[d] = a[d] || [], e[f ? "unshift" : "push"](c);
        };
    }
    function cA(a, c, d, e, f, g) {
        f = f || c.dataTypes[0], g = g || {}, g[f] = !0;
        var h, i = a[f], j = 0, k = i ? i.length : 0, l = a === cv;
        for (; j < k && (l || !h); j++) h = i[j](c, d, e), typeof h == "string" && (!l || g[h] ? h = b : (c.dataTypes.unshift(h), h = cA(a, c, d, e, h, g)));
        return (l || !h) && !g["*"] && (h = cA(a, c, d, e, "*", g)), h;
    }
    function cB(a, c) {
        var d, e, f = p.ajaxSettings.flatOptions || {};
        for (d in c) c[d] !== b && ((f[d] ? a : e || (e = {}))[d] = c[d]);
        e && p.extend(!0, a, e);
    }
    function cC(a, c, d) {
        var e, f, g, h, i = a.contents, j = a.dataTypes, k = a.responseFields;
        for (f in k) f in d && (c[k[f]] = d[f]);
        while (j[0] === "*") j.shift(), e === b && (e = a.mimeType || c.getResponseHeader("content-type"));
        if (e) for (f in i) if (i[f] && i[f].test(e)) {
            j.unshift(f);
            break;
        }
        if (j[0] in d) g = j[0]; else {
            for (f in d) {
                if (!j[0] || a.converters[f + " " + j[0]]) {
                    g = f;
                    break;
                }
                h || (h = f);
            }
            g = g || h;
        }
        if (g) return g !== j[0] && j.unshift(g), d[g];
    }
    function cD(a, b) {
        var c, d, e, f, g = a.dataTypes.slice(), h = g[0], i = {}, j = 0;
        a.dataFilter && (b = a.dataFilter(b, a.dataType));
        if (g[1]) for (c in a.converters) i[c.toLowerCase()] = a.converters[c];
        for (; e = g[++j]; ) if (e !== "*") {
            if (h !== "*" && h !== e) {
                c = i[h + " " + e] || i["* " + e];
                if (!c) for (d in i) {
                    f = d.split(" ");
                    if (f[1] === e) {
                        c = i[h + " " + f[0]] || i["* " + f[0]];
                        if (c) {
                            c === !0 ? c = i[d] : i[d] !== !0 && (e = f[0], g.splice(j--, 0, e));
                            break;
                        }
                    }
                }
                if (c !== !0) if (c && a["throws"]) b = c(b); else try {
                    b = c(b);
                } catch (k) {
                    return {
                        state: "parsererror",
                        error: c ? k : "No conversion from " + h + " to " + e
                    };
                }
            }
            h = e;
        }
        return {
            state: "success",
            data: b
        };
    }
    function cL() {
        try {
            return new a.XMLHttpRequest;
        } catch (b) {}
    }
    function cM() {
        try {
            return new a.ActiveXObject("Microsoft.XMLHTTP");
        } catch (b) {}
    }
    function cU() {
        return setTimeout(function() {
            cN = b;
        }, 0), cN = p.now();
    }
    function cV(a, b) {
        p.each(b, function(b, c) {
            var d = (cT[b] || []).concat(cT["*"]), e = 0, f = d.length;
            for (; e < f; e++) if (d[e].call(a, b, c)) return;
        });
    }
    function cW(a, b, c) {
        var d, e = 0, f = 0, g = cS.length, h = p.Deferred().always(function() {
            delete i.elem;
        }), i = function() {
            var b = cN || cU(), c = Math.max(0, j.startTime + j.duration - b), d = 1 - (c / j.duration || 0), e = 0, f = j.tweens.length;
            for (; e < f; e++) j.tweens[e].run(d);
            return h.notifyWith(a, [ j, d, c ]), d < 1 && f ? c : (h.resolveWith(a, [ j ]), !1);
        }, j = h.promise({
            elem: a,
            props: p.extend({}, b),
            opts: p.extend(!0, {
                specialEasing: {}
            }, c),
            originalProperties: b,
            originalOptions: c,
            startTime: cN || cU(),
            duration: c.duration,
            tweens: [],
            createTween: function(b, c, d) {
                var e = p.Tween(a, j.opts, b, c, j.opts.specialEasing[b] || j.opts.easing);
                return j.tweens.push(e), e;
            },
            stop: function(b) {
                var c = 0, d = b ? j.tweens.length : 0;
                for (; c < d; c++) j.tweens[c].run(1);
                return b ? h.resolveWith(a, [ j, b ]) : h.rejectWith(a, [ j, b ]), this;
            }
        }), k = j.props;
        cX(k, j.opts.specialEasing);
        for (; e < g; e++) {
            d = cS[e].call(j, a, k, j.opts);
            if (d) return d;
        }
        return cV(j, k), p.isFunction(j.opts.start) && j.opts.start.call(a, j), p.fx.timer(p.extend(i, {
            anim: j,
            queue: j.opts.queue,
            elem: a
        })), j.progress(j.opts.progress).done(j.opts.done, j.opts.complete).fail(j.opts.fail).always(j.opts.always);
    }
    function cX(a, b) {
        var c, d, e, f, g;
        for (c in a) {
            d = p.camelCase(c), e = b[d], f = a[c], p.isArray(f) && (e = f[1], f = a[c] = f[0]), c !== d && (a[d] = f, delete a[c]), g = p.cssHooks[d];
            if (g && "expand" in g) {
                f = g.expand(f), delete a[d];
                for (c in f) c in a || (a[c] = f[c], b[c] = e);
            } else b[d] = e;
        }
    }
    function cY(a, b, c) {
        var d, e, f, g, h, i, j, k, l = this, m = a.style, n = {}, o = [], q = a.nodeType && bZ(a);
        c.queue || (j = p._queueHooks(a, "fx"), j.unqueued == null && (j.unqueued = 0, k = j.empty.fire, j.empty.fire = function() {
            j.unqueued || k();
        }), j.unqueued++, l.always(function() {
            l.always(function() {
                j.unqueued--, p.queue(a, "fx").length || j.empty.fire();
            });
        })), a.nodeType === 1 && ("height" in b || "width" in b) && (c.overflow = [ m.overflow, m.overflowX, m.overflowY ], p.css(a, "display") === "inline" && p.css(a, "float") === "none" && (!p.support.inlineBlockNeedsLayout || cc(a.nodeName) === "inline" ? m.display = "inline-block" : m.zoom = 1)), c.overflow && (m.overflow = "hidden", p.support.shrinkWrapBlocks || l.done(function() {
            m.overflow = c.overflow[0], m.overflowX = c.overflow[1], m.overflowY = c.overflow[2];
        }));
        for (d in b) {
            f = b[d];
            if (cP.exec(f)) {
                delete b[d];
                if (f === (q ? "hide" : "show")) continue;
                o.push(d);
            }
        }
        g = o.length;
        if (g) {
            h = p._data(a, "fxshow") || p._data(a, "fxshow", {}), q ? p(a).show() : l.done(function() {
                p(a).hide();
            }), l.done(function() {
                var b;
                p.removeData(a, "fxshow", !0);
                for (b in n) p.style(a, b, n[b]);
            });
            for (d = 0; d < g; d++) e = o[d], i = l.createTween(e, q ? h[e] : 0), n[e] = h[e] || p.style(a, e), e in h || (h[e] = i.start, q && (i.end = i.start, i.start = e === "width" || e === "height" ? 1 : 0));
        }
    }
    function cZ(a, b, c, d, e) {
        return new cZ.prototype.init(a, b, c, d, e);
    }
    function c$(a, b) {
        var c, d = {
            height: a
        }, e = 0;
        b = b ? 1 : 0;
        for (; e < 4; e += 2 - b) c = bV[e], d["margin" + c] = d["padding" + c] = a;
        return b && (d.opacity = d.width = a), d;
    }
    function da(a) {
        return p.isWindow(a) ? a : a.nodeType === 9 ? a.defaultView || a.parentWindow : !1;
    }
    var c, d, e = a.document, f = a.location, g = a.navigator, h = a.jQuery, i = a.$, j = Array.prototype.push, k = Array.prototype.slice, l = Array.prototype.indexOf, m = Object.prototype.toString, n = Object.prototype.hasOwnProperty, o = String.prototype.trim, p = function(a, b) {
        return new p.fn.init(a, b, c);
    }, q = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source, r = /\S/, s = /\s+/, t = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, u = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/, v = /^<(\w+)\s*\/?>(?:<\/\1>|)$/, w = /^[\],:{}\s]*$/, x = /(?:^|:|,)(?:\s*\[)+/g, y = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g, z = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g, A = /^-ms-/, B = /-([\da-z])/gi, C = function(a, b) {
        return (b + "").toUpperCase();
    }, D = function() {
        e.addEventListener ? (e.removeEventListener("DOMContentLoaded", D, !1), p.ready()) : e.readyState === "complete" && (e.detachEvent("onreadystatechange", D), p.ready());
    }, E = {};
    p.fn = p.prototype = {
        constructor: p,
        init: function(a, c, d) {
            var f, g, h, i;
            if (!a) return this;
            if (a.nodeType) return this.context = this[0] = a, this.length = 1, this;
            if (typeof a == "string") {
                a.charAt(0) === "<" && a.charAt(a.length - 1) === ">" && a.length >= 3 ? f = [ null, a, null ] : f = u.exec(a);
                if (f && (f[1] || !c)) {
                    if (f[1]) return c = c instanceof p ? c[0] : c, i = c && c.nodeType ? c.ownerDocument || c : e, a = p.parseHTML(f[1], i, !0), v.test(f[1]) && p.isPlainObject(c) && this.attr.call(a, c, !0), p.merge(this, a);
                    g = e.getElementById(f[2]);
                    if (g && g.parentNode) {
                        if (g.id !== f[2]) return d.find(a);
                        this.length = 1, this[0] = g;
                    }
                    return this.context = e, this.selector = a, this;
                }
                return !c || c.jquery ? (c || d).find(a) : this.constructor(c).find(a);
            }
            return p.isFunction(a) ? d.ready(a) : (a.selector !== b && (this.selector = a.selector, this.context = a.context), p.makeArray(a, this));
        },
        selector: "",
        jquery: "1.8.2",
        length: 0,
        size: function() {
            return this.length;
        },
        toArray: function() {
            return k.call(this);
        },
        get: function(a) {
            return a == null ? this.toArray() : a < 0 ? this[this.length + a] : this[a];
        },
        pushStack: function(a, b, c) {
            var d = p.merge(this.constructor(), a);
            return d.prevObject = this, d.context = this.context, b === "find" ? d.selector = this.selector + (this.selector ? " " : "") + c : b && (d.selector = this.selector + "." + b + "(" + c + ")"), d;
        },
        each: function(a, b) {
            return p.each(this, a, b);
        },
        ready: function(a) {
            return p.ready.promise().done(a), this;
        },
        eq: function(a) {
            return a = +a, a === -1 ? this.slice(a) : this.slice(a, a + 1);
        },
        first: function() {
            return this.eq(0);
        },
        last: function() {
            return this.eq(-1);
        },
        slice: function() {
            return this.pushStack(k.apply(this, arguments), "slice", k.call(arguments).join(","));
        },
        map: function(a) {
            return this.pushStack(p.map(this, function(b, c) {
                return a.call(b, c, b);
            }));
        },
        end: function() {
            return this.prevObject || this.constructor(null);
        },
        push: j,
        sort: [].sort,
        splice: [].splice
    }, p.fn.init.prototype = p.fn, p.extend = p.fn.extend = function() {
        var a, c, d, e, f, g, h = arguments[0] || {}, i = 1, j = arguments.length, k = !1;
        typeof h == "boolean" && (k = h, h = arguments[1] || {}, i = 2), typeof h != "object" && !p.isFunction(h) && (h = {}), j === i && (h = this, --i);
        for (; i < j; i++) if ((a = arguments[i]) != null) for (c in a) {
            d = h[c], e = a[c];
            if (h === e) continue;
            k && e && (p.isPlainObject(e) || (f = p.isArray(e))) ? (f ? (f = !1, g = d && p.isArray(d) ? d : []) : g = d && p.isPlainObject(d) ? d : {}, h[c] = p.extend(k, g, e)) : e !== b && (h[c] = e);
        }
        return h;
    }, p.extend({
        noConflict: function(b) {
            return a.$ === p && (a.$ = i), b && a.jQuery === p && (a.jQuery = h), p;
        },
        isReady: !1,
        readyWait: 1,
        holdReady: function(a) {
            a ? p.readyWait++ : p.ready(!0);
        },
        ready: function(a) {
            if (a === !0 ? --p.readyWait : p.isReady) return;
            if (!e.body) return setTimeout(p.ready, 1);
            p.isReady = !0;
            if (a !== !0 && --p.readyWait > 0) return;
            d.resolveWith(e, [ p ]), p.fn.trigger && p(e).trigger("ready").off("ready");
        },
        isFunction: function(a) {
            return p.type(a) === "function";
        },
        isArray: Array.isArray || function(a) {
            return p.type(a) === "array";
        },
        isWindow: function(a) {
            return a != null && a == a.window;
        },
        isNumeric: function(a) {
            return !isNaN(parseFloat(a)) && isFinite(a);
        },
        type: function(a) {
            return a == null ? String(a) : E[m.call(a)] || "object";
        },
        isPlainObject: function(a) {
            if (!a || p.type(a) !== "object" || a.nodeType || p.isWindow(a)) return !1;
            try {
                if (a.constructor && !n.call(a, "constructor") && !n.call(a.constructor.prototype, "isPrototypeOf")) return !1;
            } catch (c) {
                return !1;
            }
            var d;
            for (d in a) ;
            return d === b || n.call(a, d);
        },
        isEmptyObject: function(a) {
            var b;
            for (b in a) return !1;
            return !0;
        },
        error: function(a) {
            throw new Error(a);
        },
        parseHTML: function(a, b, c) {
            var d;
            return !a || typeof a != "string" ? null : (typeof b == "boolean" && (c = b, b = 0), b = b || e, (d = v.exec(a)) ? [ b.createElement(d[1]) ] : (d = p.buildFragment([ a ], b, c ? null : []), p.merge([], (d.cacheable ? p.clone(d.fragment) : d.fragment).childNodes)));
        },
        parseJSON: function(b) {
            if (!b || typeof b != "string") return null;
            b = p.trim(b);
            if (a.JSON && a.JSON.parse) return a.JSON.parse(b);
            if (w.test(b.replace(y, "@").replace(z, "]").replace(x, ""))) return (new Function("return " + b))();
            p.error("Invalid JSON: " + b);
        },
        parseXML: function(c) {
            var d, e;
            if (!c || typeof c != "string") return null;
            try {
                a.DOMParser ? (e = new DOMParser, d = e.parseFromString(c, "text/xml")) : (d = new ActiveXObject("Microsoft.XMLDOM"), d.async = "false", d.loadXML(c));
            } catch (f) {
                d = b;
            }
            return (!d || !d.documentElement || d.getElementsByTagName("parsererror").length) && p.error("Invalid XML: " + c), d;
        },
        noop: function() {},
        globalEval: function(b) {
            b && r.test(b) && (a.execScript || function(b) {
                a.eval.call(a, b);
            })(b);
        },
        camelCase: function(a) {
            return a.replace(A, "ms-").replace(B, C);
        },
        nodeName: function(a, b) {
            return a.nodeName && a.nodeName.toLowerCase() === b.toLowerCase();
        },
        each: function(a, c, d) {
            var e, f = 0, g = a.length, h = g === b || p.isFunction(a);
            if (d) {
                if (h) {
                    for (e in a) if (c.apply(a[e], d) === !1) break;
                } else for (; f < g; ) if (c.apply(a[f++], d) === !1) break;
            } else if (h) {
                for (e in a) if (c.call(a[e], e, a[e]) === !1) break;
            } else for (; f < g; ) if (c.call(a[f], f, a[f++]) === !1) break;
            return a;
        },
        trim: o && !o.call("﻿ ") ? function(a) {
            return a == null ? "" : o.call(a);
        } : function(a) {
            return a == null ? "" : (a + "").replace(t, "");
        },
        makeArray: function(a, b) {
            var c, d = b || [];
            return a != null && (c = p.type(a), a.length == null || c === "string" || c === "function" || c === "regexp" || p.isWindow(a) ? j.call(d, a) : p.merge(d, a)), d;
        },
        inArray: function(a, b, c) {
            var d;
            if (b) {
                if (l) return l.call(b, a, c);
                d = b.length, c = c ? c < 0 ? Math.max(0, d + c) : c : 0;
                for (; c < d; c++) if (c in b && b[c] === a) return c;
            }
            return -1;
        },
        merge: function(a, c) {
            var d = c.length, e = a.length, f = 0;
            if (typeof d == "number") for (; f < d; f++) a[e++] = c[f]; else while (c[f] !== b) a[e++] = c[f++];
            return a.length = e, a;
        },
        grep: function(a, b, c) {
            var d, e = [], f = 0, g = a.length;
            c = !!c;
            for (; f < g; f++) d = !!b(a[f], f), c !== d && e.push(a[f]);
            return e;
        },
        map: function(a, c, d) {
            var e, f, g = [], h = 0, i = a.length, j = a instanceof p || i !== b && typeof i == "number" && (i > 0 && a[0] && a[i - 1] || i === 0 || p.isArray(a));
            if (j) for (; h < i; h++) e = c(a[h], h, d), e != null && (g[g.length] = e); else for (f in a) e = c(a[f], f, d), e != null && (g[g.length] = e);
            return g.concat.apply([], g);
        },
        guid: 1,
        proxy: function(a, c) {
            var d, e, f;
            return typeof c == "string" && (d = a[c], c = a, a = d), p.isFunction(a) ? (e = k.call(arguments, 2), f = function() {
                return a.apply(c, e.concat(k.call(arguments)));
            }, f.guid = a.guid = a.guid || p.guid++, f) : b;
        },
        access: function(a, c, d, e, f, g, h) {
            var i, j = d == null, k = 0, l = a.length;
            if (d && typeof d == "object") {
                for (k in d) p.access(a, c, k, d[k], 1, g, e);
                f = 1;
            } else if (e !== b) {
                i = h === b && p.isFunction(e), j && (i ? (i = c, c = function(a, b, c) {
                    return i.call(p(a), c);
                }) : (c.call(a, e), c = null));
                if (c) for (; k < l; k++) c(a[k], d, i ? e.call(a[k], k, c(a[k], d)) : e, h);
                f = 1;
            }
            return f ? a : j ? c.call(a) : l ? c(a[0], d) : g;
        },
        now: function() {
            return (new Date).getTime();
        }
    }), p.ready.promise = function(b) {
        if (!d) {
            d = p.Deferred();
            if (e.readyState === "complete") setTimeout(p.ready, 1); else if (e.addEventListener) e.addEventListener("DOMContentLoaded", D, !1), a.addEventListener("load", p.ready, !1); else {
                e.attachEvent("onreadystatechange", D), a.attachEvent("onload", p.ready);
                var c = !1;
                try {
                    c = a.frameElement == null && e.documentElement;
                } catch (f) {}
                c && c.doScroll && function g() {
                    if (!p.isReady) {
                        try {
                            c.doScroll("left");
                        } catch (a) {
                            return setTimeout(g, 50);
                        }
                        p.ready();
                    }
                }();
            }
        }
        return d.promise(b);
    }, p.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(a, b) {
        E["[object " + b + "]"] = b.toLowerCase();
    }), c = p(e);
    var F = {};
    p.Callbacks = function(a) {
        a = typeof a == "string" ? F[a] || G(a) : p.extend({}, a);
        var c, d, e, f, g, h, i = [], j = !a.once && [], k = function(b) {
            c = a.memory && b, d = !0, h = f || 0, f = 0, g = i.length, e = !0;
            for (; i && h < g; h++) if (i[h].apply(b[0], b[1]) === !1 && a.stopOnFalse) {
                c = !1;
                break;
            }
            e = !1, i && (j ? j.length && k(j.shift()) : c ? i = [] : l.disable());
        }, l = {
            add: function() {
                if (i) {
                    var b = i.length;
                    (function d(b) {
                        p.each(b, function(b, c) {
                            var e = p.type(c);
                            e === "function" && (!a.unique || !l.has(c)) ? i.push(c) : c && c.length && e !== "string" && d(c);
                        });
                    })(arguments), e ? g = i.length : c && (f = b, k(c));
                }
                return this;
            },
            remove: function() {
                return i && p.each(arguments, function(a, b) {
                    var c;
                    while ((c = p.inArray(b, i, c)) > -1) i.splice(c, 1), e && (c <= g && g--, c <= h && h--);
                }), this;
            },
            has: function(a) {
                return p.inArray(a, i) > -1;
            },
            empty: function() {
                return i = [], this;
            },
            disable: function() {
                return i = j = c = b, this;
            },
            disabled: function() {
                return !i;
            },
            lock: function() {
                return j = b, c || l.disable(), this;
            },
            locked: function() {
                return !j;
            },
            fireWith: function(a, b) {
                return b = b || [], b = [ a, b.slice ? b.slice() : b ], i && (!d || j) && (e ? j.push(b) : k(b)), this;
            },
            fire: function() {
                return l.fireWith(this, arguments), this;
            },
            fired: function() {
                return !!d;
            }
        };
        return l;
    }, p.extend({
        Deferred: function(a) {
            var b = [ [ "resolve", "done", p.Callbacks("once memory"), "resolved" ], [ "reject", "fail", p.Callbacks("once memory"), "rejected" ], [ "notify", "progress", p.Callbacks("memory") ] ], c = "pending", d = {
                state: function() {
                    return c;
                },
                always: function() {
                    return e.done(arguments).fail(arguments), this;
                },
                then: function() {
                    var a = arguments;
                    return p.Deferred(function(c) {
                        p.each(b, function(b, d) {
                            var f = d[0], g = a[b];
                            e[d[1]](p.isFunction(g) ? function() {
                                var a = g.apply(this, arguments);
                                a && p.isFunction(a.promise) ? a.promise().done(c.resolve).fail(c.reject).progress(c.notify) : c[f + "With"](this === e ? c : this, [ a ]);
                            } : c[f]);
                        }), a = null;
                    }).promise();
                },
                promise: function(a) {
                    return a != null ? p.extend(a, d) : d;
                }
            }, e = {};
            return d.pipe = d.then, p.each(b, function(a, f) {
                var g = f[2], h = f[3];
                d[f[1]] = g.add, h && g.add(function() {
                    c = h;
                }, b[a ^ 1][2].disable, b[2][2].lock), e[f[0]] = g.fire, e[f[0] + "With"] = g.fireWith;
            }), d.promise(e), a && a.call(e, e), e;
        },
        when: function(a) {
            var b = 0, c = k.call(arguments), d = c.length, e = d !== 1 || a && p.isFunction(a.promise) ? d : 0, f = e === 1 ? a : p.Deferred(), g = function(a, b, c) {
                return function(d) {
                    b[a] = this, c[a] = arguments.length > 1 ? k.call(arguments) : d, c === h ? f.notifyWith(b, c) : --e || f.resolveWith(b, c);
                };
            }, h, i, j;
            if (d > 1) {
                h = new Array(d), i = new Array(d), j = new Array(d);
                for (; b < d; b++) c[b] && p.isFunction(c[b].promise) ? c[b].promise().done(g(b, j, c)).fail(f.reject).progress(g(b, i, h)) : --e;
            }
            return e || f.resolveWith(j, c), f.promise();
        }
    }), p.support = function() {
        var b, c, d, f, g, h, i, j, k, l, m, n = e.createElement("div");
        n.setAttribute("className", "t"), n.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", c = n.getElementsByTagName("*"), d = n.getElementsByTagName("a")[0], d.style.cssText = "top:1px;float:left;opacity:.5";
        if (!c || !c.length) return {};
        f = e.createElement("select"), g = f.appendChild(e.createElement("option")), h = n.getElementsByTagName("input")[0], b = {
            leadingWhitespace: n.firstChild.nodeType === 3,
            tbody: !n.getElementsByTagName("tbody").length,
            htmlSerialize: !!n.getElementsByTagName("link").length,
            style: /top/.test(d.getAttribute("style")),
            hrefNormalized: d.getAttribute("href") === "/a",
            opacity: /^0.5/.test(d.style.opacity),
            cssFloat: !!d.style.cssFloat,
            checkOn: h.value === "on",
            optSelected: g.selected,
            getSetAttribute: n.className !== "t",
            enctype: !!e.createElement("form").enctype,
            html5Clone: e.createElement("nav").cloneNode(!0).outerHTML !== "<:nav></:nav>",
            boxModel: e.compatMode === "CSS1Compat",
            submitBubbles: !0,
            changeBubbles: !0,
            focusinBubbles: !1,
            deleteExpando: !0,
            noCloneEvent: !0,
            inlineBlockNeedsLayout: !1,
            shrinkWrapBlocks: !1,
            reliableMarginRight: !0,
            boxSizingReliable: !0,
            pixelPosition: !1
        }, h.checked = !0, b.noCloneChecked = h.cloneNode(!0).checked, f.disabled = !0, b.optDisabled = !g.disabled;
        try {
            delete n.test;
        } catch (o) {
            b.deleteExpando = !1;
        }
        !n.addEventListener && n.attachEvent && n.fireEvent && (n.attachEvent("onclick", m = function() {
            b.noCloneEvent = !1;
        }), n.cloneNode(!0).fireEvent("onclick"), n.detachEvent("onclick", m)), h = e.createElement("input"), h.value = "t", h.setAttribute("type", "radio"), b.radioValue = h.value === "t", h.setAttribute("checked", "checked"), h.setAttribute("name", "t"), n.appendChild(h), i = e.createDocumentFragment(), i.appendChild(n.lastChild), b.checkClone = i.cloneNode(!0).cloneNode(!0).lastChild.checked, b.appendChecked = h.checked, i.removeChild(h), i.appendChild(n);
        if (n.attachEvent) for (k in {
            submit: !0,
            change: !0,
            focusin: !0
        }) j = "on" + k, l = j in n, l || (n.setAttribute(j, "return;"), l = typeof n[j] == "function"), b[k + "Bubbles"] = l;
        return p(function() {
            var c, d, f, g, h = "padding:0;margin:0;border:0;display:block;overflow:hidden;", i = e.getElementsByTagName("body")[0];
            if (!i) return;
            c = e.createElement("div"), c.style.cssText = "visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px", i.insertBefore(c, i.firstChild), d = e.createElement("div"), c.appendChild(d), d.innerHTML = "<table><tr><td></td><td>t</td></tr></table>", f = d.getElementsByTagName("td"), f[0].style.cssText = "padding:0;margin:0;border:0;display:none", l = f[0].offsetHeight === 0, f[0].style.display = "", f[1].style.display = "none", b.reliableHiddenOffsets = l && f[0].offsetHeight === 0, d.innerHTML = "", d.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;", b.boxSizing = d.offsetWidth === 4, b.doesNotIncludeMarginInBodyOffset = i.offsetTop !== 1, a.getComputedStyle && (b.pixelPosition = (a.getComputedStyle(d, null) || {}).top !== "1%", b.boxSizingReliable = (a.getComputedStyle(d, null) || {
                width: "4px"
            }).width === "4px", g = e.createElement("div"), g.style.cssText = d.style.cssText = h, g.style.marginRight = g.style.width = "0", d.style.width = "1px", d.appendChild(g), b.reliableMarginRight = !parseFloat((a.getComputedStyle(g, null) || {}).marginRight)), typeof d.style.zoom != "undefined" && (d.innerHTML = "", d.style.cssText = h + "width:1px;padding:1px;display:inline;zoom:1", b.inlineBlockNeedsLayout = d.offsetWidth === 3, d.style.display = "block", d.style.overflow = "visible", d.innerHTML = "<div></div>", d.firstChild.style.width = "5px", b.shrinkWrapBlocks = d.offsetWidth !== 3, c.style.zoom = 1), i.removeChild(c), c = d = f = g = null;
        }), i.removeChild(n), c = d = f = g = h = i = n = null, b;
    }();
    var H = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/, I = /([A-Z])/g;
    p.extend({
        cache: {},
        deletedIds: [],
        uuid: 0,
        expando: "jQuery" + (p.fn.jquery + Math.random()).replace(/\D/g, ""),
        noData: {
            embed: !0,
            object: "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
            applet: !0
        },
        hasData: function(a) {
            return a = a.nodeType ? p.cache[a[p.expando]] : a[p.expando], !!a && !K(a);
        },
        data: function(a, c, d, e) {
            if (!p.acceptData(a)) return;
            var f, g, h = p.expando, i = typeof c == "string", j = a.nodeType, k = j ? p.cache : a, l = j ? a[h] : a[h] && h;
            if ((!l || !k[l] || !e && !k[l].data) && i && d === b) return;
            l || (j ? a[h] = l = p.deletedIds.pop() || p.guid++ : l = h), k[l] || (k[l] = {}, j || (k[l].toJSON = p.noop));
            if (typeof c == "object" || typeof c == "function") e ? k[l] = p.extend(k[l], c) : k[l].data = p.extend(k[l].data, c);
            return f = k[l], e || (f.data || (f.data = {}), f = f.data), d !== b && (f[p.camelCase(c)] = d), i ? (g = f[c], g == null && (g = f[p.camelCase(c)])) : g = f, g;
        },
        removeData: function(a, b, c) {
            if (!p.acceptData(a)) return;
            var d, e, f, g = a.nodeType, h = g ? p.cache : a, i = g ? a[p.expando] : p.expando;
            if (!h[i]) return;
            if (b) {
                d = c ? h[i] : h[i].data;
                if (d) {
                    p.isArray(b) || (b in d ? b = [ b ] : (b = p.camelCase(b), b in d ? b = [ b ] : b = b.split(" ")));
                    for (e = 0, f = b.length; e < f; e++) delete d[b[e]];
                    if (!(c ? K : p.isEmptyObject)(d)) return;
                }
            }
            if (!c) {
                delete h[i].data;
                if (!K(h[i])) return;
            }
            g ? p.cleanData([ a ], !0) : p.support.deleteExpando || h != h.window ? delete h[i] : h[i] = null;
        },
        _data: function(a, b, c) {
            return p.data(a, b, c, !0);
        },
        acceptData: function(a) {
            var b = a.nodeName && p.noData[a.nodeName.toLowerCase()];
            return !b || b !== !0 && a.getAttribute("classid") === b;
        }
    }), p.fn.extend({
        data: function(a, c) {
            var d, e, f, g, h, i = this[0], j = 0, k = null;
            if (a === b) {
                if (this.length) {
                    k = p.data(i);
                    if (i.nodeType === 1 && !p._data(i, "parsedAttrs")) {
                        f = i.attributes;
                        for (h = f.length; j < h; j++) g = f[j].name, g.indexOf("data-") || (g = p.camelCase(g.substring(5)), J(i, g, k[g]));
                        p._data(i, "parsedAttrs", !0);
                    }
                }
                return k;
            }
            return typeof a == "object" ? this.each(function() {
                p.data(this, a);
            }) : (d = a.split(".", 2), d[1] = d[1] ? "." + d[1] : "", e = d[1] + "!", p.access(this, function(c) {
                if (c === b) return k = this.triggerHandler("getData" + e, [ d[0] ]), k === b && i && (k = p.data(i, a), k = J(i, a, k)), k === b && d[1] ? this.data(d[0]) : k;
                d[1] = c, this.each(function() {
                    var b = p(this);
                    b.triggerHandler("setData" + e, d), p.data(this, a, c), b.triggerHandler("changeData" + e, d);
                });
            }, null, c, arguments.length > 1, null, !1));
        },
        removeData: function(a) {
            return this.each(function() {
                p.removeData(this, a);
            });
        }
    }), p.extend({
        queue: function(a, b, c) {
            var d;
            if (a) return b = (b || "fx") + "queue", d = p._data(a, b), c && (!d || p.isArray(c) ? d = p._data(a, b, p.makeArray(c)) : d.push(c)), d || [];
        },
        dequeue: function(a, b) {
            b = b || "fx";
            var c = p.queue(a, b), d = c.length, e = c.shift(), f = p._queueHooks(a, b), g = function() {
                p.dequeue(a, b);
            };
            e === "inprogress" && (e = c.shift(), d--), e && (b === "fx" && c.unshift("inprogress"), delete f.stop, e.call(a, g, f)), !d && f && f.empty.fire();
        },
        _queueHooks: function(a, b) {
            var c = b + "queueHooks";
            return p._data(a, c) || p._data(a, c, {
                empty: p.Callbacks("once memory").add(function() {
                    p.removeData(a, b + "queue", !0), p.removeData(a, c, !0);
                })
            });
        }
    }), p.fn.extend({
        queue: function(a, c) {
            var d = 2;
            return typeof a != "string" && (c = a, a = "fx", d--), arguments.length < d ? p.queue(this[0], a) : c === b ? this : this.each(function() {
                var b = p.queue(this, a, c);
                p._queueHooks(this, a), a === "fx" && b[0] !== "inprogress" && p.dequeue(this, a);
            });
        },
        dequeue: function(a) {
            return this.each(function() {
                p.dequeue(this, a);
            });
        },
        delay: function(a, b) {
            return a = p.fx ? p.fx.speeds[a] || a : a, b = b || "fx", this.queue(b, function(b, c) {
                var d = setTimeout(b, a);
                c.stop = function() {
                    clearTimeout(d);
                };
            });
        },
        clearQueue: function(a) {
            return this.queue(a || "fx", []);
        },
        promise: function(a, c) {
            var d, e = 1, f = p.Deferred(), g = this, h = this.length, i = function() {
                --e || f.resolveWith(g, [ g ]);
            };
            typeof a != "string" && (c = a, a = b), a = a || "fx";
            while (h--) d = p._data(g[h], a + "queueHooks"), d && d.empty && (e++, d.empty.add(i));
            return i(), f.promise(c);
        }
    });
    var L, M, N, O = /[\t\r\n]/g, P = /\r/g, Q = /^(?:button|input)$/i, R = /^(?:button|input|object|select|textarea)$/i, S = /^a(?:rea|)$/i, T = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i, U = p.support.getSetAttribute;
    p.fn.extend({
        attr: function(a, b) {
            return p.access(this, p.attr, a, b, arguments.length > 1);
        },
        removeAttr: function(a) {
            return this.each(function() {
                p.removeAttr(this, a);
            });
        },
        prop: function(a, b) {
            return p.access(this, p.prop, a, b, arguments.length > 1);
        },
        removeProp: function(a) {
            return a = p.propFix[a] || a, this.each(function() {
                try {
                    this[a] = b, delete this[a];
                } catch (c) {}
            });
        },
        addClass: function(a) {
            var b, c, d, e, f, g, h;
            if (p.isFunction(a)) return this.each(function(b) {
                p(this).addClass(a.call(this, b, this.className));
            });
            if (a && typeof a == "string") {
                b = a.split(s);
                for (c = 0, d = this.length; c < d; c++) {
                    e = this[c];
                    if (e.nodeType === 1) if (!e.className && b.length === 1) e.className = a; else {
                        f = " " + e.className + " ";
                        for (g = 0, h = b.length; g < h; g++) f.indexOf(" " + b[g] + " ") < 0 && (f += b[g] + " ");
                        e.className = p.trim(f);
                    }
                }
            }
            return this;
        },
        removeClass: function(a) {
            var c, d, e, f, g, h, i;
            if (p.isFunction(a)) return this.each(function(b) {
                p(this).removeClass(a.call(this, b, this.className));
            });
            if (a && typeof a == "string" || a === b) {
                c = (a || "").split(s);
                for (h = 0, i = this.length; h < i; h++) {
                    e = this[h];
                    if (e.nodeType === 1 && e.className) {
                        d = (" " + e.className + " ").replace(O, " ");
                        for (f = 0, g = c.length; f < g; f++) while (d.indexOf(" " + c[f] + " ") >= 0) d = d.replace(" " + c[f] + " ", " ");
                        e.className = a ? p.trim(d) : "";
                    }
                }
            }
            return this;
        },
        toggleClass: function(a, b) {
            var c = typeof a, d = typeof b == "boolean";
            return p.isFunction(a) ? this.each(function(c) {
                p(this).toggleClass(a.call(this, c, this.className, b), b);
            }) : this.each(function() {
                if (c === "string") {
                    var e, f = 0, g = p(this), h = b, i = a.split(s);
                    while (e = i[f++]) h = d ? h : !g.hasClass(e), g[h ? "addClass" : "removeClass"](e);
                } else if (c === "undefined" || c === "boolean") this.className && p._data(this, "__className__", this.className), this.className = this.className || a === !1 ? "" : p._data(this, "__className__") || "";
            });
        },
        hasClass: function(a) {
            var b = " " + a + " ", c = 0, d = this.length;
            for (; c < d; c++) if (this[c].nodeType === 1 && (" " + this[c].className + " ").replace(O, " ").indexOf(b) >= 0) return !0;
            return !1;
        },
        val: function(a) {
            var c, d, e, f = this[0];
            if (!arguments.length) {
                if (f) return c = p.valHooks[f.type] || p.valHooks[f.nodeName.toLowerCase()], c && "get" in c && (d = c.get(f, "value")) !== b ? d : (d = f.value, typeof d == "string" ? d.replace(P, "") : d == null ? "" : d);
                return;
            }
            return e = p.isFunction(a), this.each(function(d) {
                var f, g = p(this);
                if (this.nodeType !== 1) return;
                e ? f = a.call(this, d, g.val()) : f = a, f == null ? f = "" : typeof f == "number" ? f += "" : p.isArray(f) && (f = p.map(f, function(a) {
                    return a == null ? "" : a + "";
                })), c = p.valHooks[this.type] || p.valHooks[this.nodeName.toLowerCase()];
                if (!c || !("set" in c) || c.set(this, f, "value") === b) this.value = f;
            });
        }
    }), p.extend({
        valHooks: {
            option: {
                get: function(a) {
                    var b = a.attributes.value;
                    return !b || b.specified ? a.value : a.text;
                }
            },
            select: {
                get: function(a) {
                    var b, c, d, e, f = a.selectedIndex, g = [], h = a.options, i = a.type === "select-one";
                    if (f < 0) return null;
                    c = i ? f : 0, d = i ? f + 1 : h.length;
                    for (; c < d; c++) {
                        e = h[c];
                        if (e.selected && (p.support.optDisabled ? !e.disabled : e.getAttribute("disabled") === null) && (!e.parentNode.disabled || !p.nodeName(e.parentNode, "optgroup"))) {
                            b = p(e).val();
                            if (i) return b;
                            g.push(b);
                        }
                    }
                    return i && !g.length && h.length ? p(h[f]).val() : g;
                },
                set: function(a, b) {
                    var c = p.makeArray(b);
                    return p(a).find("option").each(function() {
                        this.selected = p.inArray(p(this).val(), c) >= 0;
                    }), c.length || (a.selectedIndex = -1), c;
                }
            }
        },
        attrFn: {},
        attr: function(a, c, d, e) {
            var f, g, h, i = a.nodeType;
            if (!a || i === 3 || i === 8 || i === 2) return;
            if (e && p.isFunction(p.fn[c])) return p(a)[c](d);
            if (typeof a.getAttribute == "undefined") return p.prop(a, c, d);
            h = i !== 1 || !p.isXMLDoc(a), h && (c = c.toLowerCase(), g = p.attrHooks[c] || (T.test(c) ? M : L));
            if (d !== b) {
                if (d === null) {
                    p.removeAttr(a, c);
                    return;
                }
                return g && "set" in g && h && (f = g.set(a, d, c)) !== b ? f : (a.setAttribute(c, d + ""), d);
            }
            return g && "get" in g && h && (f = g.get(a, c)) !== null ? f : (f = a.getAttribute(c), f === null ? b : f);
        },
        removeAttr: function(a, b) {
            var c, d, e, f, g = 0;
            if (b && a.nodeType === 1) {
                d = b.split(s);
                for (; g < d.length; g++) e = d[g], e && (c = p.propFix[e] || e, f = T.test(e), f || p.attr(a, e, ""), a.removeAttribute(U ? e : c), f && c in a && (a[c] = !1));
            }
        },
        attrHooks: {
            type: {
                set: function(a, b) {
                    if (Q.test(a.nodeName) && a.parentNode) p.error("type property can't be changed"); else if (!p.support.radioValue && b === "radio" && p.nodeName(a, "input")) {
                        var c = a.value;
                        return a.setAttribute("type", b), c && (a.value = c), b;
                    }
                }
            },
            value: {
                get: function(a, b) {
                    return L && p.nodeName(a, "button") ? L.get(a, b) : b in a ? a.value : null;
                },
                set: function(a, b, c) {
                    if (L && p.nodeName(a, "button")) return L.set(a, b, c);
                    a.value = b;
                }
            }
        },
        propFix: {
            tabindex: "tabIndex",
            readonly: "readOnly",
            "for": "htmlFor",
            "class": "className",
            maxlength: "maxLength",
            cellspacing: "cellSpacing",
            cellpadding: "cellPadding",
            rowspan: "rowSpan",
            colspan: "colSpan",
            usemap: "useMap",
            frameborder: "frameBorder",
            contenteditable: "contentEditable"
        },
        prop: function(a, c, d) {
            var e, f, g, h = a.nodeType;
            if (!a || h === 3 || h === 8 || h === 2) return;
            return g = h !== 1 || !p.isXMLDoc(a), g && (c = p.propFix[c] || c, f = p.propHooks[c]), d !== b ? f && "set" in f && (e = f.set(a, d, c)) !== b ? e : a[c] = d : f && "get" in f && (e = f.get(a, c)) !== null ? e : a[c];
        },
        propHooks: {
            tabIndex: {
                get: function(a) {
                    var c = a.getAttributeNode("tabindex");
                    return c && c.specified ? parseInt(c.value, 10) : R.test(a.nodeName) || S.test(a.nodeName) && a.href ? 0 : b;
                }
            }
        }
    }), M = {
        get: function(a, c) {
            var d, e = p.prop(a, c);
            return e === !0 || typeof e != "boolean" && (d = a.getAttributeNode(c)) && d.nodeValue !== !1 ? c.toLowerCase() : b;
        },
        set: function(a, b, c) {
            var d;
            return b === !1 ? p.removeAttr(a, c) : (d = p.propFix[c] || c, d in a && (a[d] = !0), a.setAttribute(c, c.toLowerCase())), c;
        }
    }, U || (N = {
        name: !0,
        id: !0,
        coords: !0
    }, L = p.valHooks.button = {
        get: function(a, c) {
            var d;
            return d = a.getAttributeNode(c), d && (N[c] ? d.value !== "" : d.specified) ? d.value : b;
        },
        set: function(a, b, c) {
            var d = a.getAttributeNode(c);
            return d || (d = e.createAttribute(c), a.setAttributeNode(d)), d.value = b + "";
        }
    }, p.each([ "width", "height" ], function(a, b) {
        p.attrHooks[b] = p.extend(p.attrHooks[b], {
            set: function(a, c) {
                if (c === "") return a.setAttribute(b, "auto"), c;
            }
        });
    }), p.attrHooks.contenteditable = {
        get: L.get,
        set: function(a, b, c) {
            b === "" && (b = "false"), L.set(a, b, c);
        }
    }), p.support.hrefNormalized || p.each([ "href", "src", "width", "height" ], function(a, c) {
        p.attrHooks[c] = p.extend(p.attrHooks[c], {
            get: function(a) {
                var d = a.getAttribute(c, 2);
                return d === null ? b : d;
            }
        });
    }), p.support.style || (p.attrHooks.style = {
        get: function(a) {
            return a.style.cssText.toLowerCase() || b;
        },
        set: function(a, b) {
            return a.style.cssText = b + "";
        }
    }), p.support.optSelected || (p.propHooks.selected = p.extend(p.propHooks.selected, {
        get: function(a) {
            var b = a.parentNode;
            return b && (b.selectedIndex, b.parentNode && b.parentNode.selectedIndex), null;
        }
    })), p.support.enctype || (p.propFix.enctype = "encoding"), p.support.checkOn || p.each([ "radio", "checkbox" ], function() {
        p.valHooks[this] = {
            get: function(a) {
                return a.getAttribute("value") === null ? "on" : a.value;
            }
        };
    }), p.each([ "radio", "checkbox" ], function() {
        p.valHooks[this] = p.extend(p.valHooks[this], {
            set: function(a, b) {
                if (p.isArray(b)) return a.checked = p.inArray(p(a).val(), b) >= 0;
            }
        });
    });
    var V = /^(?:textarea|input|select)$/i, W = /^([^\.]*|)(?:\.(.+)|)$/, X = /(?:^|\s)hover(\.\S+|)\b/, Y = /^key/, Z = /^(?:mouse|contextmenu)|click/, $ = /^(?:focusinfocus|focusoutblur)$/, _ = function(a) {
        return p.event.special.hover ? a : a.replace(X, "mouseenter$1 mouseleave$1");
    };
    p.event = {
        add: function(a, c, d, e, f) {
            var g, h, i, j, k, l, m, n, o, q, r;
            if (a.nodeType === 3 || a.nodeType === 8 || !c || !d || !(g = p._data(a))) return;
            d.handler && (o = d, d = o.handler, f = o.selector), d.guid || (d.guid = p.guid++), i = g.events, i || (g.events = i = {}), h = g.handle, h || (g.handle = h = function(a) {
                return typeof p != "undefined" && (!a || p.event.triggered !== a.type) ? p.event.dispatch.apply(h.elem, arguments) : b;
            }, h.elem = a), c = p.trim(_(c)).split(" ");
            for (j = 0; j < c.length; j++) {
                k = W.exec(c[j]) || [], l = k[1], m = (k[2] || "").split(".").sort(), r = p.event.special[l] || {}, l = (f ? r.delegateType : r.bindType) || l, r = p.event.special[l] || {}, n = p.extend({
                    type: l,
                    origType: k[1],
                    data: e,
                    handler: d,
                    guid: d.guid,
                    selector: f,
                    needsContext: f && p.expr.match.needsContext.test(f),
                    namespace: m.join(".")
                }, o), q = i[l];
                if (!q) {
                    q = i[l] = [], q.delegateCount = 0;
                    if (!r.setup || r.setup.call(a, e, m, h) === !1) a.addEventListener ? a.addEventListener(l, h, !1) : a.attachEvent && a.attachEvent("on" + l, h);
                }
                r.add && (r.add.call(a, n), n.handler.guid || (n.handler.guid = d.guid)), f ? q.splice(q.delegateCount++, 0, n) : q.push(n), p.event.global[l] = !0;
            }
            a = null;
        },
        global: {},
        remove: function(a, b, c, d, e) {
            var f, g, h, i, j, k, l, m, n, o, q, r = p.hasData(a) && p._data(a);
            if (!r || !(m = r.events)) return;
            b = p.trim(_(b || "")).split(" ");
            for (f = 0; f < b.length; f++) {
                g = W.exec(b[f]) || [], h = i = g[1], j = g[2];
                if (!h) {
                    for (h in m) p.event.remove(a, h + b[f], c, d, !0);
                    continue;
                }
                n = p.event.special[h] || {}, h = (d ? n.delegateType : n.bindType) || h, o = m[h] || [], k = o.length, j = j ? new RegExp("(^|\\.)" + j.split(".").sort().join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
                for (l = 0; l < o.length; l++) q = o[l], (e || i === q.origType) && (!c || c.guid === q.guid) && (!j || j.test(q.namespace)) && (!d || d === q.selector || d === "**" && q.selector) && (o.splice(l--, 1), q.selector && o.delegateCount--, n.remove && n.remove.call(a, q));
                o.length === 0 && k !== o.length && ((!n.teardown || n.teardown.call(a, j, r.handle) === !1) && p.removeEvent(a, h, r.handle), delete m[h]);
            }
            p.isEmptyObject(m) && (delete r.handle, p.removeData(a, "events", !0));
        },
        customEvent: {
            getData: !0,
            setData: !0,
            changeData: !0
        },
        trigger: function(c, d, f, g) {
            if (!f || f.nodeType !== 3 && f.nodeType !== 8) {
                var h, i, j, k, l, m, n, o, q, r, s = c.type || c, t = [];
                if ($.test(s + p.event.triggered)) return;
                s.indexOf("!") >= 0 && (s = s.slice(0, -1), i = !0), s.indexOf(".") >= 0 && (t = s.split("."), s = t.shift(), t.sort());
                if ((!f || p.event.customEvent[s]) && !p.event.global[s]) return;
                c = typeof c == "object" ? c[p.expando] ? c : new p.Event(s, c) : new p.Event(s), c.type = s, c.isTrigger = !0, c.exclusive = i, c.namespace = t.join("."), c.namespace_re = c.namespace ? new RegExp("(^|\\.)" + t.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, m = s.indexOf(":") < 0 ? "on" + s : "";
                if (!f) {
                    h = p.cache;
                    for (j in h) h[j].events && h[j].events[s] && p.event.trigger(c, d, h[j].handle.elem, !0);
                    return;
                }
                c.result = b, c.target || (c.target = f), d = d != null ? p.makeArray(d) : [], d.unshift(c), n = p.event.special[s] || {};
                if (n.trigger && n.trigger.apply(f, d) === !1) return;
                q = [ [ f, n.bindType || s ] ];
                if (!g && !n.noBubble && !p.isWindow(f)) {
                    r = n.delegateType || s, k = $.test(r + s) ? f : f.parentNode;
                    for (l = f; k; k = k.parentNode) q.push([ k, r ]), l = k;
                    l === (f.ownerDocument || e) && q.push([ l.defaultView || l.parentWindow || a, r ]);
                }
                for (j = 0; j < q.length && !c.isPropagationStopped(); j++) k = q[j][0], c.type = q[j][1], o = (p._data(k, "events") || {})[c.type] && p._data(k, "handle"), o && o.apply(k, d), o = m && k[m], o && p.acceptData(k) && o.apply && o.apply(k, d) === !1 && c.preventDefault();
                return c.type = s, !g && !c.isDefaultPrevented() && (!n._default || n._default.apply(f.ownerDocument, d) === !1) && (s !== "click" || !p.nodeName(f, "a")) && p.acceptData(f) && m && f[s] && (s !== "focus" && s !== "blur" || c.target.offsetWidth !== 0) && !p.isWindow(f) && (l = f[m], l && (f[m] = null), p.event.triggered = s, f[s](), p.event.triggered = b, l && (f[m] = l)), c.result;
            }
            return;
        },
        dispatch: function(c) {
            c = p.event.fix(c || a.event);
            var d, e, f, g, h, i, j, l, m, n, o = (p._data(this, "events") || {})[c.type] || [], q = o.delegateCount, r = k.call(arguments), s = !c.exclusive && !c.namespace, t = p.event.special[c.type] || {}, u = [];
            r[0] = c, c.delegateTarget = this;
            if (t.preDispatch && t.preDispatch.call(this, c) === !1) return;
            if (q && (!c.button || c.type !== "click")) for (f = c.target; f != this; f = f.parentNode || this) if (f.disabled !== !0 || c.type !== "click") {
                h = {}, j = [];
                for (d = 0; d < q; d++) l = o[d], m = l.selector, h[m] === b && (h[m] = l.needsContext ? p(m, this).index(f) >= 0 : p.find(m, this, null, [ f ]).length), h[m] && j.push(l);
                j.length && u.push({
                    elem: f,
                    matches: j
                });
            }
            o.length > q && u.push({
                elem: this,
                matches: o.slice(q)
            });
            for (d = 0; d < u.length && !c.isPropagationStopped(); d++) {
                i = u[d], c.currentTarget = i.elem;
                for (e = 0; e < i.matches.length && !c.isImmediatePropagationStopped(); e++) {
                    l = i.matches[e];
                    if (s || !c.namespace && !l.namespace || c.namespace_re && c.namespace_re.test(l.namespace)) c.data = l.data, c.handleObj = l, g = ((p.event.special[l.origType] || {}).handle || l.handler).apply(i.elem, r), g !== b && (c.result = g, g === !1 && (c.preventDefault(), c.stopPropagation()));
                }
            }
            return t.postDispatch && t.postDispatch.call(this, c), c.result;
        },
        props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
        fixHooks: {},
        keyHooks: {
            props: "char charCode key keyCode".split(" "),
            filter: function(a, b) {
                return a.which == null && (a.which = b.charCode != null ? b.charCode : b.keyCode), a;
            }
        },
        mouseHooks: {
            props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function(a, c) {
                var d, f, g, h = c.button, i = c.fromElement;
                return a.pageX == null && c.clientX != null && (d = a.target.ownerDocument || e, f = d.documentElement, g = d.body, a.pageX = c.clientX + (f && f.scrollLeft || g && g.scrollLeft || 0) - (f && f.clientLeft || g && g.clientLeft || 0), a.pageY = c.clientY + (f && f.scrollTop || g && g.scrollTop || 0) - (f && f.clientTop || g && g.clientTop || 0)), !a.relatedTarget && i && (a.relatedTarget = i === a.target ? c.toElement : i), !a.which && h !== b && (a.which = h & 1 ? 1 : h & 2 ? 3 : h & 4 ? 2 : 0), a;
            }
        },
        fix: function(a) {
            if (a[p.expando]) return a;
            var b, c, d = a, f = p.event.fixHooks[a.type] || {}, g = f.props ? this.props.concat(f.props) : this.props;
            a = p.Event(d);
            for (b = g.length; b; ) c = g[--b], a[c] = d[c];
            return a.target || (a.target = d.srcElement || e), a.target.nodeType === 3 && (a.target = a.target.parentNode), a.metaKey = !!a.metaKey, f.filter ? f.filter(a, d) : a;
        },
        special: {
            load: {
                noBubble: !0
            },
            focus: {
                delegateType: "focusin"
            },
            blur: {
                delegateType: "focusout"
            },
            beforeunload: {
                setup: function(a, b, c) {
                    p.isWindow(this) && (this.onbeforeunload = c);
                },
                teardown: function(a, b) {
                    this.onbeforeunload === b && (this.onbeforeunload = null);
                }
            }
        },
        simulate: function(a, b, c, d) {
            var e = p.extend(new p.Event, c, {
                type: a,
                isSimulated: !0,
                originalEvent: {}
            });
            d ? p.event.trigger(e, null, b) : p.event.dispatch.call(b, e), e.isDefaultPrevented() && c.preventDefault();
        }
    }, p.event.handle = p.event.dispatch, p.removeEvent = e.removeEventListener ? function(a, b, c) {
        a.removeEventListener && a.removeEventListener(b, c, !1);
    } : function(a, b, c) {
        var d = "on" + b;
        a.detachEvent && (typeof a[d] == "undefined" && (a[d] = null), a.detachEvent(d, c));
    }, p.Event = function(a, b) {
        if (this instanceof p.Event) a && a.type ? (this.originalEvent = a, this.type = a.type, this.isDefaultPrevented = a.defaultPrevented || a.returnValue === !1 || a.getPreventDefault && a.getPreventDefault() ? bb : ba) : this.type = a, b && p.extend(this, b), this.timeStamp = a && a.timeStamp || p.now(), this[p.expando] = !0; else return new p.Event(a, b);
    }, p.Event.prototype = {
        preventDefault: function() {
            this.isDefaultPrevented = bb;
            var a = this.originalEvent;
            if (!a) return;
            a.preventDefault ? a.preventDefault() : a.returnValue = !1;
        },
        stopPropagation: function() {
            this.isPropagationStopped = bb;
            var a = this.originalEvent;
            if (!a) return;
            a.stopPropagation && a.stopPropagation(), a.cancelBubble = !0;
        },
        stopImmediatePropagation: function() {
            this.isImmediatePropagationStopped = bb, this.stopPropagation();
        },
        isDefaultPrevented: ba,
        isPropagationStopped: ba,
        isImmediatePropagationStopped: ba
    }, p.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function(a, b) {
        p.event.special[a] = {
            delegateType: b,
            bindType: b,
            handle: function(a) {
                var c, d = this, e = a.relatedTarget, f = a.handleObj, g = f.selector;
                if (!e || e !== d && !p.contains(d, e)) a.type = f.origType, c = f.handler.apply(this, arguments), a.type = b;
                return c;
            }
        };
    }), p.support.submitBubbles || (p.event.special.submit = {
        setup: function() {
            if (p.nodeName(this, "form")) return !1;
            p.event.add(this, "click._submit keypress._submit", function(a) {
                var c = a.target, d = p.nodeName(c, "input") || p.nodeName(c, "button") ? c.form : b;
                d && !p._data(d, "_submit_attached") && (p.event.add(d, "submit._submit", function(a) {
                    a._submit_bubble = !0;
                }), p._data(d, "_submit_attached", !0));
            });
        },
        postDispatch: function(a) {
            a._submit_bubble && (delete a._submit_bubble, this.parentNode && !a.isTrigger && p.event.simulate("submit", this.parentNode, a, !0));
        },
        teardown: function() {
            if (p.nodeName(this, "form")) return !1;
            p.event.remove(this, "._submit");
        }
    }), p.support.changeBubbles || (p.event.special.change = {
        setup: function() {
            if (V.test(this.nodeName)) {
                if (this.type === "checkbox" || this.type === "radio") p.event.add(this, "propertychange._change", function(a) {
                    a.originalEvent.propertyName === "checked" && (this._just_changed = !0);
                }), p.event.add(this, "click._change", function(a) {
                    this._just_changed && !a.isTrigger && (this._just_changed = !1), p.event.simulate("change", this, a, !0);
                });
                return !1;
            }
            p.event.add(this, "beforeactivate._change", function(a) {
                var b = a.target;
                V.test(b.nodeName) && !p._data(b, "_change_attached") && (p.event.add(b, "change._change", function(a) {
                    this.parentNode && !a.isSimulated && !a.isTrigger && p.event.simulate("change", this.parentNode, a, !0);
                }), p._data(b, "_change_attached", !0));
            });
        },
        handle: function(a) {
            var b = a.target;
            if (this !== b || a.isSimulated || a.isTrigger || b.type !== "radio" && b.type !== "checkbox") return a.handleObj.handler.apply(this, arguments);
        },
        teardown: function() {
            return p.event.remove(this, "._change"), !V.test(this.nodeName);
        }
    }), p.support.focusinBubbles || p.each({
        focus: "focusin",
        blur: "focusout"
    }, function(a, b) {
        var c = 0, d = function(a) {
            p.event.simulate(b, a.target, p.event.fix(a), !0);
        };
        p.event.special[b] = {
            setup: function() {
                c++ === 0 && e.addEventListener(a, d, !0);
            },
            teardown: function() {
                --c === 0 && e.removeEventListener(a, d, !0);
            }
        };
    }), p.fn.extend({
        on: function(a, c, d, e, f) {
            var g, h;
            if (typeof a == "object") {
                typeof c != "string" && (d = d || c, c = b);
                for (h in a) this.on(h, c, d, a[h], f);
                return this;
            }
            d == null && e == null ? (e = c, d = c = b) : e == null && (typeof c == "string" ? (e = d, d = b) : (e = d, d = c, c = b));
            if (e === !1) e = ba; else if (!e) return this;
            return f === 1 && (g = e, e = function(a) {
                return p().off(a), g.apply(this, arguments);
            }, e.guid = g.guid || (g.guid = p.guid++)), this.each(function() {
                p.event.add(this, a, e, d, c);
            });
        },
        one: function(a, b, c, d) {
            return this.on(a, b, c, d, 1);
        },
        off: function(a, c, d) {
            var e, f;
            if (a && a.preventDefault && a.handleObj) return e = a.handleObj, p(a.delegateTarget).off(e.namespace ? e.origType + "." + e.namespace : e.origType, e.selector, e.handler), this;
            if (typeof a == "object") {
                for (f in a) this.off(f, c, a[f]);
                return this;
            }
            if (c === !1 || typeof c == "function") d = c, c = b;
            return d === !1 && (d = ba), this.each(function() {
                p.event.remove(this, a, d, c);
            });
        },
        bind: function(a, b, c) {
            return this.on(a, null, b, c);
        },
        unbind: function(a, b) {
            return this.off(a, null, b);
        },
        live: function(a, b, c) {
            return p(this.context).on(a, this.selector, b, c), this;
        },
        die: function(a, b) {
            return p(this.context).off(a, this.selector || "**", b), this;
        },
        delegate: function(a, b, c, d) {
            return this.on(b, a, c, d);
        },
        undelegate: function(a, b, c) {
            return arguments.length === 1 ? this.off(a, "**") : this.off(b, a || "**", c);
        },
        trigger: function(a, b) {
            return this.each(function() {
                p.event.trigger(a, b, this);
            });
        },
        triggerHandler: function(a, b) {
            if (this[0]) return p.event.trigger(a, b, this[0], !0);
        },
        toggle: function(a) {
            var b = arguments, c = a.guid || p.guid++, d = 0, e = function(c) {
                var e = (p._data(this, "lastToggle" + a.guid) || 0) % d;
                return p._data(this, "lastToggle" + a.guid, e + 1), c.preventDefault(), b[e].apply(this, arguments) || !1;
            };
            e.guid = c;
            while (d < b.length) b[d++].guid = c;
            return this.click(e);
        },
        hover: function(a, b) {
            return this.mouseenter(a).mouseleave(b || a);
        }
    }), p.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(a, b) {
        p.fn[b] = function(a, c) {
            return c == null && (c = a, a = null), arguments.length > 0 ? this.on(b, null, a, c) : this.trigger(b);
        }, Y.test(b) && (p.event.fixHooks[b] = p.event.keyHooks), Z.test(b) && (p.event.fixHooks[b] = p.event.mouseHooks);
    }), function(a, b) {
        function bc(a, b, c, d) {
            c = c || [], b = b || r;
            var e, f, i, j, k = b.nodeType;
            if (!a || typeof a != "string") return c;
            if (k !== 1 && k !== 9) return [];
            i = g(b);
            if (!i && !d) if (e = P.exec(a)) if (j = e[1]) {
                if (k === 9) {
                    f = b.getElementById(j);
                    if (!f || !f.parentNode) return c;
                    if (f.id === j) return c.push(f), c;
                } else if (b.ownerDocument && (f = b.ownerDocument.getElementById(j)) && h(b, f) && f.id === j) return c.push(f), c;
            } else {
                if (e[2]) return w.apply(c, x.call(b.getElementsByTagName(a), 0)), c;
                if ((j = e[3]) && _ && b.getElementsByClassName) return w.apply(c, x.call(b.getElementsByClassName(j), 0)), c;
            }
            return bp(a.replace(L, "$1"), b, c, d, i);
        }
        function bd(a) {
            return function(b) {
                var c = b.nodeName.toLowerCase();
                return c === "input" && b.type === a;
            };
        }
        function be(a) {
            return function(b) {
                var c = b.nodeName.toLowerCase();
                return (c === "input" || c === "button") && b.type === a;
            };
        }
        function bf(a) {
            return z(function(b) {
                return b = +b, z(function(c, d) {
                    var e, f = a([], c.length, b), g = f.length;
                    while (g--) c[e = f[g]] && (c[e] = !(d[e] = c[e]));
                });
            });
        }
        function bg(a, b, c) {
            if (a === b) return c;
            var d = a.nextSibling;
            while (d) {
                if (d === b) return -1;
                d = d.nextSibling;
            }
            return 1;
        }
        function bh(a, b) {
            var c, d, f, g, h, i, j, k = C[o][a];
            if (k) return b ? 0 : k.slice(0);
            h = a, i = [], j = e.preFilter;
            while (h) {
                if (!c || (d = M.exec(h))) d && (h = h.slice(d[0].length)), i.push(f = []);
                c = !1;
                if (d = N.exec(h)) f.push(c = new q(d.shift())), h = h.slice(c.length), c.type = d[0].replace(L, " ");
                for (g in e.filter) (d = W[g].exec(h)) && (!j[g] || (d = j[g](d, r, !0))) && (f.push(c = new q(d.shift())), h = h.slice(c.length), c.type = g, c.matches = d);
                if (!c) break;
            }
            return b ? h.length : h ? bc.error(a) : C(a, i).slice(0);
        }
        function bi(a, b, d) {
            var e = b.dir, f = d && b.dir === "parentNode", g = u++;
            return b.first ? function(b, c, d) {
                while (b = b[e]) if (f || b.nodeType === 1) return a(b, c, d);
            } : function(b, d, h) {
                if (!h) {
                    var i, j = t + " " + g + " ", k = j + c;
                    while (b = b[e]) if (f || b.nodeType === 1) {
                        if ((i = b[o]) === k) return b.sizset;
                        if (typeof i == "string" && i.indexOf(j) === 0) {
                            if (b.sizset) return b;
                        } else {
                            b[o] = k;
                            if (a(b, d, h)) return b.sizset = !0, b;
                            b.sizset = !1;
                        }
                    }
                } else while (b = b[e]) if (f || b.nodeType === 1) if (a(b, d, h)) return b;
            };
        }
        function bj(a) {
            return a.length > 1 ? function(b, c, d) {
                var e = a.length;
                while (e--) if (!a[e](b, c, d)) return !1;
                return !0;
            } : a[0];
        }
        function bk(a, b, c, d, e) {
            var f, g = [], h = 0, i = a.length, j = b != null;
            for (; h < i; h++) if (f = a[h]) if (!c || c(f, d, e)) g.push(f), j && b.push(h);
            return g;
        }
        function bl(a, b, c, d, e, f) {
            return d && !d[o] && (d = bl(d)), e && !e[o] && (e = bl(e, f)), z(function(f, g, h, i) {
                if (f && e) return;
                var j, k, l, m = [], n = [], o = g.length, p = f || bo(b || "*", h.nodeType ? [ h ] : h, [], f), q = a && (f || !b) ? bk(p, m, a, h, i) : p, r = c ? e || (f ? a : o || d) ? [] : g : q;
                c && c(q, r, h, i);
                if (d) {
                    l = bk(r, n), d(l, [], h, i), j = l.length;
                    while (j--) if (k = l[j]) r[n[j]] = !(q[n[j]] = k);
                }
                if (f) {
                    j = a && r.length;
                    while (j--) if (k = r[j]) f[m[j]] = !(g[m[j]] = k);
                } else r = bk(r === g ? r.splice(o, r.length) : r), e ? e(null, g, r, i) : w.apply(g, r);
            });
        }
        function bm(a) {
            var b, c, d, f = a.length, g = e.relative[a[0].type], h = g || e.relative[" "], i = g ? 1 : 0, j = bi(function(a) {
                return a === b;
            }, h, !0), k = bi(function(a) {
                return y.call(b, a) > -1;
            }, h, !0), m = [ function(a, c, d) {
                return !g && (d || c !== l) || ((b = c).nodeType ? j(a, c, d) : k(a, c, d));
            } ];
            for (; i < f; i++) if (c = e.relative[a[i].type]) m = [ bi(bj(m), c) ]; else {
                c = e.filter[a[i].type].apply(null, a[i].matches);
                if (c[o]) {
                    d = ++i;
                    for (; d < f; d++) if (e.relative[a[d].type]) break;
                    return bl(i > 1 && bj(m), i > 1 && a.slice(0, i - 1).join("").replace(L, "$1"), c, i < d && bm(a.slice(i, d)), d < f && bm(a = a.slice(d)), d < f && a.join(""));
                }
                m.push(c);
            }
            return bj(m);
        }
        function bn(a, b) {
            var d = b.length > 0, f = a.length > 0, g = function(h, i, j, k, m) {
                var n, o, p, q = [], s = 0, u = "0", x = h && [], y = m != null, z = l, A = h || f && e.find.TAG("*", m && i.parentNode || i), B = t += z == null ? 1 : Math.E;
                y && (l = i !== r && i, c = g.el);
                for (; (n = A[u]) != null; u++) {
                    if (f && n) {
                        for (o = 0; p = a[o]; o++) if (p(n, i, j)) {
                            k.push(n);
                            break;
                        }
                        y && (t = B, c = ++g.el);
                    }
                    d && ((n = !p && n) && s--, h && x.push(n));
                }
                s += u;
                if (d && u !== s) {
                    for (o = 0; p = b[o]; o++) p(x, q, i, j);
                    if (h) {
                        if (s > 0) while (u--) !x[u] && !q[u] && (q[u] = v.call(k));
                        q = bk(q);
                    }
                    w.apply(k, q), y && !h && q.length > 0 && s + b.length > 1 && bc.uniqueSort(k);
                }
                return y && (t = B, l = z), x;
            };
            return g.el = 0, d ? z(g) : g;
        }
        function bo(a, b, c, d) {
            var e = 0, f = b.length;
            for (; e < f; e++) bc(a, b[e], c, d);
            return c;
        }
        function bp(a, b, c, d, f) {
            var g, h, j, k, l, m = bh(a), n = m.length;
            if (!d && m.length === 1) {
                h = m[0] = m[0].slice(0);
                if (h.length > 2 && (j = h[0]).type === "ID" && b.nodeType === 9 && !f && e.relative[h[1].type]) {
                    b = e.find.ID(j.matches[0].replace(V, ""), b, f)[0];
                    if (!b) return c;
                    a = a.slice(h.shift().length);
                }
                for (g = W.POS.test(a) ? -1 : h.length - 1; g >= 0; g--) {
                    j = h[g];
                    if (e.relative[k = j.type]) break;
                    if (l = e.find[k]) if (d = l(j.matches[0].replace(V, ""), R.test(h[0].type) && b.parentNode || b, f)) {
                        h.splice(g, 1), a = d.length && h.join("");
                        if (!a) return w.apply(c, x.call(d, 0)), c;
                        break;
                    }
                }
            }
            return i(a, m)(d, b, f, c, R.test(a)), c;
        }
        function bq() {}
        var c, d, e, f, g, h, i, j, k, l, m = !0, n = "undefined", o = ("sizcache" + Math.random()).replace(".", ""), q = String, r = a.document, s = r.documentElement, t = 0, u = 0, v = [].pop, w = [].push, x = [].slice, y = [].indexOf || function(a) {
            var b = 0, c = this.length;
            for (; b < c; b++) if (this[b] === a) return b;
            return -1;
        }, z = function(a, b) {
            return a[o] = b == null || b, a;
        }, A = function() {
            var a = {}, b = [];
            return z(function(c, d) {
                return b.push(c) > e.cacheLength && delete a[b.shift()], a[c] = d;
            }, a);
        }, B = A(), C = A(), D = A(), E = "[\\x20\\t\\r\\n\\f]", F = "(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+", G = F.replace("w", "w#"), H = "([*^$|!~]?=)", I = "\\[" + E + "*(" + F + ")" + E + "*(?:" + H + E + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + G + ")|)|)" + E + "*\\]", J = ":(" + F + ")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:" + I + ")|[^:]|\\\\.)*|.*))\\)|)", K = ":(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + E + "*((?:-\\d)?\\d*)" + E + "*\\)|)(?=[^-]|$)", L = new RegExp("^" + E + "+|((?:^|[^\\\\])(?:\\\\.)*)" + E + "+$", "g"), M = new RegExp("^" + E + "*," + E + "*"), N = new RegExp("^" + E + "*([\\x20\\t\\r\\n\\f>+~])" + E + "*"), O = new RegExp(J), P = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/, Q = /^:not/, R = /[\x20\t\r\n\f]*[+~]/, S = /:not\($/, T = /h\d/i, U = /input|select|textarea|button/i, V = /\\(?!\\)/g, W = {
            ID: new RegExp("^#(" + F + ")"),
            CLASS: new RegExp("^\\.(" + F + ")"),
            NAME: new RegExp("^\\[name=['\"]?(" + F + ")['\"]?\\]"),
            TAG: new RegExp("^(" + F.replace("w", "w*") + ")"),
            ATTR: new RegExp("^" + I),
            PSEUDO: new RegExp("^" + J),
            POS: new RegExp(K, "i"),
            CHILD: new RegExp("^:(only|nth|first|last)-child(?:\\(" + E + "*(even|odd|(([+-]|)(\\d*)n|)" + E + "*(?:([+-]|)" + E + "*(\\d+)|))" + E + "*\\)|)", "i"),
            needsContext: new RegExp("^" + E + "*[>+~]|" + K, "i")
        }, X = function(a) {
            var b = r.createElement("div");
            try {
                return a(b);
            } catch (c) {
                return !1;
            } finally {
                b = null;
            }
        }, Y = X(function(a) {
            return a.appendChild(r.createComment("")), !a.getElementsByTagName("*").length;
        }), Z = X(function(a) {
            return a.innerHTML = "<a href='#'></a>", a.firstChild && typeof a.firstChild.getAttribute !== n && a.firstChild.getAttribute("href") === "#";
        }), $ = X(function(a) {
            a.innerHTML = "<select></select>";
            var b = typeof a.lastChild.getAttribute("multiple");
            return b !== "boolean" && b !== "string";
        }), _ = X(function(a) {
            return a.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>", !a.getElementsByClassName || !a.getElementsByClassName("e").length ? !1 : (a.lastChild.className = "e", a.getElementsByClassName("e").length === 2);
        }), ba = X(function(a) {
            a.id = o + 0, a.innerHTML = "<a name='" + o + "'></a><div name='" + o + "'></div>", s.insertBefore(a, s.firstChild);
            var b = r.getElementsByName && r.getElementsByName(o).length === 2 + r.getElementsByName(o + 0).length;
            return d = !r.getElementById(o), s.removeChild(a), b;
        });
        try {
            x.call(s.childNodes, 0)[0].nodeType;
        } catch (bb) {
            x = function(a) {
                var b, c = [];
                for (; b = this[a]; a++) c.push(b);
                return c;
            };
        }
        bc.matches = function(a, b) {
            return bc(a, null, null, b);
        }, bc.matchesSelector = function(a, b) {
            return bc(b, null, null, [ a ]).length > 0;
        }, f = bc.getText = function(a) {
            var b, c = "", d = 0, e = a.nodeType;
            if (e) {
                if (e === 1 || e === 9 || e === 11) {
                    if (typeof a.textContent == "string") return a.textContent;
                    for (a = a.firstChild; a; a = a.nextSibling) c += f(a);
                } else if (e === 3 || e === 4) return a.nodeValue;
            } else for (; b = a[d]; d++) c += f(b);
            return c;
        }, g = bc.isXML = function(a) {
            var b = a && (a.ownerDocument || a).documentElement;
            return b ? b.nodeName !== "HTML" : !1;
        }, h = bc.contains = s.contains ? function(a, b) {
            var c = a.nodeType === 9 ? a.documentElement : a, d = b && b.parentNode;
            return a === d || !!(d && d.nodeType === 1 && c.contains && c.contains(d));
        } : s.compareDocumentPosition ? function(a, b) {
            return b && !!(a.compareDocumentPosition(b) & 16);
        } : function(a, b) {
            while (b = b.parentNode) if (b === a) return !0;
            return !1;
        }, bc.attr = function(a, b) {
            var c, d = g(a);
            return d || (b = b.toLowerCase()), (c = e.attrHandle[b]) ? c(a) : d || $ ? a.getAttribute(b) : (c = a.getAttributeNode(b), c ? typeof a[b] == "boolean" ? a[b] ? b : null : c.specified ? c.value : null : null);
        }, e = bc.selectors = {
            cacheLength: 50,
            createPseudo: z,
            match: W,
            attrHandle: Z ? {} : {
                href: function(a) {
                    return a.getAttribute("href", 2);
                },
                type: function(a) {
                    return a.getAttribute("type");
                }
            },
            find: {
                ID: d ? function(a, b, c) {
                    if (typeof b.getElementById !== n && !c) {
                        var d = b.getElementById(a);
                        return d && d.parentNode ? [ d ] : [];
                    }
                } : function(a, c, d) {
                    if (typeof c.getElementById !== n && !d) {
                        var e = c.getElementById(a);
                        return e ? e.id === a || typeof e.getAttributeNode !== n && e.getAttributeNode("id").value === a ? [ e ] : b : [];
                    }
                },
                TAG: Y ? function(a, b) {
                    if (typeof b.getElementsByTagName !== n) return b.getElementsByTagName(a);
                } : function(a, b) {
                    var c = b.getElementsByTagName(a);
                    if (a === "*") {
                        var d, e = [], f = 0;
                        for (; d = c[f]; f++) d.nodeType === 1 && e.push(d);
                        return e;
                    }
                    return c;
                },
                NAME: ba && function(a, b) {
                    if (typeof b.getElementsByName !== n) return b.getElementsByName(name);
                },
                CLASS: _ && function(a, b, c) {
                    if (typeof b.getElementsByClassName !== n && !c) return b.getElementsByClassName(a);
                }
            },
            relative: {
                ">": {
                    dir: "parentNode",
                    first: !0
                },
                " ": {
                    dir: "parentNode"
                },
                "+": {
                    dir: "previousSibling",
                    first: !0
                },
                "~": {
                    dir: "previousSibling"
                }
            },
            preFilter: {
                ATTR: function(a) {
                    return a[1] = a[1].replace(V, ""), a[3] = (a[4] || a[5] || "").replace(V, ""), a[2] === "~=" && (a[3] = " " + a[3] + " "), a.slice(0, 4);
                },
                CHILD: function(a) {
                    return a[1] = a[1].toLowerCase(), a[1] === "nth" ? (a[2] || bc.error(a[0]), a[3] = +(a[3] ? a[4] + (a[5] || 1) : 2 * (a[2] === "even" || a[2] === "odd")), a[4] = +(a[6] + a[7] || a[2] === "odd")) : a[2] && bc.error(a[0]), a;
                },
                PSEUDO: function(a) {
                    var b, c;
                    if (W.CHILD.test(a[0])) return null;
                    if (a[3]) a[2] = a[3]; else if (b = a[4]) O.test(b) && (c = bh(b, !0)) && (c = b.indexOf(")", b.length - c) - b.length) && (b = b.slice(0, c), a[0] = a[0].slice(0, c)), a[2] = b;
                    return a.slice(0, 3);
                }
            },
            filter: {
                ID: d ? function(a) {
                    return a = a.replace(V, ""), function(b) {
                        return b.getAttribute("id") === a;
                    };
                } : function(a) {
                    return a = a.replace(V, ""), function(b) {
                        var c = typeof b.getAttributeNode !== n && b.getAttributeNode("id");
                        return c && c.value === a;
                    };
                },
                TAG: function(a) {
                    return a === "*" ? function() {
                        return !0;
                    } : (a = a.replace(V, "").toLowerCase(), function(b) {
                        return b.nodeName && b.nodeName.toLowerCase() === a;
                    });
                },
                CLASS: function(a) {
                    var b = B[o][a];
                    return b || (b = B(a, new RegExp("(^|" + E + ")" + a + "(" + E + "|$)"))), function(a) {
                        return b.test(a.className || typeof a.getAttribute !== n && a.getAttribute("class") || "");
                    };
                },
                ATTR: function(a, b, c) {
                    return function(d, e) {
                        var f = bc.attr(d, a);
                        return f == null ? b === "!=" : b ? (f += "", b === "=" ? f === c : b === "!=" ? f !== c : b === "^=" ? c && f.indexOf(c) === 0 : b === "*=" ? c && f.indexOf(c) > -1 : b === "$=" ? c && f.substr(f.length - c.length) === c : b === "~=" ? (" " + f + " ").indexOf(c) > -1 : b === "|=" ? f === c || f.substr(0, c.length + 1) === c + "-" : !1) : !0;
                    };
                },
                CHILD: function(a, b, c, d) {
                    return a === "nth" ? function(a) {
                        var b, e, f = a.parentNode;
                        if (c === 1 && d === 0) return !0;
                        if (f) {
                            e = 0;
                            for (b = f.firstChild; b; b = b.nextSibling) if (b.nodeType === 1) {
                                e++;
                                if (a === b) break;
                            }
                        }
                        return e -= d, e === c || e % c === 0 && e / c >= 0;
                    } : function(b) {
                        var c = b;
                        switch (a) {
                          case "only":
                          case "first":
                            while (c = c.previousSibling) if (c.nodeType === 1) return !1;
                            if (a === "first") return !0;
                            c = b;
                          case "last":
                            while (c = c.nextSibling) if (c.nodeType === 1) return !1;
                            return !0;
                        }
                    };
                },
                PSEUDO: function(a, b) {
                    var c, d = e.pseudos[a] || e.setFilters[a.toLowerCase()] || bc.error("unsupported pseudo: " + a);
                    return d[o] ? d(b) : d.length > 1 ? (c = [ a, a, "", b ], e.setFilters.hasOwnProperty(a.toLowerCase()) ? z(function(a, c) {
                        var e, f = d(a, b), g = f.length;
                        while (g--) e = y.call(a, f[g]), a[e] = !(c[e] = f[g]);
                    }) : function(a) {
                        return d(a, 0, c);
                    }) : d;
                }
            },
            pseudos: {
                not: z(function(a) {
                    var b = [], c = [], d = i(a.replace(L, "$1"));
                    return d[o] ? z(function(a, b, c, e) {
                        var f, g = d(a, null, e, []), h = a.length;
                        while (h--) if (f = g[h]) a[h] = !(b[h] = f);
                    }) : function(a, e, f) {
                        return b[0] = a, d(b, null, f, c), !c.pop();
                    };
                }),
                has: z(function(a) {
                    return function(b) {
                        return bc(a, b).length > 0;
                    };
                }),
                contains: z(function(a) {
                    return function(b) {
                        return (b.textContent || b.innerText || f(b)).indexOf(a) > -1;
                    };
                }),
                enabled: function(a) {
                    return a.disabled === !1;
                },
                disabled: function(a) {
                    return a.disabled === !0;
                },
                checked: function(a) {
                    var b = a.nodeName.toLowerCase();
                    return b === "input" && !!a.checked || b === "option" && !!a.selected;
                },
                selected: function(a) {
                    return a.parentNode && a.parentNode.selectedIndex, a.selected === !0;
                },
                parent: function(a) {
                    return !e.pseudos.empty(a);
                },
                empty: function(a) {
                    var b;
                    a = a.firstChild;
                    while (a) {
                        if (a.nodeName > "@" || (b = a.nodeType) === 3 || b === 4) return !1;
                        a = a.nextSibling;
                    }
                    return !0;
                },
                header: function(a) {
                    return T.test(a.nodeName);
                },
                text: function(a) {
                    var b, c;
                    return a.nodeName.toLowerCase() === "input" && (b = a.type) === "text" && ((c = a.getAttribute("type")) == null || c.toLowerCase() === b);
                },
                radio: bd("radio"),
                checkbox: bd("checkbox"),
                file: bd("file"),
                password: bd("password"),
                image: bd("image"),
                submit: be("submit"),
                reset: be("reset"),
                button: function(a) {
                    var b = a.nodeName.toLowerCase();
                    return b === "input" && a.type === "button" || b === "button";
                },
                input: function(a) {
                    return U.test(a.nodeName);
                },
                focus: function(a) {
                    var b = a.ownerDocument;
                    return a === b.activeElement && (!b.hasFocus || b.hasFocus()) && (!!a.type || !!a.href);
                },
                active: function(a) {
                    return a === a.ownerDocument.activeElement;
                },
                first: bf(function(a, b, c) {
                    return [ 0 ];
                }),
                last: bf(function(a, b, c) {
                    return [ b - 1 ];
                }),
                eq: bf(function(a, b, c) {
                    return [ c < 0 ? c + b : c ];
                }),
                even: bf(function(a, b, c) {
                    for (var d = 0; d < b; d += 2) a.push(d);
                    return a;
                }),
                odd: bf(function(a, b, c) {
                    for (var d = 1; d < b; d += 2) a.push(d);
                    return a;
                }),
                lt: bf(function(a, b, c) {
                    for (var d = c < 0 ? c + b : c; --d >= 0; ) a.push(d);
                    return a;
                }),
                gt: bf(function(a, b, c) {
                    for (var d = c < 0 ? c + b : c; ++d < b; ) a.push(d);
                    return a;
                })
            }
        }, j = s.compareDocumentPosition ? function(a, b) {
            return a === b ? (k = !0, 0) : (!a.compareDocumentPosition || !b.compareDocumentPosition ? a.compareDocumentPosition : a.compareDocumentPosition(b) & 4) ? -1 : 1;
        } : function(a, b) {
            if (a === b) return k = !0, 0;
            if (a.sourceIndex && b.sourceIndex) return a.sourceIndex - b.sourceIndex;
            var c, d, e = [], f = [], g = a.parentNode, h = b.parentNode, i = g;
            if (g === h) return bg(a, b);
            if (!g) return -1;
            if (!h) return 1;
            while (i) e.unshift(i), i = i.parentNode;
            i = h;
            while (i) f.unshift(i), i = i.parentNode;
            c = e.length, d = f.length;
            for (var j = 0; j < c && j < d; j++) if (e[j] !== f[j]) return bg(e[j], f[j]);
            return j === c ? bg(a, f[j], -1) : bg(e[j], b, 1);
        }, [ 0, 0 ].sort(j), m = !k, bc.uniqueSort = function(a) {
            var b, c = 1;
            k = m, a.sort(j);
            if (k) for (; b = a[c]; c++) b === a[c - 1] && a.splice(c--, 1);
            return a;
        }, bc.error = function(a) {
            throw new Error("Syntax error, unrecognized expression: " + a);
        }, i = bc.compile = function(a, b) {
            var c, d = [], e = [], f = D[o][a];
            if (!f) {
                b || (b = bh(a)), c = b.length;
                while (c--) f = bm(b[c]), f[o] ? d.push(f) : e.push(f);
                f = D(a, bn(e, d));
            }
            return f;
        }, r.querySelectorAll && function() {
            var a, b = bp, c = /'|\\/g, d = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g, e = [ ":focus" ], f = [ ":active", ":focus" ], h = s.matchesSelector || s.mozMatchesSelector || s.webkitMatchesSelector || s.oMatchesSelector || s.msMatchesSelector;
            X(function(a) {
                a.innerHTML = "<select><option selected=''></option></select>", a.querySelectorAll("[selected]").length || e.push("\\[" + E + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)"), a.querySelectorAll(":checked").length || e.push(":checked");
            }), X(function(a) {
                a.innerHTML = "<p test=''></p>", a.querySelectorAll("[test^='']").length && e.push("[*^$]=" + E + "*(?:\"\"|'')"), a.innerHTML = "<input type='hidden'/>", a.querySelectorAll(":enabled").length || e.push(":enabled", ":disabled");
            }), e = new RegExp(e.join("|")), bp = function(a, d, f, g, h) {
                if (!g && !h && (!e || !e.test(a))) {
                    var i, j, k = !0, l = o, m = d, n = d.nodeType === 9 && a;
                    if (d.nodeType === 1 && d.nodeName.toLowerCase() !== "object") {
                        i = bh(a), (k = d.getAttribute("id")) ? l = k.replace(c, "\\$&") : d.setAttribute("id", l), l = "[id='" + l + "'] ", j = i.length;
                        while (j--) i[j] = l + i[j].join("");
                        m = R.test(a) && d.parentNode || d, n = i.join(",");
                    }
                    if (n) try {
                        return w.apply(f, x.call(m.querySelectorAll(n), 0)), f;
                    } catch (p) {} finally {
                        k || d.removeAttribute("id");
                    }
                }
                return b(a, d, f, g, h);
            }, h && (X(function(b) {
                a = h.call(b, "div");
                try {
                    h.call(b, "[test!='']:sizzle"), f.push("!=", J);
                } catch (c) {}
            }), f = new RegExp(f.join("|")), bc.matchesSelector = function(b, c) {
                c = c.replace(d, "='$1']");
                if (!g(b) && !f.test(c) && (!e || !e.test(c))) try {
                    var i = h.call(b, c);
                    if (i || a || b.document && b.document.nodeType !== 11) return i;
                } catch (j) {}
                return bc(c, null, null, [ b ]).length > 0;
            });
        }(), e.pseudos.nth = e.pseudos.eq, e.filters = bq.prototype = e.pseudos, e.setFilters = new bq, bc.attr = p.attr, p.find = bc, p.expr = bc.selectors, p.expr[":"] = p.expr.pseudos, p.unique = bc.uniqueSort, p.text = bc.getText, p.isXMLDoc = bc.isXML, p.contains = bc.contains;
    }(a);
    var bc = /Until$/, bd = /^(?:parents|prev(?:Until|All))/, be = /^.[^:#\[\.,]*$/, bf = p.expr.match.needsContext, bg = {
        children: !0,
        contents: !0,
        next: !0,
        prev: !0
    };
    p.fn.extend({
        find: function(a) {
            var b, c, d, e, f, g, h = this;
            if (typeof a != "string") return p(a).filter(function() {
                for (b = 0, c = h.length; b < c; b++) if (p.contains(h[b], this)) return !0;
            });
            g = this.pushStack("", "find", a);
            for (b = 0, c = this.length; b < c; b++) {
                d = g.length, p.find(a, this[b], g);
                if (b > 0) for (e = d; e < g.length; e++) for (f = 0; f < d; f++) if (g[f] === g[e]) {
                    g.splice(e--, 1);
                    break;
                }
            }
            return g;
        },
        has: function(a) {
            var b, c = p(a, this), d = c.length;
            return this.filter(function() {
                for (b = 0; b < d; b++) if (p.contains(this, c[b])) return !0;
            });
        },
        not: function(a) {
            return this.pushStack(bj(this, a, !1), "not", a);
        },
        filter: function(a) {
            return this.pushStack(bj(this, a, !0), "filter", a);
        },
        is: function(a) {
            return !!a && (typeof a == "string" ? bf.test(a) ? p(a, this.context).index(this[0]) >= 0 : p.filter(a, this).length > 0 : this.filter(a).length > 0);
        },
        closest: function(a, b) {
            var c, d = 0, e = this.length, f = [], g = bf.test(a) || typeof a != "string" ? p(a, b || this.context) : 0;
            for (; d < e; d++) {
                c = this[d];
                while (c && c.ownerDocument && c !== b && c.nodeType !== 11) {
                    if (g ? g.index(c) > -1 : p.find.matchesSelector(c, a)) {
                        f.push(c);
                        break;
                    }
                    c = c.parentNode;
                }
            }
            return f = f.length > 1 ? p.unique(f) : f, this.pushStack(f, "closest", a);
        },
        index: function(a) {
            return a ? typeof a == "string" ? p.inArray(this[0], p(a)) : p.inArray(a.jquery ? a[0] : a, this) : this[0] && this[0].parentNode ? this.prevAll().length : -1;
        },
        add: function(a, b) {
            var c = typeof a == "string" ? p(a, b) : p.makeArray(a && a.nodeType ? [ a ] : a), d = p.merge(this.get(), c);
            return this.pushStack(bh(c[0]) || bh(d[0]) ? d : p.unique(d));
        },
        addBack: function(a) {
            return this.add(a == null ? this.prevObject : this.prevObject.filter(a));
        }
    }), p.fn.andSelf = p.fn.addBack, p.each({
        parent: function(a) {
            var b = a.parentNode;
            return b && b.nodeType !== 11 ? b : null;
        },
        parents: function(a) {
            return p.dir(a, "parentNode");
        },
        parentsUntil: function(a, b, c) {
            return p.dir(a, "parentNode", c);
        },
        next: function(a) {
            return bi(a, "nextSibling");
        },
        prev: function(a) {
            return bi(a, "previousSibling");
        },
        nextAll: function(a) {
            return p.dir(a, "nextSibling");
        },
        prevAll: function(a) {
            return p.dir(a, "previousSibling");
        },
        nextUntil: function(a, b, c) {
            return p.dir(a, "nextSibling", c);
        },
        prevUntil: function(a, b, c) {
            return p.dir(a, "previousSibling", c);
        },
        siblings: function(a) {
            return p.sibling((a.parentNode || {}).firstChild, a);
        },
        children: function(a) {
            return p.sibling(a.firstChild);
        },
        contents: function(a) {
            return p.nodeName(a, "iframe") ? a.contentDocument || a.contentWindow.document : p.merge([], a.childNodes);
        }
    }, function(a, b) {
        p.fn[a] = function(c, d) {
            var e = p.map(this, b, c);
            return bc.test(a) || (d = c), d && typeof d == "string" && (e = p.filter(d, e)), e = this.length > 1 && !bg[a] ? p.unique(e) : e, this.length > 1 && bd.test(a) && (e = e.reverse()), this.pushStack(e, a, k.call(arguments).join(","));
        };
    }), p.extend({
        filter: function(a, b, c) {
            return c && (a = ":not(" + a + ")"), b.length === 1 ? p.find.matchesSelector(b[0], a) ? [ b[0] ] : [] : p.find.matches(a, b);
        },
        dir: function(a, c, d) {
            var e = [], f = a[c];
            while (f && f.nodeType !== 9 && (d === b || f.nodeType !== 1 || !p(f).is(d))) f.nodeType === 1 && e.push(f), f = f[c];
            return e;
        },
        sibling: function(a, b) {
            var c = [];
            for (; a; a = a.nextSibling) a.nodeType === 1 && a !== b && c.push(a);
            return c;
        }
    });
    var bl = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video", bm = / jQuery\d+="(?:null|\d+)"/g, bn = /^\s+/, bo = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, bp = /<([\w:]+)/, bq = /<tbody/i, br = /<|&#?\w+;/, bs = /<(?:script|style|link)/i, bt = /<(?:script|object|embed|option|style)/i, bu = new RegExp("<(?:" + bl + ")[\\s/>]", "i"), bv = /^(?:checkbox|radio)$/, bw = /checked\s*(?:[^=]|=\s*.checked.)/i, bx = /\/(java|ecma)script/i, by = /^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g, bz = {
        option: [ 1, "<select multiple='multiple'>", "</select>" ],
        legend: [ 1, "<fieldset>", "</fieldset>" ],
        thead: [ 1, "<table>", "</table>" ],
        tr: [ 2, "<table><tbody>", "</tbody></table>" ],
        td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
        col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
        area: [ 1, "<map>", "</map>" ],
        _default: [ 0, "", "" ]
    }, bA = bk(e), bB = bA.appendChild(e.createElement("div"));
    bz.optgroup = bz.option, bz.tbody = bz.tfoot = bz.colgroup = bz.caption = bz.thead, bz.th = bz.td, p.support.htmlSerialize || (bz._default = [ 1, "X<div>", "</div>" ]), p.fn.extend({
        text: function(a) {
            return p.access(this, function(a) {
                return a === b ? p.text(this) : this.empty().append((this[0] && this[0].ownerDocument || e).createTextNode(a));
            }, null, a, arguments.length);
        },
        wrapAll: function(a) {
            if (p.isFunction(a)) return this.each(function(b) {
                p(this).wrapAll(a.call(this, b));
            });
            if (this[0]) {
                var b = p(a, this[0].ownerDocument).eq(0).clone(!0);
                this[0].parentNode && b.insertBefore(this[0]), b.map(function() {
                    var a = this;
                    while (a.firstChild && a.firstChild.nodeType === 1) a = a.firstChild;
                    return a;
                }).append(this);
            }
            return this;
        },
        wrapInner: function(a) {
            return p.isFunction(a) ? this.each(function(b) {
                p(this).wrapInner(a.call(this, b));
            }) : this.each(function() {
                var b = p(this), c = b.contents();
                c.length ? c.wrapAll(a) : b.append(a);
            });
        },
        wrap: function(a) {
            var b = p.isFunction(a);
            return this.each(function(c) {
                p(this).wrapAll(b ? a.call(this, c) : a);
            });
        },
        unwrap: function() {
            return this.parent().each(function() {
                p.nodeName(this, "body") || p(this).replaceWith(this.childNodes);
            }).end();
        },
        append: function() {
            return this.domManip(arguments, !0, function(a) {
                (this.nodeType === 1 || this.nodeType === 11) && this.appendChild(a);
            });
        },
        prepend: function() {
            return this.domManip(arguments, !0, function(a) {
                (this.nodeType === 1 || this.nodeType === 11) && this.insertBefore(a, this.firstChild);
            });
        },
        before: function() {
            if (!bh(this[0])) return this.domManip(arguments, !1, function(a) {
                this.parentNode.insertBefore(a, this);
            });
            if (arguments.length) {
                var a = p.clean(arguments);
                return this.pushStack(p.merge(a, this), "before", this.selector);
            }
        },
        after: function() {
            if (!bh(this[0])) return this.domManip(arguments, !1, function(a) {
                this.parentNode.insertBefore(a, this.nextSibling);
            });
            if (arguments.length) {
                var a = p.clean(arguments);
                return this.pushStack(p.merge(this, a), "after", this.selector);
            }
        },
        remove: function(a, b) {
            var c, d = 0;
            for (; (c = this[d]) != null; d++) if (!a || p.filter(a, [ c ]).length) !b && c.nodeType === 1 && (p.cleanData(c.getElementsByTagName("*")), p.cleanData([ c ])), c.parentNode && c.parentNode.removeChild(c);
            return this;
        },
        empty: function() {
            var a, b = 0;
            for (; (a = this[b]) != null; b++) {
                a.nodeType === 1 && p.cleanData(a.getElementsByTagName("*"));
                while (a.firstChild) a.removeChild(a.firstChild);
            }
            return this;
        },
        clone: function(a, b) {
            return a = a == null ? !1 : a, b = b == null ? a : b, this.map(function() {
                return p.clone(this, a, b);
            });
        },
        html: function(a) {
            return p.access(this, function(a) {
                var c = this[0] || {}, d = 0, e = this.length;
                if (a === b) return c.nodeType === 1 ? c.innerHTML.replace(bm, "") : b;
                if (typeof a == "string" && !bs.test(a) && (p.support.htmlSerialize || !bu.test(a)) && (p.support.leadingWhitespace || !bn.test(a)) && !bz[(bp.exec(a) || [ "", "" ])[1].toLowerCase()]) {
                    a = a.replace(bo, "<$1></$2>");
                    try {
                        for (; d < e; d++) c = this[d] || {}, c.nodeType === 1 && (p.cleanData(c.getElementsByTagName("*")), c.innerHTML = a);
                        c = 0;
                    } catch (f) {}
                }
                c && this.empty().append(a);
            }, null, a, arguments.length);
        },
        replaceWith: function(a) {
            return bh(this[0]) ? this.length ? this.pushStack(p(p.isFunction(a) ? a() : a), "replaceWith", a) : this : p.isFunction(a) ? this.each(function(b) {
                var c = p(this), d = c.html();
                c.replaceWith(a.call(this, b, d));
            }) : (typeof a != "string" && (a = p(a).detach()), this.each(function() {
                var b = this.nextSibling, c = this.parentNode;
                p(this).remove(), b ? p(b).before(a) : p(c).append(a);
            }));
        },
        detach: function(a) {
            return this.remove(a, !0);
        },
        domManip: function(a, c, d) {
            a = [].concat.apply([], a);
            var e, f, g, h, i = 0, j = a[0], k = [], l = this.length;
            if (!p.support.checkClone && l > 1 && typeof j == "string" && bw.test(j)) return this.each(function() {
                p(this).domManip(a, c, d);
            });
            if (p.isFunction(j)) return this.each(function(e) {
                var f = p(this);
                a[0] = j.call(this, e, c ? f.html() : b), f.domManip(a, c, d);
            });
            if (this[0]) {
                e = p.buildFragment(a, this, k), g = e.fragment, f = g.firstChild, g.childNodes.length === 1 && (g = f);
                if (f) {
                    c = c && p.nodeName(f, "tr");
                    for (h = e.cacheable || l - 1; i < l; i++) d.call(c && p.nodeName(this[i], "table") ? bC(this[i], "tbody") : this[i], i === h ? g : p.clone(g, !0, !0));
                }
                g = f = null, k.length && p.each(k, function(a, b) {
                    b.src ? p.ajax ? p.ajax({
                        url: b.src,
                        type: "GET",
                        dataType: "script",
                        async: !1,
                        global: !1,
                        "throws": !0
                    }) : p.error("no ajax") : p.globalEval((b.text || b.textContent || b.innerHTML || "").replace(by, "")), b.parentNode && b.parentNode.removeChild(b);
                });
            }
            return this;
        }
    }), p.buildFragment = function(a, c, d) {
        var f, g, h, i = a[0];
        return c = c || e, c = !c.nodeType && c[0] || c, c = c.ownerDocument || c, a.length === 1 && typeof i == "string" && i.length < 512 && c === e && i.charAt(0) === "<" && !bt.test(i) && (p.support.checkClone || !bw.test(i)) && (p.support.html5Clone || !bu.test(i)) && (g = !0, f = p.fragments[i], h = f !== b), f || (f = c.createDocumentFragment(), p.clean(a, c, f, d), g && (p.fragments[i] = h && f)), {
            fragment: f,
            cacheable: g
        };
    }, p.fragments = {}, p.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function(a, b) {
        p.fn[a] = function(c) {
            var d, e = 0, f = [], g = p(c), h = g.length, i = this.length === 1 && this[0].parentNode;
            if ((i == null || i && i.nodeType === 11 && i.childNodes.length === 1) && h === 1) return g[b](this[0]), this;
            for (; e < h; e++) d = (e > 0 ? this.clone(!0) : this).get(), p(g[e])[b](d), f = f.concat(d);
            return this.pushStack(f, a, g.selector);
        };
    }), p.extend({
        clone: function(a, b, c) {
            var d, e, f, g;
            p.support.html5Clone || p.isXMLDoc(a) || !bu.test("<" + a.nodeName + ">") ? g = a.cloneNode(!0) : (bB.innerHTML = a.outerHTML, bB.removeChild(g = bB.firstChild));
            if ((!p.support.noCloneEvent || !p.support.noCloneChecked) && (a.nodeType === 1 || a.nodeType === 11) && !p.isXMLDoc(a)) {
                bE(a, g), d = bF(a), e = bF(g);
                for (f = 0; d[f]; ++f) e[f] && bE(d[f], e[f]);
            }
            if (b) {
                bD(a, g);
                if (c) {
                    d = bF(a), e = bF(g);
                    for (f = 0; d[f]; ++f) bD(d[f], e[f]);
                }
            }
            return d = e = null, g;
        },
        clean: function(a, b, c, d) {
            var f, g, h, i, j, k, l, m, n, o, q, r, s = b === e && bA, t = [];
            if (!b || typeof b.createDocumentFragment == "undefined") b = e;
            for (f = 0; (h = a[f]) != null; f++) {
                typeof h == "number" && (h += "");
                if (!h) continue;
                if (typeof h == "string") if (!br.test(h)) h = b.createTextNode(h); else {
                    s = s || bk(b), l = b.createElement("div"), s.appendChild(l), h = h.replace(bo, "<$1></$2>"), i = (bp.exec(h) || [ "", "" ])[1].toLowerCase(), j = bz[i] || bz._default, k = j[0], l.innerHTML = j[1] + h + j[2];
                    while (k--) l = l.lastChild;
                    if (!p.support.tbody) {
                        m = bq.test(h), n = i === "table" && !m ? l.firstChild && l.firstChild.childNodes : j[1] === "<table>" && !m ? l.childNodes : [];
                        for (g = n.length - 1; g >= 0; --g) p.nodeName(n[g], "tbody") && !n[g].childNodes.length && n[g].parentNode.removeChild(n[g]);
                    }
                    !p.support.leadingWhitespace && bn.test(h) && l.insertBefore(b.createTextNode(bn.exec(h)[0]), l.firstChild), h = l.childNodes, l.parentNode.removeChild(l);
                }
                h.nodeType ? t.push(h) : p.merge(t, h);
            }
            l && (h = l = s = null);
            if (!p.support.appendChecked) for (f = 0; (h = t[f]) != null; f++) p.nodeName(h, "input") ? bG(h) : typeof h.getElementsByTagName != "undefined" && p.grep(h.getElementsByTagName("input"), bG);
            if (c) {
                q = function(a) {
                    if (!a.type || bx.test(a.type)) return d ? d.push(a.parentNode ? a.parentNode.removeChild(a) : a) : c.appendChild(a);
                };
                for (f = 0; (h = t[f]) != null; f++) if (!p.nodeName(h, "script") || !q(h)) c.appendChild(h), typeof h.getElementsByTagName != "undefined" && (r = p.grep(p.merge([], h.getElementsByTagName("script")), q), t.splice.apply(t, [ f + 1, 0 ].concat(r)), f += r.length);
            }
            return t;
        },
        cleanData: function(a, b) {
            var c, d, e, f, g = 0, h = p.expando, i = p.cache, j = p.support.deleteExpando, k = p.event.special;
            for (; (e = a[g]) != null; g++) if (b || p.acceptData(e)) {
                d = e[h], c = d && i[d];
                if (c) {
                    if (c.events) for (f in c.events) k[f] ? p.event.remove(e, f) : p.removeEvent(e, f, c.handle);
                    i[d] && (delete i[d], j ? delete e[h] : e.removeAttribute ? e.removeAttribute(h) : e[h] = null, p.deletedIds.push(d));
                }
            }
        }
    }), function() {
        var a, b;
        p.uaMatch = function(a) {
            a = a.toLowerCase();
            var b = /(chrome)[ \/]([\w.]+)/.exec(a) || /(webkit)[ \/]([\w.]+)/.exec(a) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(a) || /(msie) ([\w.]+)/.exec(a) || a.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(a) || [];
            return {
                browser: b[1] || "",
                version: b[2] || "0"
            };
        }, a = p.uaMatch(g.userAgent), b = {}, a.browser && (b[a.browser] = !0, b.version = a.version), b.chrome ? b.webkit = !0 : b.webkit && (b.safari = !0), p.browser = b, p.sub = function() {
            function a(b, c) {
                return new a.fn.init(b, c);
            }
            p.extend(!0, a, this), a.superclass = this, a.fn = a.prototype = this(), a.fn.constructor = a, a.sub = this.sub, a.fn.init = function c(c, d) {
                return d && d instanceof p && !(d instanceof a) && (d = a(d)), p.fn.init.call(this, c, d, b);
            }, a.fn.init.prototype = a.fn;
            var b = a(e);
            return a;
        };
    }();
    var bH, bI, bJ, bK = /alpha\([^)]*\)/i, bL = /opacity=([^)]*)/, bM = /^(top|right|bottom|left)$/, bN = /^(none|table(?!-c[ea]).+)/, bO = /^margin/, bP = new RegExp("^(" + q + ")(.*)$", "i"), bQ = new RegExp("^(" + q + ")(?!px)[a-z%]+$", "i"), bR = new RegExp("^([-+])=(" + q + ")", "i"), bS = {}, bT = {
        position: "absolute",
        visibility: "hidden",
        display: "block"
    }, bU = {
        letterSpacing: 0,
        fontWeight: 400
    }, bV = [ "Top", "Right", "Bottom", "Left" ], bW = [ "Webkit", "O", "Moz", "ms" ], bX = p.fn.toggle;
    p.fn.extend({
        css: function(a, c) {
            return p.access(this, function(a, c, d) {
                return d !== b ? p.style(a, c, d) : p.css(a, c);
            }, a, c, arguments.length > 1);
        },
        show: function() {
            return b$(this, !0);
        },
        hide: function() {
            return b$(this);
        },
        toggle: function(a, b) {
            var c = typeof a == "boolean";
            return p.isFunction(a) && p.isFunction(b) ? bX.apply(this, arguments) : this.each(function() {
                (c ? a : bZ(this)) ? p(this).show() : p(this).hide();
            });
        }
    }), p.extend({
        cssHooks: {
            opacity: {
                get: function(a, b) {
                    if (b) {
                        var c = bH(a, "opacity");
                        return c === "" ? "1" : c;
                    }
                }
            }
        },
        cssNumber: {
            fillOpacity: !0,
            fontWeight: !0,
            lineHeight: !0,
            opacity: !0,
            orphans: !0,
            widows: !0,
            zIndex: !0,
            zoom: !0
        },
        cssProps: {
            "float": p.support.cssFloat ? "cssFloat" : "styleFloat"
        },
        style: function(a, c, d, e) {
            if (!a || a.nodeType === 3 || a.nodeType === 8 || !a.style) return;
            var f, g, h, i = p.camelCase(c), j = a.style;
            c = p.cssProps[i] || (p.cssProps[i] = bY(j, i)), h = p.cssHooks[c] || p.cssHooks[i];
            if (d === b) return h && "get" in h && (f = h.get(a, !1, e)) !== b ? f : j[c];
            g = typeof d, g === "string" && (f = bR.exec(d)) && (d = (f[1] + 1) * f[2] + parseFloat(p.css(a, c)), g = "number");
            if (d == null || g === "number" && isNaN(d)) return;
            g === "number" && !p.cssNumber[i] && (d += "px");
            if (!h || !("set" in h) || (d = h.set(a, d, e)) !== b) try {
                j[c] = d;
            } catch (k) {}
        },
        css: function(a, c, d, e) {
            var f, g, h, i = p.camelCase(c);
            return c = p.cssProps[i] || (p.cssProps[i] = bY(a.style, i)), h = p.cssHooks[c] || p.cssHooks[i], h && "get" in h && (f = h.get(a, !0, e)), f === b && (f = bH(a, c)), f === "normal" && c in bU && (f = bU[c]), d || e !== b ? (g = parseFloat(f), d || p.isNumeric(g) ? g || 0 : f) : f;
        },
        swap: function(a, b, c) {
            var d, e, f = {};
            for (e in b) f[e] = a.style[e], a.style[e] = b[e];
            d = c.call(a);
            for (e in b) a.style[e] = f[e];
            return d;
        }
    }), a.getComputedStyle ? bH = function(b, c) {
        var d, e, f, g, h = a.getComputedStyle(b, null), i = b.style;
        return h && (d = h[c], d === "" && !p.contains(b.ownerDocument, b) && (d = p.style(b, c)), bQ.test(d) && bO.test(c) && (e = i.width, f = i.minWidth, g = i.maxWidth, i.minWidth = i.maxWidth = i.width = d, d = h.width, i.width = e, i.minWidth = f, i.maxWidth = g)), d;
    } : e.documentElement.currentStyle && (bH = function(a, b) {
        var c, d, e = a.currentStyle && a.currentStyle[b], f = a.style;
        return e == null && f && f[b] && (e = f[b]), bQ.test(e) && !bM.test(b) && (c = f.left, d = a.runtimeStyle && a.runtimeStyle.left, d && (a.runtimeStyle.left = a.currentStyle.left), f.left = b === "fontSize" ? "1em" : e, e = f.pixelLeft + "px", f.left = c, d && (a.runtimeStyle.left = d)), e === "" ? "auto" : e;
    }), p.each([ "height", "width" ], function(a, b) {
        p.cssHooks[b] = {
            get: function(a, c, d) {
                if (c) return a.offsetWidth === 0 && bN.test(bH(a, "display")) ? p.swap(a, bT, function() {
                    return cb(a, b, d);
                }) : cb(a, b, d);
            },
            set: function(a, c, d) {
                return b_(a, c, d ? ca(a, b, d, p.support.boxSizing && p.css(a, "boxSizing") === "border-box") : 0);
            }
        };
    }), p.support.opacity || (p.cssHooks.opacity = {
        get: function(a, b) {
            return bL.test((b && a.currentStyle ? a.currentStyle.filter : a.style.filter) || "") ? .01 * parseFloat(RegExp.$1) + "" : b ? "1" : "";
        },
        set: function(a, b) {
            var c = a.style, d = a.currentStyle, e = p.isNumeric(b) ? "alpha(opacity=" + b * 100 + ")" : "", f = d && d.filter || c.filter || "";
            c.zoom = 1;
            if (b >= 1 && p.trim(f.replace(bK, "")) === "" && c.removeAttribute) {
                c.removeAttribute("filter");
                if (d && !d.filter) return;
            }
            c.filter = bK.test(f) ? f.replace(bK, e) : f + " " + e;
        }
    }), p(function() {
        p.support.reliableMarginRight || (p.cssHooks.marginRight = {
            get: function(a, b) {
                return p.swap(a, {
                    display: "inline-block"
                }, function() {
                    if (b) return bH(a, "marginRight");
                });
            }
        }), !p.support.pixelPosition && p.fn.position && p.each([ "top", "left" ], function(a, b) {
            p.cssHooks[b] = {
                get: function(a, c) {
                    if (c) {
                        var d = bH(a, b);
                        return bQ.test(d) ? p(a).position()[b] + "px" : d;
                    }
                }
            };
        });
    }), p.expr && p.expr.filters && (p.expr.filters.hidden = function(a) {
        return a.offsetWidth === 0 && a.offsetHeight === 0 || !p.support.reliableHiddenOffsets && (a.style && a.style.display || bH(a, "display")) === "none";
    }, p.expr.filters.visible = function(a) {
        return !p.expr.filters.hidden(a);
    }), p.each({
        margin: "",
        padding: "",
        border: "Width"
    }, function(a, b) {
        p.cssHooks[a + b] = {
            expand: function(c) {
                var d, e = typeof c == "string" ? c.split(" ") : [ c ], f = {};
                for (d = 0; d < 4; d++) f[a + bV[d] + b] = e[d] || e[d - 2] || e[0];
                return f;
            }
        }, bO.test(a) || (p.cssHooks[a + b].set = b_);
    });
    var cd = /%20/g, ce = /\[\]$/, cf = /\r?\n/g, cg = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i, ch = /^(?:select|textarea)/i;
    p.fn.extend({
        serialize: function() {
            return p.param(this.serializeArray());
        },
        serializeArray: function() {
            return this.map(function() {
                return this.elements ? p.makeArray(this.elements) : this;
            }).filter(function() {
                return this.name && !this.disabled && (this.checked || ch.test(this.nodeName) || cg.test(this.type));
            }).map(function(a, b) {
                var c = p(this).val();
                return c == null ? null : p.isArray(c) ? p.map(c, function(a, c) {
                    return {
                        name: b.name,
                        value: a.replace(cf, "\r\n")
                    };
                }) : {
                    name: b.name,
                    value: c.replace(cf, "\r\n")
                };
            }).get();
        }
    }), p.param = function(a, c) {
        var d, e = [], f = function(a, b) {
            b = p.isFunction(b) ? b() : b == null ? "" : b, e[e.length] = encodeURIComponent(a) + "=" + encodeURIComponent(b);
        };
        c === b && (c = p.ajaxSettings && p.ajaxSettings.traditional);
        if (p.isArray(a) || a.jquery && !p.isPlainObject(a)) p.each(a, function() {
            f(this.name, this.value);
        }); else for (d in a) ci(d, a[d], c, f);
        return e.join("&").replace(cd, "+");
    };
    var cj, ck, cl = /#.*$/, cm = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, cn = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/, co = /^(?:GET|HEAD)$/, cp = /^\/\//, cq = /\?/, cr = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, cs = /([?&])_=[^&]*/, ct = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/, cu = p.fn.load, cv = {}, cw = {}, cx = [ "*/" ] + [ "*" ];
    try {
        ck = f.href;
    } catch (cy) {
        ck = e.createElement("a"), ck.href = "", ck = ck.href;
    }
    cj = ct.exec(ck.toLowerCase()) || [], p.fn.load = function(a, c, d) {
        if (typeof a != "string" && cu) return cu.apply(this, arguments);
        if (!this.length) return this;
        var e, f, g, h = this, i = a.indexOf(" ");
        return i >= 0 && (e = a.slice(i, a.length), a = a.slice(0, i)), p.isFunction(c) ? (d = c, c = b) : c && typeof c == "object" && (f = "POST"), p.ajax({
            url: a,
            type: f,
            dataType: "html",
            data: c,
            complete: function(a, b) {
                d && h.each(d, g || [ a.responseText, b, a ]);
            }
        }).done(function(a) {
            g = arguments, h.html(e ? p("<div>").append(a.replace(cr, "")).find(e) : a);
        }), this;
    }, p.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function(a, b) {
        p.fn[b] = function(a) {
            return this.on(b, a);
        };
    }), p.each([ "get", "post" ], function(a, c) {
        p[c] = function(a, d, e, f) {
            return p.isFunction(d) && (f = f || e, e = d, d = b), p.ajax({
                type: c,
                url: a,
                data: d,
                success: e,
                dataType: f
            });
        };
    }), p.extend({
        getScript: function(a, c) {
            return p.get(a, b, c, "script");
        },
        getJSON: function(a, b, c) {
            return p.get(a, b, c, "json");
        },
        ajaxSetup: function(a, b) {
            return b ? cB(a, p.ajaxSettings) : (b = a, a = p.ajaxSettings), cB(a, b), a;
        },
        ajaxSettings: {
            url: ck,
            isLocal: cn.test(cj[1]),
            global: !0,
            type: "GET",
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            processData: !0,
            async: !0,
            accepts: {
                xml: "application/xml, text/xml",
                html: "text/html",
                text: "text/plain",
                json: "application/json, text/javascript",
                "*": cx
            },
            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },
            responseFields: {
                xml: "responseXML",
                text: "responseText"
            },
            converters: {
                "* text": a.String,
                "text html": !0,
                "text json": p.parseJSON,
                "text xml": p.parseXML
            },
            flatOptions: {
                context: !0,
                url: !0
            }
        },
        ajaxPrefilter: cz(cv),
        ajaxTransport: cz(cw),
        ajax: function(a, c) {
            function y(a, c, f, i) {
                var k, s, t, u, w, y = c;
                if (v === 2) return;
                v = 2, h && clearTimeout(h), g = b, e = i || "", x.readyState = a > 0 ? 4 : 0, f && (u = cC(l, x, f));
                if (a >= 200 && a < 300 || a === 304) l.ifModified && (w = x.getResponseHeader("Last-Modified"), w && (p.lastModified[d] = w), w = x.getResponseHeader("Etag"), w && (p.etag[d] = w)), a === 304 ? (y = "notmodified", k = !0) : (k = cD(l, u), y = k.state, s = k.data, t = k.error, k = !t); else {
                    t = y;
                    if (!y || a) y = "error", a < 0 && (a = 0);
                }
                x.status = a, x.statusText = (c || y) + "", k ? o.resolveWith(m, [ s, y, x ]) : o.rejectWith(m, [ x, y, t ]), x.statusCode(r), r = b, j && n.trigger("ajax" + (k ? "Success" : "Error"), [ x, l, k ? s : t ]), q.fireWith(m, [ x, y ]), j && (n.trigger("ajaxComplete", [ x, l ]), --p.active || p.event.trigger("ajaxStop"));
            }
            typeof a == "object" && (c = a, a = b), c = c || {};
            var d, e, f, g, h, i, j, k, l = p.ajaxSetup({}, c), m = l.context || l, n = m !== l && (m.nodeType || m instanceof p) ? p(m) : p.event, o = p.Deferred(), q = p.Callbacks("once memory"), r = l.statusCode || {}, t = {}, u = {}, v = 0, w = "canceled", x = {
                readyState: 0,
                setRequestHeader: function(a, b) {
                    if (!v) {
                        var c = a.toLowerCase();
                        a = u[c] = u[c] || a, t[a] = b;
                    }
                    return this;
                },
                getAllResponseHeaders: function() {
                    return v === 2 ? e : null;
                },
                getResponseHeader: function(a) {
                    var c;
                    if (v === 2) {
                        if (!f) {
                            f = {};
                            while (c = cm.exec(e)) f[c[1].toLowerCase()] = c[2];
                        }
                        c = f[a.toLowerCase()];
                    }
                    return c === b ? null : c;
                },
                overrideMimeType: function(a) {
                    return v || (l.mimeType = a), this;
                },
                abort: function(a) {
                    return a = a || w, g && g.abort(a), y(0, a), this;
                }
            };
            o.promise(x), x.success = x.done, x.error = x.fail, x.complete = q.add, x.statusCode = function(a) {
                if (a) {
                    var b;
                    if (v < 2) for (b in a) r[b] = [ r[b], a[b] ]; else b = a[x.status], x.always(b);
                }
                return this;
            }, l.url = ((a || l.url) + "").replace(cl, "").replace(cp, cj[1] + "//"), l.dataTypes = p.trim(l.dataType || "*").toLowerCase().split(s), l.crossDomain == null && (i = ct.exec(l.url.toLowerCase()) || !1, l.crossDomain = i && i.join(":") + (i[3] ? "" : i[1] === "http:" ? 80 : 443) !== cj.join(":") + (cj[3] ? "" : cj[1] === "http:" ? 80 : 443)), l.data && l.processData && typeof l.data != "string" && (l.data = p.param(l.data, l.traditional)), cA(cv, l, c, x);
            if (v === 2) return x;
            j = l.global, l.type = l.type.toUpperCase(), l.hasContent = !co.test(l.type), j && p.active++ === 0 && p.event.trigger("ajaxStart");
            if (!l.hasContent) {
                l.data && (l.url += (cq.test(l.url) ? "&" : "?") + l.data, delete l.data), d = l.url;
                if (l.cache === !1) {
                    var z = p.now(), A = l.url.replace(cs, "$1_=" + z);
                    l.url = A + (A === l.url ? (cq.test(l.url) ? "&" : "?") + "_=" + z : "");
                }
            }
            (l.data && l.hasContent && l.contentType !== !1 || c.contentType) && x.setRequestHeader("Content-Type", l.contentType), l.ifModified && (d = d || l.url, p.lastModified[d] && x.setRequestHeader("If-Modified-Since", p.lastModified[d]), p.etag[d] && x.setRequestHeader("If-None-Match", p.etag[d])), x.setRequestHeader("Accept", l.dataTypes[0] && l.accepts[l.dataTypes[0]] ? l.accepts[l.dataTypes[0]] + (l.dataTypes[0] !== "*" ? ", " + cx + "; q=0.01" : "") : l.accepts["*"]);
            for (k in l.headers) x.setRequestHeader(k, l.headers[k]);
            if (!l.beforeSend || l.beforeSend.call(m, x, l) !== !1 && v !== 2) {
                w = "abort";
                for (k in {
                    success: 1,
                    error: 1,
                    complete: 1
                }) x[k](l[k]);
                g = cA(cw, l, c, x);
                if (!g) y(-1, "No Transport"); else {
                    x.readyState = 1, j && n.trigger("ajaxSend", [ x, l ]), l.async && l.timeout > 0 && (h = setTimeout(function() {
                        x.abort("timeout");
                    }, l.timeout));
                    try {
                        v = 1, g.send(t, y);
                    } catch (B) {
                        if (v < 2) y(-1, B); else throw B;
                    }
                }
                return x;
            }
            return x.abort();
        },
        active: 0,
        lastModified: {},
        etag: {}
    });
    var cE = [], cF = /\?/, cG = /(=)\?(?=&|$)|\?\?/, cH = p.now();
    p.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function() {
            var a = cE.pop() || p.expando + "_" + cH++;
            return this[a] = !0, a;
        }
    }), p.ajaxPrefilter("json jsonp", function(c, d, e) {
        var f, g, h, i = c.data, j = c.url, k = c.jsonp !== !1, l = k && cG.test(j), m = k && !l && typeof i == "string" && !(c.contentType || "").indexOf("application/x-www-form-urlencoded") && cG.test(i);
        if (c.dataTypes[0] === "jsonp" || l || m) return f = c.jsonpCallback = p.isFunction(c.jsonpCallback) ? c.jsonpCallback() : c.jsonpCallback, g = a[f], l ? c.url = j.replace(cG, "$1" + f) : m ? c.data = i.replace(cG, "$1" + f) : k && (c.url += (cF.test(j) ? "&" : "?") + c.jsonp + "=" + f), c.converters["script json"] = function() {
            return h || p.error(f + " was not called"), h[0];
        }, c.dataTypes[0] = "json", a[f] = function() {
            h = arguments;
        }, e.always(function() {
            a[f] = g, c[f] && (c.jsonpCallback = d.jsonpCallback, cE.push(f)), h && p.isFunction(g) && g(h[0]), h = g = b;
        }), "script";
    }), p.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /javascript|ecmascript/
        },
        converters: {
            "text script": function(a) {
                return p.globalEval(a), a;
            }
        }
    }), p.ajaxPrefilter("script", function(a) {
        a.cache === b && (a.cache = !1), a.crossDomain && (a.type = "GET", a.global = !1);
    }), p.ajaxTransport("script", function(a) {
        if (a.crossDomain) {
            var c, d = e.head || e.getElementsByTagName("head")[0] || e.documentElement;
            return {
                send: function(f, g) {
                    c = e.createElement("script"), c.async = "async", a.scriptCharset && (c.charset = a.scriptCharset), c.src = a.url, c.onload = c.onreadystatechange = function(a, e) {
                        if (e || !c.readyState || /loaded|complete/.test(c.readyState)) c.onload = c.onreadystatechange = null, d && c.parentNode && d.removeChild(c), c = b, e || g(200, "success");
                    }, d.insertBefore(c, d.firstChild);
                },
                abort: function() {
                    c && c.onload(0, 1);
                }
            };
        }
    });
    var cI, cJ = a.ActiveXObject ? function() {
        for (var a in cI) cI[a](0, 1);
    } : !1, cK = 0;
    p.ajaxSettings.xhr = a.ActiveXObject ? function() {
        return !this.isLocal && cL() || cM();
    } : cL, function(a) {
        p.extend(p.support, {
            ajax: !!a,
            cors: !!a && "withCredentials" in a
        });
    }(p.ajaxSettings.xhr()), p.support.ajax && p.ajaxTransport(function(c) {
        if (!c.crossDomain || p.support.cors) {
            var d;
            return {
                send: function(e, f) {
                    var g, h, i = c.xhr();
                    c.username ? i.open(c.type, c.url, c.async, c.username, c.password) : i.open(c.type, c.url, c.async);
                    if (c.xhrFields) for (h in c.xhrFields) i[h] = c.xhrFields[h];
                    c.mimeType && i.overrideMimeType && i.overrideMimeType(c.mimeType), !c.crossDomain && !e["X-Requested-With"] && (e["X-Requested-With"] = "XMLHttpRequest");
                    try {
                        for (h in e) i.setRequestHeader(h, e[h]);
                    } catch (j) {}
                    i.send(c.hasContent && c.data || null), d = function(a, e) {
                        var h, j, k, l, m;
                        try {
                            if (d && (e || i.readyState === 4)) {
                                d = b, g && (i.onreadystatechange = p.noop, cJ && delete cI[g]);
                                if (e) i.readyState !== 4 && i.abort(); else {
                                    h = i.status, k = i.getAllResponseHeaders(), l = {}, m = i.responseXML, m && m.documentElement && (l.xml = m);
                                    try {
                                        l.text = i.responseText;
                                    } catch (a) {}
                                    try {
                                        j = i.statusText;
                                    } catch (n) {
                                        j = "";
                                    }
                                    !h && c.isLocal && !c.crossDomain ? h = l.text ? 200 : 404 : h === 1223 && (h = 204);
                                }
                            }
                        } catch (o) {
                            e || f(-1, o);
                        }
                        l && f(h, j, l, k);
                    }, c.async ? i.readyState === 4 ? setTimeout(d, 0) : (g = ++cK, cJ && (cI || (cI = {}, p(a).unload(cJ)), cI[g] = d), i.onreadystatechange = d) : d();
                },
                abort: function() {
                    d && d(0, 1);
                }
            };
        }
    });
    var cN, cO, cP = /^(?:toggle|show|hide)$/, cQ = new RegExp("^(?:([-+])=|)(" + q + ")([a-z%]*)$", "i"), cR = /queueHooks$/, cS = [ cY ], cT = {
        "*": [ function(a, b) {
            var c, d, e = this.createTween(a, b), f = cQ.exec(b), g = e.cur(), h = +g || 0, i = 1, j = 20;
            if (f) {
                c = +f[2], d = f[3] || (p.cssNumber[a] ? "" : "px");
                if (d !== "px" && h) {
                    h = p.css(e.elem, a, !0) || c || 1;
                    do i = i || ".5", h = h / i, p.style(e.elem, a, h + d); while (i !== (i = e.cur() / g) && i !== 1 && --j);
                }
                e.unit = d, e.start = h, e.end = f[1] ? h + (f[1] + 1) * c : c;
            }
            return e;
        } ]
    };
    p.Animation = p.extend(cW, {
        tweener: function(a, b) {
            p.isFunction(a) ? (b = a, a = [ "*" ]) : a = a.split(" ");
            var c, d = 0, e = a.length;
            for (; d < e; d++) c = a[d], cT[c] = cT[c] || [], cT[c].unshift(b);
        },
        prefilter: function(a, b) {
            b ? cS.unshift(a) : cS.push(a);
        }
    }), p.Tween = cZ, cZ.prototype = {
        constructor: cZ,
        init: function(a, b, c, d, e, f) {
            this.elem = a, this.prop = c, this.easing = e || "swing", this.options = b, this.start = this.now = this.cur(), this.end = d, this.unit = f || (p.cssNumber[c] ? "" : "px");
        },
        cur: function() {
            var a = cZ.propHooks[this.prop];
            return a && a.get ? a.get(this) : cZ.propHooks._default.get(this);
        },
        run: function(a) {
            var b, c = cZ.propHooks[this.prop];
            return this.options.duration ? this.pos = b = p.easing[this.easing](a, this.options.duration * a, 0, 1, this.options.duration) : this.pos = b = a, this.now = (this.end - this.start) * b + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), c && c.set ? c.set(this) : cZ.propHooks._default.set(this), this;
        }
    }, cZ.prototype.init.prototype = cZ.prototype, cZ.propHooks = {
        _default: {
            get: function(a) {
                var b;
                return a.elem[a.prop] == null || !!a.elem.style && a.elem.style[a.prop] != null ? (b = p.css(a.elem, a.prop, !1, ""), !b || b === "auto" ? 0 : b) : a.elem[a.prop];
            },
            set: function(a) {
                p.fx.step[a.prop] ? p.fx.step[a.prop](a) : a.elem.style && (a.elem.style[p.cssProps[a.prop]] != null || p.cssHooks[a.prop]) ? p.style(a.elem, a.prop, a.now + a.unit) : a.elem[a.prop] = a.now;
            }
        }
    }, cZ.propHooks.scrollTop = cZ.propHooks.scrollLeft = {
        set: function(a) {
            a.elem.nodeType && a.elem.parentNode && (a.elem[a.prop] = a.now);
        }
    }, p.each([ "toggle", "show", "hide" ], function(a, b) {
        var c = p.fn[b];
        p.fn[b] = function(d, e, f) {
            return d == null || typeof d == "boolean" || !a && p.isFunction(d) && p.isFunction(e) ? c.apply(this, arguments) : this.animate(c$(b, !0), d, e, f);
        };
    }), p.fn.extend({
        fadeTo: function(a, b, c, d) {
            return this.filter(bZ).css("opacity", 0).show().end().animate({
                opacity: b
            }, a, c, d);
        },
        animate: function(a, b, c, d) {
            var e = p.isEmptyObject(a), f = p.speed(b, c, d), g = function() {
                var b = cW(this, p.extend({}, a), f);
                e && b.stop(!0);
            };
            return e || f.queue === !1 ? this.each(g) : this.queue(f.queue, g);
        },
        stop: function(a, c, d) {
            var e = function(a) {
                var b = a.stop;
                delete a.stop, b(d);
            };
            return typeof a != "string" && (d = c, c = a, a = b), c && a !== !1 && this.queue(a || "fx", []), this.each(function() {
                var b = !0, c = a != null && a + "queueHooks", f = p.timers, g = p._data(this);
                if (c) g[c] && g[c].stop && e(g[c]); else for (c in g) g[c] && g[c].stop && cR.test(c) && e(g[c]);
                for (c = f.length; c--; ) f[c].elem === this && (a == null || f[c].queue === a) && (f[c].anim.stop(d), b = !1, f.splice(c, 1));
                (b || !d) && p.dequeue(this, a);
            });
        }
    }), p.each({
        slideDown: c$("show"),
        slideUp: c$("hide"),
        slideToggle: c$("toggle"),
        fadeIn: {
            opacity: "show"
        },
        fadeOut: {
            opacity: "hide"
        },
        fadeToggle: {
            opacity: "toggle"
        }
    }, function(a, b) {
        p.fn[a] = function(a, c, d) {
            return this.animate(b, a, c, d);
        };
    }), p.speed = function(a, b, c) {
        var d = a && typeof a == "object" ? p.extend({}, a) : {
            complete: c || !c && b || p.isFunction(a) && a,
            duration: a,
            easing: c && b || b && !p.isFunction(b) && b
        };
        d.duration = p.fx.off ? 0 : typeof d.duration == "number" ? d.duration : d.duration in p.fx.speeds ? p.fx.speeds[d.duration] : p.fx.speeds._default;
        if (d.queue == null || d.queue === !0) d.queue = "fx";
        return d.old = d.complete, d.complete = function() {
            p.isFunction(d.old) && d.old.call(this), d.queue && p.dequeue(this, d.queue);
        }, d;
    }, p.easing = {
        linear: function(a) {
            return a;
        },
        swing: function(a) {
            return .5 - Math.cos(a * Math.PI) / 2;
        }
    }, p.timers = [], p.fx = cZ.prototype.init, p.fx.tick = function() {
        var a, b = p.timers, c = 0;
        for (; c < b.length; c++) a = b[c], !a() && b[c] === a && b.splice(c--, 1);
        b.length || p.fx.stop();
    }, p.fx.timer = function(a) {
        a() && p.timers.push(a) && !cO && (cO = setInterval(p.fx.tick, p.fx.interval));
    }, p.fx.interval = 13, p.fx.stop = function() {
        clearInterval(cO), cO = null;
    }, p.fx.speeds = {
        slow: 600,
        fast: 200,
        _default: 400
    }, p.fx.step = {}, p.expr && p.expr.filters && (p.expr.filters.animated = function(a) {
        return p.grep(p.timers, function(b) {
            return a === b.elem;
        }).length;
    });
    var c_ = /^(?:body|html)$/i;
    p.fn.offset = function(a) {
        if (arguments.length) return a === b ? this : this.each(function(b) {
            p.offset.setOffset(this, a, b);
        });
        var c, d, e, f, g, h, i, j = {
            top: 0,
            left: 0
        }, k = this[0], l = k && k.ownerDocument;
        if (!l) return;
        return (d = l.body) === k ? p.offset.bodyOffset(k) : (c = l.documentElement, p.contains(c, k) ? (typeof k.getBoundingClientRect != "undefined" && (j = k.getBoundingClientRect()), e = da(l), f = c.clientTop || d.clientTop || 0, g = c.clientLeft || d.clientLeft || 0, h = e.pageYOffset || c.scrollTop, i = e.pageXOffset || c.scrollLeft, {
            top: j.top + h - f,
            left: j.left + i - g
        }) : j);
    }, p.offset = {
        bodyOffset: function(a) {
            var b = a.offsetTop, c = a.offsetLeft;
            return p.support.doesNotIncludeMarginInBodyOffset && (b += parseFloat(p.css(a, "marginTop")) || 0, c += parseFloat(p.css(a, "marginLeft")) || 0), {
                top: b,
                left: c
            };
        },
        setOffset: function(a, b, c) {
            var d = p.css(a, "position");
            d === "static" && (a.style.position = "relative");
            var e = p(a), f = e.offset(), g = p.css(a, "top"), h = p.css(a, "left"), i = (d === "absolute" || d === "fixed") && p.inArray("auto", [ g, h ]) > -1, j = {}, k = {}, l, m;
            i ? (k = e.position(), l = k.top, m = k.left) : (l = parseFloat(g) || 0, m = parseFloat(h) || 0), p.isFunction(b) && (b = b.call(a, c, f)), b.top != null && (j.top = b.top - f.top + l), b.left != null && (j.left = b.left - f.left + m), "using" in b ? b.using.call(a, j) : e.css(j);
        }
    }, p.fn.extend({
        position: function() {
            if (!this[0]) return;
            var a = this[0], b = this.offsetParent(), c = this.offset(), d = c_.test(b[0].nodeName) ? {
                top: 0,
                left: 0
            } : b.offset();
            return c.top -= parseFloat(p.css(a, "marginTop")) || 0, c.left -= parseFloat(p.css(a, "marginLeft")) || 0, d.top += parseFloat(p.css(b[0], "borderTopWidth")) || 0, d.left += parseFloat(p.css(b[0], "borderLeftWidth")) || 0, {
                top: c.top - d.top,
                left: c.left - d.left
            };
        },
        offsetParent: function() {
            return this.map(function() {
                var a = this.offsetParent || e.body;
                while (a && !c_.test(a.nodeName) && p.css(a, "position") === "static") a = a.offsetParent;
                return a || e.body;
            });
        }
    }), p.each({
        scrollLeft: "pageXOffset",
        scrollTop: "pageYOffset"
    }, function(a, c) {
        var d = /Y/.test(c);
        p.fn[a] = function(e) {
            return p.access(this, function(a, e, f) {
                var g = da(a);
                if (f === b) return g ? c in g ? g[c] : g.document.documentElement[e] : a[e];
                g ? g.scrollTo(d ? p(g).scrollLeft() : f, d ? f : p(g).scrollTop()) : a[e] = f;
            }, a, e, arguments.length, null);
        };
    }), p.each({
        Height: "height",
        Width: "width"
    }, function(a, c) {
        p.each({
            padding: "inner" + a,
            content: c,
            "": "outer" + a
        }, function(d, e) {
            p.fn[e] = function(e, f) {
                var g = arguments.length && (d || typeof e != "boolean"), h = d || (e === !0 || f === !0 ? "margin" : "border");
                return p.access(this, function(c, d, e) {
                    var f;
                    return p.isWindow(c) ? c.document.documentElement["client" + a] : c.nodeType === 9 ? (f = c.documentElement, Math.max(c.body["scroll" + a], f["scroll" + a], c.body["offset" + a], f["offset" + a], f["client" + a])) : e === b ? p.css(c, d, e, h) : p.style(c, d, e, h);
                }, c, g ? e : b, g, null);
            };
        });
    }), a.jQuery = a.$ = p, typeof define == "function" && define.amd && define.amd.jQuery && define("jquery", [], function() {
        return p;
    });
})(window);
(function($, e, b) {
    var c = "hashchange", h = document, f, g = $.event.special, i = h.documentMode, d = "on" + c in e && (i === b || i > 7);
    function a(j) {
        j = j || location.href;
        return "#" + j.replace(/^[^#]*#?(.*)$/, "$1");
    }
    $.fn[c] = function(j) {
        return j ? this.bind(c, j) : this.trigger(c);
    };
    $.fn[c].delay = 50;
    g[c] = $.extend(g[c], {
        setup: function() {
            if (d) {
                return false;
            }
            $(f.start);
        },
        teardown: function() {
            if (d) {
                return false;
            }
            $(f.stop);
        }
    });
    f = function() {
        var j = {}, p, m = a(), k = function(q) {
            return q;
        }, l = k, o = k;
        j.start = function() {
            p || n();
        };
        j.stop = function() {
            p && clearTimeout(p);
            p = b;
        };
        function n() {
            var r = a(), q = o(m);
            if (r !== m) {
                l(m = r, q);
                $(e).trigger(c);
            } else {
                if (q !== m) {
                    location.href = location.href.replace(/#.*/, "") + q;
                }
            }
            p = setTimeout(n, $.fn[c].delay);
        }
        $.browser.msie && !d && function() {
            var q, r;
            j.start = function() {
                if (!q) {
                    r = $.fn[c].src;
                    r = r && r + a();
                    q = $('<iframe tabindex="-1" title="empty"/>').hide().one("load", function() {
                        r || l(a());
                        n();
                    }).attr("src", r || "javascript:0").insertAfter("body")[0].contentWindow;
                    h.onpropertychange = function() {
                        try {
                            if (event.propertyName === "title") {
                                q.document.title = h.title;
                            }
                        } catch (s) {}
                    };
                }
            };
            j.stop = k;
            o = function() {
                return a(q.location.href);
            };
            l = function(v, s) {
                var u = q.document, t = $.fn[c].domain;
                if (v !== s) {
                    u.title = h.title;
                    u.open();
                    t && u.write('<script>document.domain="' + t + '"</script>');
                    u.close();
                    q.location.hash = v;
                }
            };
        }();
        return j;
    }();
})(jQuery, this);
exports.jQuery = jQuery.noConflict();

});require.memoize("lib/clock/countdown",[ "../../vendor/jquery", "../ui/blinker", "./flipclock", "./layout/countdown" ],
function(require, exports, module) {
var $ = require("../../vendor/jquery").jQuery, blinker = require("../ui/blinker"), flipclock = require("./flipclock"), layout = require("./layout/countdown"), countdown_blink;
exports.init = function() {
    $(document).on({
        countdown_minute_up: function() {
            var value = parseInt($("#countdown_min").html(), 10);
            if (value < 99) $("#countdown_min").html(value + 1);
        },
        countdown_minute_down: function() {
            var value = parseInt($("#countdown_min").html(), 10);
            if (value > 0) $("#countdown_min").html(value - 1);
        },
        countdown_hour_up: function() {
            var value = parseInt($("#countdown_hour").html(), 10);
            if (value < 99) $("#countdown_hour").html(value + 1);
        },
        countdown_hour_down: function() {
            var value = parseInt($("#countdown_hour").html(), 10);
            if (value > 0) $("#countdown_hour").html(value - 1);
        },
        countdown_second_up: function() {
            var value = parseInt($("#countdown_sec").html(), 10);
            if (value < 99) $("#countdown_sec").html(value + 1);
        },
        countdown_second_down: function() {
            var value = parseInt($("#countdown_sec").html(), 10);
            if (value > 0) $("#countdown_sec").html(value - 1);
        },
        countdown_start: function() {
            var sec = parseInt($("#countdown_sec").html(), 10), min = parseInt($("#countdown_min").html(), 10), hour = parseInt($("#countdown_hour").html(), 10), string = hour + "h" + min + "m" + sec + "s", url = "#/c/" + string;
            $(document).trigger("hide_dialog");
            document.location = url;
        }
    });
};
exports.load = function(params) {
    params.done = function() {
        countdown_blink = blinker.blink({
            target: $("#container")
        });
    };
    params.unload = function() {
        countdown_blink && countdown_blink.stop();
        countdown_blink = undefined;
    };
    params.container = $("#container");
    params.start = true;
    return flipclock.load(layout, params);
};

});require.memoize("lib/clock/flipclock",[ "../../vendor/jquery", "../config" ],
function(require, exports, module) {
var $ = require("../../vendor/jquery").jQuery, config = require("../config"), transition_duration = 250;
var FlipClock = {};
FlipClock.MS_TO_S = 1e3;
FlipClock.MS_TO_M = 1e3 * 60;
FlipClock.MS_TO_H = 1e3 * 60 * 60;
FlipClock.Digit = function(params) {
    this.params = params || {};
    this.init();
};
FlipClock.Digit.init = function() {
    var top = $('<div class="top" />').append('<div class="card static" />').append('<div class="card flip animated" />');
    var bottom = $('<div class="bottom" />').append('<div class="card static" />').append('<div class="card flip animated active" />');
    var tile = $('<div class="tile" />').append(top).append(bottom);
    if (this.params.cls) tile.addClass(this.params.cls);
    $(".card", tile).append('<div class="before" />').append('<div class="inner" />').append('<div class="after" />');
    this.tile = tile;
};
FlipClock.Digit.flip = function(number) {
    var context = this.tile, from = context.attr("number"), transition_duration = this.params.transition_duration || 250, transition_overlap = this.params.transition_overlap || 20;
    if (number == from) return;
    context.attr("from", from);
    context.attr("number", number);
    $(".top .static", context).removeClass("digit_" + from).addClass("digit_" + number);
    $(".bottom .flip", context).removeClass("digit_" + from).addClass("digit_" + number);
    $(".top .flip", context).toggleClass("active");
    setTimeout(function() {
        var old_class = "digit_" + context.attr("from");
        var new_class = "digit_" + context.attr("number");
        $(".bottom .flip", context).toggleClass("active");
        setTimeout(function() {
            $(".top .flip", context).css("display", "none");
            $(".top .flip", context).toggleClass("active");
            $(".top .flip", context).removeClass(old_class).addClass(new_class);
            setTimeout(function() {
                $(".top .flip", context).css("display", "block");
            }, transition_duration + transition_overlap);
        }, transition_overlap);
        setTimeout(function() {
            $(".bottom .flip", context).css("display", "none");
            $(".bottom .flip", context).toggleClass("active");
            $(".bottom .static", context).removeClass(old_class).addClass(new_class);
            setTimeout(function() {
                $(".bottom .flip", context).css("display", "block");
            }, transition_duration);
        }, transition_duration);
    }, transition_duration - transition_overlap);
};
FlipClock.Digit.prototype = FlipClock.Digit;
FlipClock.Layout = function(layout, params) {
    this.cls = layout.cls;
    layout.init.apply(this, [ params ]);
    var container = $("<div />").addClass(this.cls);
    var l = this.items.length;
    for (var i = 0; i < l; i++) {
        var tile = this.items[i].tile;
        container.append(tile);
    }
    this.element = container;
    this.done = false;
    this.stop = false;
    this.start = function() {
        this.update();
    };
    this.stop = function(fireDoneEvent) {
        this.stop = true;
        if (fireDoneEvent === true) {
            this.done = true;
        }
    };
    this.unload = function() {
        params.unload && params.unload();
    };
    this.update = function() {
        layout.update.apply(this);
        if (this.done !== true && this.stop !== true) {
            var that = this;
            setTimeout(function() {
                that.update();
            }, layout.refreshTime);
        } else if (this.done === true) {
            if (params.done) params.done();
        }
    };
};
exports.FlipClock = FlipClock;
exports.load = function(layout, params) {
    var clock = new FlipClock.Layout(layout, params), container = params.container, start = params.start;
    if (container) {
        $(container).append(clock.element);
    }
    if (start) {
        clock.start();
    }
    return clock;
};

});require.memoize("lib/clock/layout/flipclock",[ "../../../vendor/jquery", "../../config", "../flipclock" ],
function(require, exports, module) {
var $ = require("../../../vendor/jquery").jQuery, config = require("../../config"), FlipClock = require("../flipclock").FlipClock;
exports.layout = {
    cls: "time_box layout_time_ampm",
    refreshTime: 1e3,
    init: function() {
        this.mode = config.getTimeMode();
        this.hour1 = new FlipClock.Digit({
            cls: "time hour_1"
        });
        this.hour2 = new FlipClock.Digit({
            cls: "time hour_2"
        });
        this.minute1 = new FlipClock.Digit({
            cls: "time minute_1"
        });
        this.minute2 = new FlipClock.Digit({
            cls: "time minute_2"
        });
        this.items = [ this.hour1, this.hour2, this.minute1, this.minute2 ];
        if (this.mode == config.modes.twelveHour) {
            this.ampm = new FlipClock.Digit({
                cls: "ampm"
            });
            this.items.push(this.ampm);
        } else {
            this.cls += " layout_no_seconds";
        }
    },
    update: function() {
        var d = new Date;
        var seconds = d.getSeconds();
        var s_tens = Math.floor(seconds / 10);
        var s_ones = seconds % 10;
        var minutes = d.getMinutes();
        var m_tens = Math.floor(minutes / 10);
        var m_ones = minutes % 10;
        this.minute1.flip(m_tens);
        this.minute2.flip(m_ones);
        var hours = d.getHours();
        if (this.mode == config.modes.twelveHour) {
            if (hours > 12) hours -= 12;
            if (hours == 0) hours = 12;
            var ampm_val = "am";
            if (d.getHours() >= 12) ampm_val = "pm";
            this.ampm.flip(ampm_val);
        }
        var h_tens = Math.floor(hours / 10);
        var h_ones = hours % 10;
        this.hour1.flip(h_tens == 0 ? "" : h_tens);
        this.hour2.flip(h_ones);
    }
};

});require.memoize("lib/clock/layout/flipclockSeconds",[ "../../../vendor/jquery", "../../config", "../flipclock" ],
function(require, exports, module) {
var $ = require("../../../vendor/jquery").jQuery, config = require("../../config"), FlipClock = require("../flipclock").FlipClock;
exports.layout = {
    cls: "time_box layout_time_ampm",
    refreshTime: 1e3,
    init: function() {
        this.mode = config.getTimeMode();
        this.hour1 = new FlipClock.Digit({
            cls: "time hour_1"
        });
        this.hour2 = new FlipClock.Digit({
            cls: "time hour_2"
        });
        this.minute1 = new FlipClock.Digit({
            cls: "time minute_1"
        });
        this.minute2 = new FlipClock.Digit({
            cls: "time minute_2"
        });
        this.items = [ this.hour1, this.hour2, this.minute1, this.minute2 ];
        if (this.mode == config.modes.twelveHour) {
            this.ampm = new FlipClock.Digit({
                cls: "ampm"
            });
            this.items.push(this.ampm);
        } else {
            this.cls += " layout_no_seconds";
        }
    },
    update: function() {
        var d = new Date;
        var seconds = d.getSeconds();
        var s_tens = Math.floor(seconds / 10);
        var s_ones = seconds % 10;
        var minutes = d.getMinutes();
        var m_tens = Math.floor(minutes / 10);
        var m_ones = minutes % 10;
        this.minute1.flip(m_tens);
        this.minute2.flip(m_ones);
        var hours = d.getHours();
        if (this.mode == config.modes.twelveHour) {
            if (hours > 12) hours -= 12;
            if (hours == 0) hours = 12;
            var ampm_val = "am";
            if (d.getHours() >= 12) ampm_val = "pm";
            this.ampm.flip(ampm_val);
        }
        var h_tens = Math.floor(hours / 10);
        var h_ones = hours % 10;
        this.hour1.flip(h_tens == 0 ? "" : h_tens);
        this.hour2.flip(h_ones);
    }
};

});require.memoize("lib/clock/layout/countdown",[ "../../../vendor/jquery", "../../config", "../flipclock" ],
function(require, exports, module) {
var $ = require("../../../vendor/jquery").jQuery, config = require("../../config"), FlipClock = require("../flipclock").FlipClock;
exports.layout = {
    cls: "countdown_box layout_countdown",
    refreshTime: 1e3,
    init: function(params) {
        if (params.time) {
            this.date = new Date(params.time);
        } else {
            var ms_time = Date.now();
            if (params.seconds) {
                ms_time += params.seconds * FlipClock.MS_TO_S;
            }
            if (params.minutes) {
                ms_time += params.minutes * FlipClock.MS_TO_M;
            }
            if (params.hours) {
                ms_time += params.hours * FlipClock.MS_TO_H;
            }
            this.date = new Date(ms_time);
        }
        this.left1 = new FlipClock.Digit({
            cls: "time left_1"
        });
        this.left2 = new FlipClock.Digit({
            cls: "time left_2"
        });
        this.right1 = new FlipClock.Digit({
            cls: "time right_1"
        });
        this.right2 = new FlipClock.Digit({
            cls: "time right_2"
        });
        this.items = [ this.left1, this.left2, this.right1, this.right2 ];
    },
    update: function() {
        var targetMs = this.date.getTime(), nowMs = Date.now(), differenceMs = targetMs - nowMs;
        if (differenceMs <= 0) {
            differenceMs = 0;
            this.done = true;
        }
        var hours = Math.floor(differenceMs / FlipClock.MS_TO_H);
        differenceMs = differenceMs % FlipClock.MS_TO_H;
        var minutes = Math.floor(differenceMs / FlipClock.MS_TO_M);
        differenceMs = differenceMs % FlipClock.MS_TO_M;
        var seconds = Math.floor(differenceMs / FlipClock.MS_TO_S);
        differenceMs = differenceMs % FlipClock.MS_TO_S;
        var h_tens = Math.floor(hours / 10);
        var h_ones = hours % 10;
        var m_tens = Math.floor(minutes / 10);
        var m_ones = minutes % 10;
        var s_tens = Math.floor(seconds / 10);
        var s_ones = seconds % 10;
        if (hours > 0) {
            this.left1.flip(h_tens);
            this.left2.flip(h_ones);
            this.right1.flip(m_tens);
            this.right2.flip(m_ones);
        } else {
            this.left1.flip(m_tens);
            this.left2.flip(m_ones);
            this.right1.flip(s_tens);
            this.right2.flip(s_ones);
        }
    }
};

});require.memoize("lib/ui/dialog",[ "../../vendor/jquery", "../../vendor/twig" ],
function(require, exports, module) {
var $ = require("../../vendor/jquery").jQuery, twig = require("../../vendor/twig").twig, dialogs = {}, count = 0, load_callback, config = {
    active_dialog_class: "active_dialog"
}, ready = false, onready = [];
twig({
    id: "dialog",
    href: "templates/dialog.twig",
    load: function() {
        ready = true;
        while (onready.length > 0) {
            var fn = onready.shift();
            fn();
        }
    }
});
exports.get = function(id) {
    return dialogs[id];
};
exports.show = function(id) {
    $("#" + id).addClass(config.active_dialog_class);
};
exports.hide = function(e) {
    if (e && e.returnValue === false) return false;
    $("." + config.active_dialog_class).removeClass(config.active_dialog_class);
};
exports.create = function(params, callback) {
    count++;
    var id = params.id, href = params.template, data = params.data, container = params.container;
    twig({
        href: href,
        load: function(template) {
            var readyFn = function() {
                var content = template.render(data || {});
                content = twig({
                    ref: "dialog"
                }).render({
                    id: id,
                    content: content
                });
                content = $(content);
                dialogs[id] = content;
                container && container.append(content);
                callback && callback(content);
                count--;
                if (count === 0 && load_callback) {
                    load_callback();
                    load_callback = undefined;
                }
            };
            if (ready) readyFn(); else onready.push(readyFn);
        }
    });
    return exports;
};
exports.complete = function(callback) {
    if (count > 0) {
        load_callback = callback;
    } else {
        callback();
    }
};

});require.memoize("lib/ui/buttons",[ "../../vendor/jquery", "./dialog" ],
function(require, exports, module) {
var $ = require("../../vendor/jquery").jQuery, dialog = require("./dialog"), cls = "button", active_cls = "active", pressed_cls = "down";
exports.init = function() {
    var button_interval, button_interval_accel = 1.1, button_interval_timeout, button_incrementing = false, button_trigger = function(element) {
        button_interval /= button_interval_accel;
        button_incrementing = true;
        $(element).trigger("action");
        button_interval_timeout = setTimeout(button_trigger, button_interval, element);
    };
    var button_down = function(e) {
        $(this).removeClass(active_cls);
        $(this).addClass(pressed_cls);
        button_incrementing = false;
        if ($(this).attr("interval")) {
            button_interval = parseInt($(this).attr("interval"), 10);
            button_interval_timeout = setTimeout(button_trigger, button_interval, this);
        }
        e.preventDefault();
    };
    var button_up = function(e) {
        var pressed = $(this).hasClass(pressed_cls);
        $(this).removeClass(pressed_cls);
        clearTimeout(button_interval_timeout);
        if (pressed && !button_incrementing) {
            $(this).trigger("action");
        }
        e.preventDefault();
    };
    var button_over = function() {
        $(this).addClass(active_cls);
    };
    var button_out = function() {
        $(this).removeClass(active_cls).removeClass(pressed_cls);
        clearTimeout(button_interval_timeout);
    };
    $("." + cls).append($('<div class="button_inner" />'));
    $(document).on({
        mousedown: button_down,
        mouseup: button_up,
        mouseover: button_over,
        mouseout: button_out,
        touchstart: button_down,
        touchend: button_up,
        touchcancel: button_up,
        touchmove: function(event) {
            var x = event.originalEvent.targetTouches[0].pageX, y = event.originalEvent.targetTouches[0].pageY;
            var offset = $(this).offset(), left = offset.left, top = offset.top, right = left + $(this).outerWidth(), bottom = top + $(this).outerHeight();
            if (x < left || x > right || y < top || y > bottom) {
                $(this).removeClass(pressed_cls);
                clearTimeout(button_interval_timeout);
                event.preventDefault();
                return false;
            }
        },
        action: function(e) {
            if ($(this).attr("dialog")) {
                dialog.show($(this).attr("dialog"));
                e.preventDefault();
            } else if ($(this).attr("action")) {
                var action = $(this).attr("action");
                $(document).trigger(action);
                e.preventDefault();
            } else {
                document.location = $(this).attr("href");
            }
        }
    }, "." + cls);
};

});require.memoize("lib/ui/toggle",[ "../../vendor/jquery" ],
function(require, exports, module) {
var $ = require("../../vendor/jquery").jQuery, active_class = "active";
exports.init = function(element) {
    element.each(function() {
        var toggle = $(this), options = $("button", this);
        var click_fn = function(e) {
            var target = $(this);
            options.removeClass(active_class);
            target.addClass(active_class);
        };
        toggle.on({
            click: click_fn,
            touchstart: click_fn
        }, "button");
        toggle.on({
            confirm: function() {
                var active = $("." + active_class, toggle), value = active.data("value");
                toggle.data("value", value);
            },
            reset: function() {
                var value = toggle.data("value");
                options.each(function() {
                    if ($(this).data("value") == value) {
                        $(this).addClass(active_class);
                    } else {
                        $(this).removeClass(active_class);
                    }
                });
            }
        });
    });
};

});require.memoize("lib/ui/blinker",[ "../../vendor/jquery" ],
function(require, exports, module) {
var $ = require("../../vendor/jquery").jQuery;
exports.blink = function(params) {
    return new function() {
        var passive_count = params.passive || 8, count = params.count || 244, blink_class = "blink", blink_count = 0, target = params.target, blinker_interval;
        this.stop = function() {
            blink_count = 0;
            clearInterval(blinker_interval);
            target.removeClass("blink").removeClass("passive_blink");
        };
        blinker_interval = setInterval(function() {
            target.toggleClass(blink_class);
            blink_count++;
            if (blink_count == passive_count) {
                blink_class = "passive_blink";
            }
            if (blink_count == count) {
                this.stop();
            }
        }, 750);
    };
};

});require.memoize("lib/utils",[],
function(require, exports, module) {
exports.parseTimeOutOfParams = function(data) {
    var tmp = "", params = {}, isDate = true;
    for (var i = 0, l = data.length; i < l; i++) {
        var chr = data.charAt(i);
        switch (chr) {
          case "h":
            params.hours = parseInt(tmp);
            tmp = "";
            isDate = false;
            break;
          case "m":
            params.minutes = parseInt(tmp);
            tmp = "";
            isDate = false;
            break;
          case "s":
            params.seconds = parseInt(tmp);
            tmp = "";
            isDate = false;
            break;
          default:
            tmp += chr;
        }
    }
    if (isDate) {
        params.time = data;
    }
    return params;
};

});require.memoize("lib/analytics",[],
function(require, exports, module) {
var _gaq = [];
exports.register = function(root) {
    _gaq.push([ "_setAccount", "UA-28863948-2" ]);
    _gaq.push([ "_setDomainName", "flipclock.us" ]);
    _gaq.push([ "_setAllowLinker", true ]);
    _gaq.push([ "_trackPageview" ]);
    root._gaq = _gaq;
    var ga = document.createElement("script");
    ga.type = "text/javascript";
    ga.async = true;
    ga.src = "https://ssl.google-analytics.com/ga.js";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(ga, s);
};
exports._gaq = _gaq;

});require.memoize("lib/config",[],
function(require, exports, module) {
var storage = window.localStorage, key = "config", modes = {
    twelveHour: "12hr",
    twentyFourHour: "24hr"
}, timeModeDefault = modes.twelveHour;
exports.get = function(key) {
    return storage[key];
};
exports.set = function(key, value) {
    storage[key] = value;
};
exports.setTimeMode = function(mode) {
    exports.set("timeMode", mode);
};
exports.getTimeMode = function() {
    return storage.timeMode || timeModeDefault;
};
exports.setShowSeconds = function(showSeconds) {
    exports.set("showSeconds", showSeconds ? "true" : "false");
};
exports.getShowSeconds = function() {
    return storage.showSeconds == "true";
};
exports.data = function() {
    return {
        timeMode: exports.getTimeMode(),
        showSeconds: exports.getShowSeconds()
    };
};
exports.modes = modes;

});require.memoize("vendor/twig",[],
function(require, exports, module) {
var Twig = function(Twig) {
    "use strict";
    Twig.trace = false;
    Twig.debug = false;
    Twig.cache = true;
    Twig.placeholders = {
        parent: "{{|PARENT|}}"
    };
    Twig.Error = function(message) {
        this.message = message;
        this.name = "TwigException";
        this.type = "TwigException";
    };
    Twig.Error.prototype.toString = function() {
        return this.name + ": " + this.message;
    };
    Twig.log = {
        trace: function() {
            if (Twig.trace && console) {
                console.log(Array.prototype.slice.call(arguments));
            }
        },
        debug: function() {
            if (Twig.debug && console) {
                console.log(Array.prototype.slice.call(arguments));
            }
        }
    };
    Twig.token = {};
    Twig.token.type = {
        output: "output",
        logic: "logic",
        comment: "comment",
        raw: "raw"
    };
    Twig.token.definitions = {
        output: {
            type: Twig.token.type.output,
            open: "{{",
            close: "}}"
        },
        logic: {
            type: Twig.token.type.logic,
            open: "{%",
            close: "%}"
        },
        comment: {
            type: Twig.token.type.comment,
            open: "{#",
            close: "#}"
        }
    };
    Twig.token.strings = [ '"', "'" ];
    Twig.token.findStart = function(template) {
        var output = {
            position: null,
            def: null
        }, token_type, token_template, first_key_position;
        for (token_type in Twig.token.definitions) {
            if (Twig.token.definitions.hasOwnProperty(token_type)) {
                token_template = Twig.token.definitions[token_type];
                first_key_position = template.indexOf(token_template.open);
                Twig.log.trace("Twig.token.findStart: ", "Searching for ", token_template.open, " found at ", first_key_position);
                if (first_key_position >= 0 && (output.position === null || first_key_position < output.position)) {
                    output.position = first_key_position;
                    output.def = token_template;
                }
            }
        }
        return output;
    };
    Twig.token.findEnd = function(template, token_def, start) {
        var end = null, found = false, offset = 0, str_pos = null, str_found = null, pos = null, end_offset = null, this_str_pos = null, end_str_pos = null, i, l;
        while (!found) {
            str_pos = null;
            str_found = null;
            pos = template.indexOf(token_def.close, offset);
            if (pos >= 0) {
                end = pos;
                found = true;
            } else {
                throw new Twig.Error("Unable to find closing bracket '" + token_def.close + "'" + " opened near template position " + start);
            }
            l = Twig.token.strings.length;
            for (i = 0; i < l; i += 1) {
                this_str_pos = template.indexOf(Twig.token.strings[i], offset);
                if (this_str_pos > 0 && this_str_pos < pos && (str_pos === null || this_str_pos < str_pos)) {
                    str_pos = this_str_pos;
                    str_found = Twig.token.strings[i];
                }
            }
            if (str_pos !== null) {
                end_offset = str_pos + 1;
                end = null;
                found = false;
                while (true) {
                    end_str_pos = template.indexOf(str_found, end_offset);
                    if (end_str_pos < 0) {
                        throw "Unclosed string in template";
                    }
                    if (template.substr(end_str_pos - 1, 1) !== "\\") {
                        offset = end_str_pos + 1;
                        break;
                    } else {
                        end_offset = end_str_pos + 1;
                    }
                }
            }
        }
        return end;
    };
    Twig.tokenize = function(template) {
        var tokens = [], error_offset = 0, found_token = null, end = null;
        while (template.length > 0) {
            found_token = Twig.token.findStart(template);
            Twig.log.trace("Twig.tokenize: ", "Found token: ", found_token);
            if (found_token.position !== null) {
                if (found_token.position > 0) {
                    tokens.push({
                        type: Twig.token.type.raw,
                        value: template.substring(0, found_token.position)
                    });
                }
                template = template.substr(found_token.position + found_token.def.open.length);
                error_offset += found_token.position + found_token.def.open.length;
                end = Twig.token.findEnd(template, found_token.def, error_offset);
                Twig.log.trace("Twig.tokenize: ", "Token ends at ", end);
                tokens.push({
                    type: found_token.def.type,
                    value: template.substring(0, end).trim()
                });
                template = template.substr(end + found_token.def.close.length);
                error_offset += end + found_token.def.close.length;
            } else {
                tokens.push({
                    type: Twig.token.type.raw,
                    value: template
                });
                template = "";
            }
        }
        return tokens;
    };
    Twig.compile = function(tokens) {
        var output = [], stack = [], intermediate_output = [], token = null, logic_token = null, unclosed_token = null, prev_token = null, prev_template = null, tok_output = null, type = null, open = null, next = null;
        while (tokens.length > 0) {
            token = tokens.shift();
            Twig.log.trace("Compiling token ", token);
            switch (token.type) {
              case Twig.token.type.raw:
                if (stack.length > 0) {
                    intermediate_output.push(token);
                } else {
                    output.push(token);
                }
                break;
              case Twig.token.type.logic:
                logic_token = Twig.logic.compile.apply(this, [ token ]);
                type = logic_token.type;
                open = Twig.logic.handler[type].open;
                next = Twig.logic.handler[type].next;
                Twig.log.trace("Twig.compile: ", "Compiled logic token to ", logic_token, " next is: ", next, " open is : ", open);
                if (open !== undefined && !open) {
                    prev_token = stack.pop();
                    prev_template = Twig.logic.handler[prev_token.type];
                    if (prev_template.next.indexOf(type) < 0) {
                        throw new Error(type + " not expected after a " + prev_token.type);
                    }
                    prev_token.output = prev_token.output || [];
                    prev_token.output = prev_token.output.concat(intermediate_output);
                    intermediate_output = [];
                    tok_output = {
                        type: Twig.token.type.logic,
                        token: prev_token
                    };
                    if (stack.length > 0) {
                        intermediate_output.push(tok_output);
                    } else {
                        output.push(tok_output);
                    }
                }
                if (next !== undefined && next.length > 0) {
                    Twig.log.trace("Twig.compile: ", "Pushing ", logic_token, " to logic stack.");
                    if (stack.length > 0) {
                        prev_token = stack.pop();
                        prev_token.output = prev_token.output || [];
                        prev_token.output = prev_token.output.concat(intermediate_output);
                        stack.push(prev_token);
                        intermediate_output = [];
                    }
                    stack.push(logic_token);
                } else if (open !== undefined && open) {
                    tok_output = {
                        type: Twig.token.type.logic,
                        token: logic_token
                    };
                    if (stack.length > 0) {
                        intermediate_output.push(tok_output);
                    } else {
                        output.push(tok_output);
                    }
                }
                break;
              case Twig.token.type.comment:
                break;
              case Twig.token.type.output:
                Twig.expression.compile.apply(this, [ token ]);
                if (stack.length > 0) {
                    intermediate_output.push(token);
                } else {
                    output.push(token);
                }
                break;
            }
            Twig.log.trace("Twig.compile: ", " Output: ", output, " Logic Stack: ", stack, " Pending Output: ", intermediate_output);
        }
        if (stack.length > 0) {
            unclosed_token = stack.pop();
            throw new Error("Unable to find an end tag for " + unclosed_token.type + ", expecting one of " + unclosed_token.next);
        }
        return output;
    };
    Twig.parse = function(tokens, context) {
        var output = [], chain = true, that = this;
        context = context || {};
        tokens.forEach(function(token) {
            Twig.log.debug("Twig.parse: ", "Parsing token: ", token);
            switch (token.type) {
              case Twig.token.type.raw:
                output.push(token.value);
                break;
              case Twig.token.type.logic:
                var logic_token = token.token, logic = Twig.logic.parse.apply(that, [ logic_token, context, chain ]);
                if (logic.chain !== undefined) {
                    chain = logic.chain;
                }
                if (logic.context !== undefined) {
                    context = logic.context;
                }
                if (logic.output !== undefined) {
                    output.push(logic.output);
                }
                break;
              case Twig.token.type.comment:
                break;
              case Twig.token.type.output:
                output.push(Twig.expression.parse.apply(that, [ token.stack, context ]));
                break;
            }
        });
        return output.join("");
    };
    Twig.prepare = function(data) {
        var tokens, raw_tokens;
        Twig.log.debug("Twig.prepare: ", "Tokenizing ", data);
        raw_tokens = Twig.tokenize.apply(this, [ data ]);
        Twig.log.debug("Twig.prepare: ", "Compiling ", raw_tokens);
        tokens = Twig.compile.apply(this, [ raw_tokens ]);
        Twig.log.debug("Twig.prepare: ", "Compiled ", tokens);
        return tokens;
    };
    Twig.Templates = {
        registry: {}
    };
    Twig.validateId = function(id) {
        if (id === "prototype") {
            throw new Twig.Error(id + " is not a valid twig identifier");
        } else if (Twig.Templates.registry.hasOwnProperty(id)) {
            throw new Twig.Error("There is already a template with the ID " + id);
        }
        return true;
    };
    Twig.Templates.save = function(template) {
        if (template.id === undefined) {
            throw new Twig.Error("Unable to save template with no id");
        }
        Twig.Templates.registry[template.id] = template;
    };
    Twig.Templates.load = function(id) {
        if (!Twig.Templates.registry.hasOwnProperty(id)) {
            return null;
        }
        return Twig.Templates.registry[id];
    };
    Twig.Templates.loadRemote = function(location, params, callback, error_callback) {
        var id = params.id, method = params.method, async = params.async, precompiled = params.precompiled, options = params.options, template = null;
        if (async === undefined) async = true;
        if (id === undefined) {
            id = location;
        }
        if (Twig.cache && Twig.Templates.registry.hasOwnProperty(id)) {
            if (callback) {
                callback(Twig.Templates.registry[id]);
            }
            return Twig.Templates.registry[id];
        }
        if (method == "ajax") {
            if (typeof XMLHttpRequest == "undefined") {
                throw new Error("Unsupported platform: Unable to do remote requests " + "because there is no XMLHTTPRequest implementation");
            }
            var xmlhttp = new XMLHttpRequest;
            xmlhttp.onreadystatechange = function() {
                var data = null;
                if (xmlhttp.readyState == 4) {
                    Twig.log.debug("Got template ", xmlhttp.responseText);
                    if (precompiled === true) {
                        data = JSON.parse(xmlhttp.responseText);
                    } else {
                        data = xmlhttp.responseText;
                    }
                    template = new Twig.Template({
                        data: data,
                        id: id,
                        url: location,
                        options: options
                    });
                    if (callback) {
                        callback(template);
                    }
                }
            };
            xmlhttp.open("GET", location, async);
            xmlhttp.send();
        } else {
            (function() {
                var fs = require("fs"), data = null;
                if (async === true) {
                    fs.readFile(location, "utf8", function(err, data) {
                        if (err) {
                            if (error_callback) {
                                error_callback(err);
                            }
                            return;
                        }
                        if (precompiled === true) {
                            data = JSON.parse(data);
                        }
                        template = new Twig.Template({
                            data: data,
                            id: id,
                            path: location,
                            options: options
                        });
                        if (callback) {
                            callback(template);
                        }
                    });
                } else {
                    data = fs.readFileSync(location, "utf8");
                    if (precompiled === true) {
                        data = JSON.parse(data);
                    }
                    template = new Twig.Template({
                        data: data,
                        id: id,
                        path: location,
                        options: options
                    });
                    if (callback) {
                        callback(template);
                    }
                }
            })();
        }
        if (async === false) {
            return template;
        } else {
            return true;
        }
    };
    function is(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }
    Twig.Template = function(params) {
        var data = params.data, id = params.id, blocks = params.blocks, path = params.path, url = params.url, options = params.options;
        this.id = id;
        this.path = path;
        this.url = url;
        this.options = options;
        this.reset = function() {
            Twig.log.debug("Twig.Template.reset", "Reseting template " + this.id);
            this.blocks = {};
            this.child = {
                blocks: blocks || {}
            };
            this.extend = null;
        };
        this.reset();
        if (is("String", data)) {
            this.tokens = Twig.prepare.apply(this, [ data ]);
        } else {
            this.tokens = data;
        }
        this.render = function(context, params) {
            params = params || {};
            var that = this, output, blocks = params.output == "blocks";
            this.context = context;
            this.reset();
            if (params.blocks) {
                this.blocks = params.blocks;
            }
            this.importBlocks = function(file, override) {
                var url = relativePath(that, file), sub_template = Twig.Templates.loadRemote(url, {
                    method: that.url ? "ajax" : "fs",
                    async: false,
                    id: url
                }), key;
                override = override || false;
                sub_template.render(context);
                Object.keys(sub_template.blocks).forEach(function(key) {
                    if (override || that.blocks[key] === undefined) {
                        that.blocks[key] = sub_template.blocks[key];
                    }
                });
            };
            output = Twig.parse.apply(this, [ this.tokens, context ]);
            if (this.extend) {
                url = relativePath(this, this.extend);
                this.parent = Twig.Templates.loadRemote(url, {
                    method: this.url ? "ajax" : "fs",
                    async: false,
                    id: url
                });
                return this.parent.render(context, {
                    blocks: this.blocks
                });
            }
            if (blocks === true) {
                return this.blocks;
            } else {
                return output;
            }
        };
        this.compile = function(options) {
            return Twig.compiler.compile(this, options);
        };
        if (id !== undefined) {
            Twig.Templates.save(this);
        }
    };
    function relativePath(template, file) {
        var base, base_path, sep_chr = "/", new_path = [], val;
        if (template.url) {
            base = template.url;
        } else if (template.path) {
            base = template.path;
        } else {
            throw new Twig.Error("Cannot extend an inline template.");
        }
        base_path = base.split(sep_chr), base_path.pop();
        base_path = base_path.concat(file.split(sep_chr));
        while (base_path.length > 0) {
            val = base_path.shift();
            if (val == ".") {} else if (val == ".." && new_path.length > 0 && new_path[new_path.length - 1] != "..") {
                new_path.pop();
            } else {
                new_path.push(val);
            }
        }
        return new_path.join(sep_chr);
    }
    return Twig;
}(Twig || {});
(function() {
    "use strict";
    if (!String.prototype.trim) {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, "");
        };
    }
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(searchElement) {
            if (this === void 0 || this === null) {
                throw new TypeError;
            }
            var t = Object(this);
            var len = t.length >>> 0;
            if (len === 0) {
                return -1;
            }
            var n = 0;
            if (arguments.length > 0) {
                n = Number(arguments[1]);
                if (n !== n) {
                    n = 0;
                } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
                }
            }
            if (n >= len) {
                return -1;
            }
            var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
            for (; k < len; k++) {
                if (k in t && t[k] === searchElement) {
                    return k;
                }
            }
            return -1;
        };
    }
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(callback, thisArg) {
            var T, k;
            if (this == null) {
                throw new TypeError(" this is null or not defined");
            }
            var O = Object(this);
            var len = O.length >>> 0;
            if ({}.toString.call(callback) != "[object Function]") {
                throw new TypeError(callback + " is not a function");
            }
            if (thisArg) {
                T = thisArg;
            }
            k = 0;
            while (k < len) {
                var kValue;
                if (k in O) {
                    kValue = O[k];
                    callback.call(T, kValue, k, O);
                }
                k++;
            }
        };
    }
    if (!Object.keys) Object.keys = function(o) {
        if (o !== Object(o)) {
            throw new TypeError("Object.keys called on non-object");
        }
        var ret = [], p;
        for (p in o) if (Object.prototype.hasOwnProperty.call(o, p)) ret.push(p);
        return ret;
    };
})();
var Twig = function(Twig) {
    Twig.lib = {};
    var sprintf = function() {
        function get_type(variable) {
            return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
        }
        function str_repeat(input, multiplier) {
            for (var output = []; multiplier > 0; output[--multiplier] = input) {}
            return output.join("");
        }
        var str_format = function() {
            if (!str_format.cache.hasOwnProperty(arguments[0])) {
                str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
            }
            return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
        };
        str_format.format = function(parse_tree, argv) {
            var cursor = 1, tree_length = parse_tree.length, node_type = "", arg, output = [], i, k, match, pad, pad_character, pad_length;
            for (i = 0; i < tree_length; i++) {
                node_type = get_type(parse_tree[i]);
                if (node_type === "string") {
                    output.push(parse_tree[i]);
                } else if (node_type === "array") {
                    match = parse_tree[i];
                    if (match[2]) {
                        arg = argv[cursor];
                        for (k = 0; k < match[2].length; k++) {
                            if (!arg.hasOwnProperty(match[2][k])) {
                                throw sprintf('[sprintf] property "%s" does not exist', match[2][k]);
                            }
                            arg = arg[match[2][k]];
                        }
                    } else if (match[1]) {
                        arg = argv[match[1]];
                    } else {
                        arg = argv[cursor++];
                    }
                    if (/[^s]/.test(match[8]) && get_type(arg) != "number") {
                        throw sprintf("[sprintf] expecting number but found %s", get_type(arg));
                    }
                    switch (match[8]) {
                      case "b":
                        arg = arg.toString(2);
                        break;
                      case "c":
                        arg = String.fromCharCode(arg);
                        break;
                      case "d":
                        arg = parseInt(arg, 10);
                        break;
                      case "e":
                        arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential();
                        break;
                      case "f":
                        arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg);
                        break;
                      case "o":
                        arg = arg.toString(8);
                        break;
                      case "s":
                        arg = (arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg;
                        break;
                      case "u":
                        arg = Math.abs(arg);
                        break;
                      case "x":
                        arg = arg.toString(16);
                        break;
                      case "X":
                        arg = arg.toString(16).toUpperCase();
                        break;
                    }
                    arg = /[def]/.test(match[8]) && match[3] && arg >= 0 ? "+" + arg : arg;
                    pad_character = match[4] ? match[4] == "0" ? "0" : match[4].charAt(1) : " ";
                    pad_length = match[6] - String(arg).length;
                    pad = match[6] ? str_repeat(pad_character, pad_length) : "";
                    output.push(match[5] ? arg + pad : pad + arg);
                }
            }
            return output.join("");
        };
        str_format.cache = {};
        str_format.parse = function(fmt) {
            var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
            while (_fmt) {
                if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
                    parse_tree.push(match[0]);
                } else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
                    parse_tree.push("%");
                } else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
                    if (match[2]) {
                        arg_names |= 1;
                        var field_list = [], replacement_field = match[2], field_match = [];
                        if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                            field_list.push(field_match[1]);
                            while ((replacement_field = replacement_field.substring(field_match[0].length)) !== "") {
                                if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                                    field_list.push(field_match[1]);
                                } else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                                    field_list.push(field_match[1]);
                                } else {
                                    throw "[sprintf] huh?";
                                }
                            }
                        } else {
                            throw "[sprintf] huh?";
                        }
                        match[2] = field_list;
                    } else {
                        arg_names |= 2;
                    }
                    if (arg_names === 3) {
                        throw "[sprintf] mixing positional and named placeholders is not (yet) supported";
                    }
                    parse_tree.push(match);
                } else {
                    throw "[sprintf] huh?";
                }
                _fmt = _fmt.substring(match[0].length);
            }
            return parse_tree;
        };
        return str_format;
    }();
    var vsprintf = function(fmt, argv) {
        argv.unshift(fmt);
        return sprintf.apply(null, argv);
    };
    Twig.lib.sprintf = sprintf;
    Twig.lib.vsprintf = vsprintf;
    (function() {
        var jPaq = {
            toString: function() {
                return "jPaq - A fully customizable JavaScript/JScript library created by Christopher West.";
            }
        };
        var shortDays = "Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(",");
        var fullDays = "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(",");
        var shortMonths = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(",");
        var fullMonths = "January,February,March,April,May,June,July,August,September,October,November,December".split(",");
        function getOrdinalFor(intNum) {
            return (intNum = Math.abs(intNum) % 100) % 10 == 1 && intNum != 11 ? "st" : intNum % 10 == 2 && intNum != 12 ? "nd" : intNum % 10 == 3 && intNum != 13 ? "rd" : "th";
        }
        function getISO8601Year(aDate) {
            var d = new Date(aDate.getFullYear() + 1, 0, 4);
            if ((d - aDate) / 864e5 < 7 && (aDate.getDay() + 6) % 7 < (d.getDay() + 6) % 7) return d.getFullYear();
            if (aDate.getMonth() > 0 || aDate.getDate() >= 4) return aDate.getFullYear();
            return aDate.getFullYear() - ((aDate.getDay() + 6) % 7 - aDate.getDate() > 2 ? 1 : 0);
        }
        function getISO8601Week(aDate) {
            var d = new Date(getISO8601Year(aDate), 0, 4);
            d.setDate(d.getDate() - (d.getDay() + 6) % 7);
            return parseInt((aDate - d) / 6048e5) + 1;
        }
        Date.prototype.setFromString = function(string) {
            var parts;
            if (parts = string.match(/^([0-9]{4})\-([0-9]{2})\-([0-9]{2})T([0-9]{2})\:([0-9]{2})\:([0-9]{2})(\+|\-)([0-9]{2}):([0-9]{2})$/)) {
                this.setFullYear(parseInt(parts[1], 10), parseInt(parts[2], 10) - 1, parseInt(parts[3], 10));
                this.setHours(parseInt(parts[4], 10));
                this.setMinutes(parseInt(parts[5], 10));
                this.setSeconds(parseInt(parts[6], 10));
                this.setMinutes(this.getMinutes() - parseInt(parts[7] + parts[8], 10) * 60 - parseInt(parts[7] + parts[9], 10) - this.getTimezoneOffset());
            } else if (parts = string.match(/^([0-9]{4})\-([0-9]{2})\-([0-9]{2})\s([0-9]{2})\:([0-9]{2})\:?([0-9]{2})?$/)) {
                this.setFullYear(parseInt(parts[1], 10), parseInt(parts[2], 10) - 1, parseInt(parts[3], 10));
                this.setHours(parseInt(parts[4], 10));
                this.setMinutes(parseInt(parts[5], 10));
                parts[6] && this.setSeconds(parseInt(parts[6], 10)) || this.setSeconds(0);
            } else if (parts = string.match(/^([0-9]{4})\-([0-9]{2})\-([0-9]{2})$/)) {
                this.setFullYear(parseInt(parts[1], 10), parseInt(parts[2], 10) - 1, parseInt(parts[3], 10));
                this.setHours(0);
                this.setMinutes(0);
                this.setSeconds(0);
            } else {
                throw new Error("Invalid string format");
            }
            return this;
        };
        Date.prototype.format = function(format) {
            if (typeof format !== "string" || /^\s*$/.test(format)) return this + "";
            var jan1st = new Date(this.getFullYear(), 0, 1);
            var me = this;
            return format.replace(/[dDjlNSwzWFmMntLoYyaABgGhHisu]/g, function(option) {
                switch (option) {
                  case "d":
                    return ("0" + me.getDate()).replace(/^.+(..)$/, "$1");
                  case "D":
                    return shortDays[me.getDay()];
                  case "j":
                    return me.getDate();
                  case "l":
                    return fullDays[me.getDay()];
                  case "N":
                    return (me.getDay() + 6) % 7 + 1;
                  case "S":
                    return getOrdinalFor(me.getDate());
                  case "w":
                    return me.getDay();
                  case "z":
                    return Math.ceil((jan1st - me) / 864e5);
                  case "W":
                    return ("0" + getISO8601Week(me)).replace(/^.(..)$/, "$1");
                  case "F":
                    return fullMonths[me.getMonth()];
                  case "m":
                    return ("0" + (me.getMonth() + 1)).replace(/^.+(..)$/, "$1");
                  case "M":
                    return shortMonths[me.getMonth()];
                  case "n":
                    return me.getMonth() + 1;
                  case "t":
                    return (new Date(me.getFullYear(), me.getMonth() + 1, -1)).getDate();
                  case "L":
                    return (new Date(me.getFullYear(), 1, 29)).getDate() == 29 ? 1 : 0;
                  case "o":
                    return getISO8601Year(me);
                  case "Y":
                    return me.getFullYear();
                  case "y":
                    return (me.getFullYear() + "").replace(/^.+(..)$/, "$1");
                  case "a":
                    return me.getHours() < 12 ? "am" : "pm";
                  case "A":
                    return me.getHours() < 12 ? "AM" : "PM";
                  case "B":
                    return Math.floor(((me.getUTCHours() + 1) % 24 + me.getUTCMinutes() / 60 + me.getUTCSeconds() / 3600) * 1e3 / 24);
                  case "g":
                    return me.getHours() % 12 != 0 ? me.getHours() % 12 : 12;
                  case "G":
                    return me.getHours();
                  case "h":
                    return ("0" + (me.getHours() % 12 != 0 ? me.getHours() % 12 : 12)).replace(/^.+(..)$/, "$1");
                  case "H":
                    return ("0" + me.getHours()).replace(/^.+(..)$/, "$1");
                  case "i":
                    return ("0" + me.getMinutes()).replace(/^.+(..)$/, "$1");
                  case "s":
                    return ("0" + me.getSeconds()).replace(/^.+(..)$/, "$1");
                  case "u":
                    return me.getMilliseconds();
                }
            });
        };
    })();
    Twig.lib.strip_tags = function(input, allowed) {
        allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join("");
        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
        return input.replace(commentsAndPhpTags, "").replace(tags, function($0, $1) {
            return allowed.indexOf("<" + $1.toLowerCase() + ">") > -1 ? $0 : "";
        });
    };
    Twig.lib.strtotime = function(str, now) {
        var i, l, match, s, parse = "";
        str = str.replace(/\s{2,}|^\s|\s$/g, " ");
        str = str.replace(/[\t\r\n]/g, "");
        if (str === "now") {
            return now === null || isNaN(now) ? (new Date).getTime() / 1e3 | 0 : now | 0;
        } else if (!isNaN(parse = Date.parse(str))) {
            return parse / 1e3 | 0;
        } else if (now) {
            now = new Date(now * 1e3);
        } else {
            now = new Date;
        }
        str = str.toLowerCase();
        var __is = {
            day: {
                sun: 0,
                mon: 1,
                tue: 2,
                wed: 3,
                thu: 4,
                fri: 5,
                sat: 6
            },
            mon: [ "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec" ]
        };
        var process = function(m) {
            var ago = m[2] && m[2] === "ago";
            var num = (num = m[0] === "last" ? -1 : 1) * (ago ? -1 : 1);
            switch (m[0]) {
              case "last":
              case "next":
                switch (m[1].substring(0, 3)) {
                  case "yea":
                    now.setFullYear(now.getFullYear() + num);
                    break;
                  case "wee":
                    now.setDate(now.getDate() + num * 7);
                    break;
                  case "day":
                    now.setDate(now.getDate() + num);
                    break;
                  case "hou":
                    now.setHours(now.getHours() + num);
                    break;
                  case "min":
                    now.setMinutes(now.getMinutes() + num);
                    break;
                  case "sec":
                    now.setSeconds(now.getSeconds() + num);
                    break;
                  case "mon":
                    if (m[1] === "month") {
                        now.setMonth(now.getMonth() + num);
                        break;
                    }
                  default:
                    var day = __is.day[m[1].substring(0, 3)];
                    if (typeof day !== "undefined") {
                        var diff = day - now.getDay();
                        if (diff === 0) {
                            diff = 7 * num;
                        } else if (diff > 0) {
                            if (m[0] === "last") {
                                diff -= 7;
                            }
                        } else {
                            if (m[0] === "next") {
                                diff += 7;
                            }
                        }
                        now.setDate(now.getDate() + diff);
                        now.setHours(0, 0, 0, 0);
                    }
                }
                break;
              default:
                if (/\d+/.test(m[0])) {
                    num *= parseInt(m[0], 10);
                    switch (m[1].substring(0, 3)) {
                      case "yea":
                        now.setFullYear(now.getFullYear() + num);
                        break;
                      case "mon":
                        now.setMonth(now.getMonth() + num);
                        break;
                      case "wee":
                        now.setDate(now.getDate() + num * 7);
                        break;
                      case "day":
                        now.setDate(now.getDate() + num);
                        break;
                      case "hou":
                        now.setHours(now.getHours() + num);
                        break;
                      case "min":
                        now.setMinutes(now.getMinutes() + num);
                        break;
                      case "sec":
                        now.setSeconds(now.getSeconds() + num);
                        break;
                    }
                } else {
                    return false;
                }
                break;
            }
            return true;
        };
        match = str.match(/^(\d{2,4}-\d{2}-\d{2})(?:\s(\d{1,2}:\d{2}(:\d{2})?)?(?:\.(\d+))?)?$/);
        if (match !== null) {
            if (!match[2]) {
                match[2] = "00:00:00";
            } else if (!match[3]) {
                match[2] += ":00";
            }
            s = match[1].split(/-/g);
            s[1] = __is.mon[s[1] - 1] || s[1];
            s[0] = +s[0];
            s[0] = s[0] >= 0 && s[0] <= 69 ? "20" + (s[0] < 10 ? "0" + s[0] : s[0] + "") : s[0] >= 70 && s[0] <= 99 ? "19" + s[0] : s[0] + "";
            return parseInt(this.strtotime(s[2] + " " + s[1] + " " + s[0] + " " + match[2]) + (match[4] ? match[4] / 1e3 : ""), 10);
        }
        var regex = "([+-]?\\d+\\s" + "(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?" + "|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday" + "|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday)" + "|(last|next)\\s" + "(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?" + "|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday" + "|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday))" + "(\\sago)?";
        match = str.match(new RegExp(regex, "gi"));
        if (match === null) {
            return false;
        }
        for (i = 0, l = match.length; i < l; i++) {
            if (!process(match[i].split(" "))) {
                return false;
            }
        }
        return now.getTime() / 1e3 | 0;
    };
    Twig.lib.is = function(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    };
    return Twig;
}(Twig || {});
var Twig = function(Twig) {
    "use strict";
    Twig.logic = {};
    Twig.logic.type = {
        if_: "Twig.logic.type.if",
        endif: "Twig.logic.type.endif",
        for_: "Twig.logic.type.for",
        endfor: "Twig.logic.type.endfor",
        else_: "Twig.logic.type.else",
        elseif: "Twig.logic.type.elseif",
        set: "Twig.logic.type.set",
        filter: "Twig.logic.type.filter",
        endfilter: "Twig.logic.type.endfilter",
        block: "Twig.logic.type.block",
        endblock: "Twig.logic.type.endblock",
        extends_: "Twig.logic.type.extends",
        use: "Twig.logic.type.use"
    };
    Twig.logic.definitions = [ {
        type: Twig.logic.type.if_,
        regex: /^if\s+([^\s].+)$/,
        next: [ Twig.logic.type.else_, Twig.logic.type.elseif, Twig.logic.type.endif ],
        open: true,
        compile: function(token) {
            var expression = token.match[1];
            token.stack = Twig.expression.compile.apply(this, [ {
                type: Twig.expression.type.expression,
                value: expression
            } ]).stack;
            delete token.match;
            return token;
        },
        parse: function(token, context, chain) {
            var output = "", result = Twig.expression.parse.apply(this, [ token.stack, context ]);
            chain = true;
            if (result) {
                chain = false;
                output = Twig.parse.apply(this, [ token.output, context ]);
            }
            return {
                chain: chain,
                output: output
            };
        }
    }, {
        type: Twig.logic.type.elseif,
        regex: /^elseif\s+([^\s].*)$/,
        next: [ Twig.logic.type.else_, Twig.logic.type.elseif, Twig.logic.type.endif ],
        open: false,
        compile: function(token) {
            var expression = token.match[1];
            token.stack = Twig.expression.compile.apply(this, [ {
                type: Twig.expression.type.expression,
                value: expression
            } ]).stack;
            delete token.match;
            return token;
        },
        parse: function(token, context, chain) {
            var output = "";
            if (chain && Twig.expression.parse.apply(this, [ token.stack, context ]) === true) {
                chain = false;
                output = Twig.parse.apply(this, [ token.output, context ]);
            }
            return {
                chain: chain,
                output: output
            };
        }
    }, {
        type: Twig.logic.type.else_,
        regex: /^else$/,
        next: [ Twig.logic.type.endif, Twig.logic.type.endfor ],
        open: false,
        parse: function(token, context, chain) {
            var output = "";
            if (chain) {
                output = Twig.parse.apply(this, [ token.output, context ]);
            }
            return {
                chain: chain,
                output: output
            };
        }
    }, {
        type: Twig.logic.type.endif,
        regex: /^endif$/,
        next: [],
        open: false
    }, {
        type: Twig.logic.type.for_,
        regex: /^for\s+([a-zA-Z0-9_,\s]+)\s+in\s+([^\s].+)$/,
        next: [ Twig.logic.type.else_, Twig.logic.type.endfor ],
        open: true,
        compile: function(token) {
            var key_value = token.match[1], expression = token.match[2], kv_split = null, expression_stack = null;
            token.key_var = null;
            token.value_var = null;
            if (key_value.indexOf(",") >= 0) {
                kv_split = key_value.split(",");
                if (kv_split.length === 2) {
                    token.key_var = kv_split[0].trim();
                    token.value_var = kv_split[1].trim();
                } else {
                    throw new Twig.Error("Invalid expression in for loop: " + key_value);
                }
            } else {
                token.value_var = key_value;
            }
            expression_stack = Twig.expression.compile.apply(this, [ {
                type: Twig.expression.type.expression,
                value: expression
            } ]).stack;
            token.expression = expression_stack;
            delete token.match;
            return token;
        },
        parse: function(token, context, continue_chain) {
            var result = Twig.expression.parse.apply(this, [ token.expression, context ]), output = [], key, len, index = 0, keyset, that = this;
            if (result instanceof Array) {
                len = result.length;
                result.forEach(function(value) {
                    context[token.value_var] = value;
                    if (token.key_var) {
                        context[token.key_var] = index;
                    }
                    context.loop = {
                        index: index + 1,
                        index0: index,
                        revindex: len - index,
                        revindex0: len - index - 1,
                        first: index === 0,
                        last: index === len - 1,
                        length: len,
                        parent: context
                    };
                    output.push(Twig.parse.apply(that, [ token.output, context ]));
                    index += 1;
                });
            } else if (result instanceof Object) {
                if (result._keys !== undefined) {
                    keyset = result._keys;
                } else {
                    keyset = Object.keys(result);
                }
                len = keyset.length;
                keyset.forEach(function(key) {
                    if (key === "_keys") return;
                    context.loop = {
                        index: index + 1,
                        index0: index,
                        revindex: len - index,
                        revindex0: len - index - 1,
                        first: index === 0,
                        last: index === len - 1,
                        length: len,
                        parent: context
                    };
                    context[token.value_var] = result[key];
                    if (token.key_var) {
                        context[token.key_var] = key;
                    }
                    output.push(Twig.parse.apply(that, [ token.output, context ]));
                    index += 1;
                });
            }
            continue_chain = output.length === 0;
            return {
                chain: continue_chain,
                output: output.join("")
            };
        }
    }, {
        type: Twig.logic.type.endfor,
        regex: /^endfor$/,
        next: [],
        open: false
    }, {
        type: Twig.logic.type.set,
        regex: /^set\s+([a-zA-Z0-9_,\s]+)\s*=\s*(.+)$/,
        next: [],
        open: true,
        compile: function(token) {
            var key = token.match[1].trim(), expression = token.match[2], expression_stack = Twig.expression.compile.apply(this, [ {
                type: Twig.expression.type.expression,
                value: expression
            } ]).stack;
            token.key = key;
            token.expression = expression_stack;
            delete token.match;
            return token;
        },
        parse: function(token, context, continue_chain) {
            var value = Twig.expression.parse.apply(this, [ token.expression, context ]), key = token.key;
            context[key] = value;
            return {
                chain: continue_chain,
                context: context
            };
        }
    }, {
        type: Twig.logic.type.filter,
        regex: /^filter\s+(.+)$/,
        next: [ Twig.logic.type.endfilter ],
        open: true,
        compile: function(token) {
            var expression = "|" + token.match[1].trim();
            token.stack = Twig.expression.compile.apply(this, [ {
                type: Twig.expression.type.expression,
                value: expression
            } ]).stack;
            delete token.match;
            return token;
        },
        parse: function(token, context, chain) {
            var unfiltered = Twig.parse.apply(this, [ token.output, context ]), stack = [ {
                type: Twig.expression.type.string,
                value: unfiltered
            } ].concat(token.stack);
            var output = Twig.expression.parse.apply(this, [ stack, context ]);
            return {
                chain: chain,
                output: output
            };
        }
    }, {
        type: Twig.logic.type.endfilter,
        regex: /^endfilter$/,
        next: [],
        open: false
    }, {
        type: Twig.logic.type.block,
        regex: /^block\s+([a-zA-Z0-9_]+)$/,
        next: [ Twig.logic.type.endblock ],
        open: true,
        compile: function(token) {
            token.block = token.match[1].trim();
            delete token.match;
            return token;
        },
        parse: function(token, context, chain) {
            var block_output = "", output = "", hasParent = this.blocks[token.block] && this.blocks[token.block].indexOf(Twig.placeholders.parent) > -1;
            if (this.blocks[token.block] === undefined || hasParent) {
                block_output = Twig.expression.parse.apply(this, [ {
                    type: Twig.expression.type.string,
                    value: Twig.parse.apply(this, [ token.output, context ])
                }, context ]);
                if (hasParent) {
                    this.blocks[token.block] = this.blocks[token.block].replace(Twig.placeholders.parent, block_output);
                } else {
                    this.blocks[token.block] = block_output;
                }
            }
            if (this.extend === null) {
                if (this.child.blocks[token.block]) {
                    output = this.child.blocks[token.block];
                } else {
                    output = this.blocks[token.block];
                }
            }
            return {
                chain: chain,
                output: output
            };
        }
    }, {
        type: Twig.logic.type.endblock,
        regex: /^endblock$/,
        next: [],
        open: false
    }, {
        type: Twig.logic.type.extends_,
        regex: /^extends\s+(.+)$/,
        next: [],
        open: true,
        compile: function(token) {
            var expression = token.match[1].trim();
            delete token.match;
            token.stack = Twig.expression.compile.apply(this, [ {
                type: Twig.expression.type.expression,
                value: expression
            } ]).stack;
            return token;
        },
        parse: function(token, context, chain) {
            var file = Twig.expression.parse.apply(this, [ token.stack, context ]);
            this.extend = file;
            return {
                chain: chain,
                output: ""
            };
        }
    }, {
        type: Twig.logic.type.use,
        regex: /^use\s+(.+)$/,
        next: [],
        open: true,
        compile: function(token) {
            var expression = token.match[1].trim();
            delete token.match;
            token.stack = Twig.expression.compile.apply(this, [ {
                type: Twig.expression.type.expression,
                value: expression
            } ]).stack;
            return token;
        },
        parse: function(token, context, chain) {
            var file = Twig.expression.parse.apply(this, [ token.stack, context ]);
            this.importBlocks(file);
            return {
                chain: chain,
                output: ""
            };
        }
    } ];
    Twig.logic.handler = {};
    Twig.logic.extendType = function(type, value) {
        value = value || "Twig.logic.type" + type;
        Twig.logic.type[type] = value;
    };
    Twig.logic.extend = function(definition) {
        if (!definition.type) {
            throw new Twig.Error("Unable to extend logic definition. No type provided for " + definition);
        }
        if (Twig.logic.type[definition.type]) {
            throw new Twig.Error("Unable to extend logic definitions. Type " + definition.type + " is already defined.");
        } else {
            Twig.logic.extendType(definition.type);
        }
        Twig.logic.handler[definition.type] = definition;
    };
    while (Twig.logic.definitions.length > 0) {
        Twig.logic.extend(Twig.logic.definitions.shift());
    }
    Twig.logic.compile = function(raw_token) {
        var expression = raw_token.value.trim(), token = Twig.logic.tokenize.apply(this, [ expression ]), token_template = Twig.logic.handler[token.type];
        if (token_template.compile) {
            token = token_template.compile.apply(this, [ token ]);
            Twig.log.trace("Twig.logic.compile: ", "Compiled logic token to ", token);
        }
        return token;
    };
    Twig.logic.tokenize = function(expression) {
        var token = {}, token_template_type = null, token_type = null, token_regex = null, regex_array = null, regex = null, match = null;
        expression = expression.trim();
        for (token_template_type in Twig.logic.handler) {
            if (Twig.logic.handler.hasOwnProperty(token_template_type)) {
                token_type = Twig.logic.handler[token_template_type].type;
                token_regex = Twig.logic.handler[token_template_type].regex;
                regex_array = [];
                if (token_regex instanceof Array) {
                    regex_array = token_regex;
                } else {
                    regex_array.push(token_regex);
                }
                while (regex_array.length > 0) {
                    regex = regex_array.shift();
                    match = regex.exec(expression.trim());
                    if (match !== null) {
                        token.type = token_type;
                        token.match = match;
                        Twig.log.trace("Twig.logic.tokenize: ", "Matched a ", token_type, " regular expression of ", match);
                        return token;
                    }
                }
            }
        }
        throw new Twig.Error("Unable to parse '" + expression.trim() + "'");
    };
    Twig.logic.parse = function(token, context, chain) {
        var output = "", token_template;
        context = context || {};
        Twig.log.debug("Twig.logic.parse: ", "Parsing logic token ", token);
        token_template = Twig.logic.handler[token.type];
        if (token_template.parse) {
            output = token_template.parse.apply(this, [ token, context, chain ]);
        }
        return output;
    };
    return Twig;
}(Twig || {});
var Twig = function(Twig) {
    "use strict";
    Twig.expression = {};
    Twig.expression.reservedWords = [ "true", "false", "null" ];
    Twig.expression.type = {
        comma: "Twig.expression.type.comma",
        expression: "Twig.expression.type.expression",
        operator: {
            unary: "Twig.expression.type.operator.unary",
            binary: "Twig.expression.type.operator.binary"
        },
        string: "Twig.expression.type.string",
        bool: "Twig.expression.type.bool",
        array: {
            start: "Twig.expression.type.array.start",
            end: "Twig.expression.type.array.end"
        },
        object: {
            start: "Twig.expression.type.object.start",
            end: "Twig.expression.type.object.end"
        },
        parameter: {
            start: "Twig.expression.type.parameter.start",
            end: "Twig.expression.type.parameter.end"
        },
        key: {
            period: "Twig.expression.type.key.period",
            brackets: "Twig.expression.type.key.brackets"
        },
        filter: "Twig.expression.type.filter",
        _function: "Twig.expression.type._function",
        variable: "Twig.expression.type.variable",
        number: "Twig.expression.type.number",
        _null: "Twig.expression.type.null",
        test: "Twig.expression.type.test"
    };
    Twig.expression.set = {
        operations: [ Twig.expression.type.filter, Twig.expression.type.operator.unary, Twig.expression.type.operator.binary, Twig.expression.type.array.end, Twig.expression.type.object.end, Twig.expression.type.parameter.end, Twig.expression.type.comma, Twig.expression.type.test ],
        expressions: [ Twig.expression.type._function, Twig.expression.type.expression, Twig.expression.type.bool, Twig.expression.type.string, Twig.expression.type.variable, Twig.expression.type.number, Twig.expression.type._null, Twig.expression.type.array.start, Twig.expression.type.object.start ]
    };
    Twig.expression.set.operations_extended = Twig.expression.set.operations.concat([ Twig.expression.type.key.period, Twig.expression.type.key.brackets ]);
    Twig.expression.fn = {
        compile: {
            push: function(token, stack, output) {
                output.push(token);
            },
            push_both: function(token, stack, output) {
                output.push(token);
                stack.push(token);
            }
        },
        parse: {
            push: function(token, stack, context) {
                stack.push(token);
            },
            push_value: function(token, stack, context) {
                stack.push(token.value);
            }
        }
    };
    Twig.expression.definitions = [ {
        type: Twig.expression.type.test,
        regex: /^is\s+(not)?\s*([a-zA-Z_][a-zA-Z0-9_]*)/,
        next: Twig.expression.set.operations.concat([ Twig.expression.type.parameter.start ]),
        compile: function(token, stack, output) {
            token.filter = token.match[2];
            token.modifier = token.match[1];
            delete token.match;
            delete token.value;
            output.push(token);
        },
        parse: function(token, stack, context) {
            var value = stack.pop(), params = token.params && Twig.expression.parse.apply(this, [ token.params, context ]), result = Twig.test(token.filter, value, params);
            if (token.modifier == "not") {
                stack.push(!result);
            } else {
                stack.push(result);
            }
        }
    }, {
        type: Twig.expression.type.comma,
        regex: /^,/,
        next: Twig.expression.set.expressions,
        compile: function(token, stack, output) {
            var i = stack.length - 1, stack_token;
            delete token.match;
            delete token.value;
            for (; i >= 0; i--) {
                stack_token = stack.pop();
                if (stack_token.type === Twig.expression.type.object.start || stack_token.type === Twig.expression.type.parameter.start || stack_token.type === Twig.expression.type.array.start) {
                    stack.push(stack_token);
                    break;
                }
                output.push(stack_token);
            }
            output.push(token);
        }
    }, {
        type: Twig.expression.type.expression,
        regex: /^\(([^\)]+)\)/,
        next: Twig.expression.set.operations_extended,
        compile: function(token, stack, output) {
            token.value = token.match[1];
            var sub_stack = Twig.expression.compile(token).stack;
            while (sub_stack.length > 0) {
                output.push(sub_stack.shift());
            }
        }
    }, {
        type: Twig.expression.type.operator.binary,
        regex: /(^[\+\-~%\?\:]|^[!=]==?|^[!<>]=?|^\*\*?|^\/\/?|^and\s+|^or\s+|^in\s+|^not in\s+|^\.\.)/,
        next: Twig.expression.set.expressions.concat([ Twig.expression.type.operator.unary ]),
        compile: function(token, stack, output) {
            delete token.match;
            token.value = token.value.trim();
            var value = token.value, operator = Twig.expression.operator.lookup(value, token);
            Twig.log.trace("Twig.expression.compile: ", "Operator: ", operator, " from ", value);
            while (stack.length > 0 && (stack[stack.length - 1].type == Twig.expression.type.operator.unary || stack[stack.length - 1].type == Twig.expression.type.operator.binary) && (operator.associativity === Twig.expression.operator.leftToRight && operator.precidence >= stack[stack.length - 1].precidence || operator.associativity === Twig.expression.operator.rightToLeft && operator.precidence > stack[stack.length - 1].precidence)) {
                var temp = stack.pop();
                output.push(temp);
            }
            if (value === ":") {
                if (stack[stack.length - 1] && stack[stack.length - 1].value === "?") {} else {
                    var key_token = output.pop();
                    if (key_token.type !== Twig.expression.type.string) {
                        throw new Twig.Error("Unexpected value before ':' of " + key_token.type + " = " + key_token.value);
                    }
                    token.key = key_token.value;
                    output.push(token);
                    return;
                }
            } else {
                stack.push(operator);
            }
        },
        parse: function(token, stack, context) {
            if (token.key) {
                stack.push(token);
            } else {
                Twig.expression.operator.parse(token.value, stack);
            }
        }
    }, {
        type: Twig.expression.type.operator.unary,
        regex: /(^not)/,
        next: Twig.expression.set.expressions,
        compile: function(token, stack, output) {
            delete token.match;
            var value = token.value.trim(), operator = Twig.expression.operator.lookup(value, token);
            Twig.log.trace("Twig.expression.compile: ", "Operator: ", operator, " from ", value);
            while (stack.length > 0 && (stack[stack.length - 1].type == Twig.expression.type.operator.unary || stack[stack.length - 1].type == Twig.expression.type.operator.binary) && (operator.associativity === Twig.expression.operator.leftToRight && operator.precidence >= stack[stack.length - 1].precidence || operator.associativity === Twig.expression.operator.rightToLeft && operator.precidence > stack[stack.length - 1].precidence)) {
                var temp = stack.pop();
                output.push(temp);
            }
            stack.push(operator);
        },
        parse: function(token, stack, context) {
            Twig.expression.operator.parse(token.value, stack);
        }
    }, {
        type: Twig.expression.type.string,
        regex: /^(["'])(?:(?=(\\?))\2.)*?\1/,
        next: Twig.expression.set.operations,
        compile: function(token, stack, output) {
            var value = token.value;
            delete token.match;
            if (value.substring(0, 1) === '"') {
                value = value.replace('\\"', '"');
            } else {
                value = value.replace("\\'", "'");
            }
            token.value = value.substring(1, value.length - 1);
            Twig.log.trace("Twig.expression.compile: ", "String value: ", token.value);
            output.push(token);
        },
        parse: Twig.expression.fn.parse.push_value
    }, {
        type: Twig.expression.type.parameter.start,
        regex: /^\(/,
        next: Twig.expression.set.expressions.concat([ Twig.expression.type.parameter.end ]),
        compile: Twig.expression.fn.compile.push_both,
        parse: Twig.expression.fn.parse.push
    }, {
        type: Twig.expression.type.parameter.end,
        regex: /^\)/,
        next: Twig.expression.set.operations_extended,
        compile: function(token, stack, output) {
            var stack_token;
            stack_token = stack.pop();
            while (stack.length > 0 && stack_token.type != Twig.expression.type.parameter.start) {
                output.push(stack_token);
                stack_token = stack.pop();
            }
            var param_stack = [];
            while (token.type !== Twig.expression.type.parameter.start) {
                param_stack.unshift(token);
                token = output.pop();
            }
            param_stack.unshift(token);
            token = output.pop();
            if (token.type !== Twig.expression.type._function && token.type !== Twig.expression.type.filter && token.type !== Twig.expression.type.test && token.type !== Twig.expression.type.key.brackets && token.type !== Twig.expression.type.key.period) {
                throw new Twig.Error("Expected filter or function before parameters, got " + token.type);
            }
            token.params = param_stack;
            output.push(token);
        },
        parse: function(token, stack, context) {
            var new_array = [], array_ended = false, value = null;
            while (stack.length > 0) {
                value = stack.pop();
                if (value && value.type && value.type == Twig.expression.type.parameter.start) {
                    array_ended = true;
                    break;
                }
                new_array.unshift(value);
            }
            if (!array_ended) {
                throw new Twig.Error("Expected end of parameter set.");
            }
            stack.push(new_array);
        }
    }, {
        type: Twig.expression.type.array.start,
        regex: /^\[/,
        next: Twig.expression.set.expressions.concat([ Twig.expression.type.array.end ]),
        compile: Twig.expression.fn.compile.push_both,
        parse: Twig.expression.fn.parse.push
    }, {
        type: Twig.expression.type.array.end,
        regex: /^\]/,
        next: Twig.expression.set.operations_extended,
        compile: function(token, stack, output) {
            var i = stack.length - 1, stack_token;
            for (; i >= 0; i--) {
                stack_token = stack.pop();
                if (stack_token.type === Twig.expression.type.array.start) {
                    break;
                }
                output.push(stack_token);
            }
            output.push(token);
        },
        parse: function(token, stack, context) {
            var new_array = [], array_ended = false, value = null;
            while (stack.length > 0) {
                value = stack.pop();
                if (value.type && value.type == Twig.expression.type.array.start) {
                    array_ended = true;
                    break;
                }
                new_array.unshift(value);
            }
            if (!array_ended) {
                throw new Twig.Error("Expected end of array.");
            }
            stack.push(new_array);
        }
    }, {
        type: Twig.expression.type.object.start,
        regex: /^\{/,
        next: Twig.expression.set.expressions.concat([ Twig.expression.type.object.end ]),
        compile: Twig.expression.fn.compile.push_both,
        parse: Twig.expression.fn.parse.push
    }, {
        type: Twig.expression.type.object.end,
        regex: /^\}/,
        next: Twig.expression.set.operations_extended,
        compile: function(token, stack, output) {
            var i = stack.length - 1, stack_token;
            for (; i >= 0; i--) {
                stack_token = stack.pop();
                if (stack_token && stack_token.type === Twig.expression.type.object.start) {
                    break;
                }
                output.push(stack_token);
            }
            output.push(token);
        },
        parse: function(end_token, stack, context) {
            var new_object = {}, object_ended = false, token = null, token_key = null, has_value = false, value = null;
            while (stack.length > 0) {
                token = stack.pop();
                if (token && token.type && token.type === Twig.expression.type.object.start) {
                    object_ended = true;
                    break;
                }
                if (token && token.type && (token.type === Twig.expression.type.operator.binary || token.type === Twig.expression.type.operator.unary) && token.key) {
                    if (!has_value) {
                        throw new Twig.Error("Missing value for key '" + token.key + "' in object definition.");
                    }
                    new_object[token.key] = value;
                    if (new_object._keys === undefined) new_object._keys = [];
                    new_object._keys.unshift(token.key);
                    value = null;
                    has_value = false;
                } else {
                    has_value = true;
                    value = token;
                }
            }
            if (!object_ended) {
                throw new Twig.Error("Unexpected end of object.");
            }
            stack.push(new_object);
        }
    }, {
        type: Twig.expression.type.filter,
        regex: /^\|\s?([a-zA-Z_][a-zA-Z0-9_\-]*)/,
        next: Twig.expression.set.operations_extended.concat([ Twig.expression.type.parameter.start ]),
        compile: function(token, stack, output) {
            token.value = token.match[1];
            output.push(token);
        },
        parse: function(token, stack, context) {
            var input = stack.pop(), params = token.params && Twig.expression.parse.apply(this, [ token.params, context ]);
            stack.push(Twig.filter.apply(this, [ token.value, input, params ]));
        }
    }, {
        type: Twig.expression.type._function,
        regex: /^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/,
        next: Twig.expression.type.parameter.start,
        transform: function(match, tokens) {
            return "(";
        },
        compile: function(token, stack, output) {
            var fn = token.match[1];
            token.fn = fn;
            delete token.match;
            delete token.value;
            output.push(token);
        },
        parse: function(token, stack, context) {
            var params = token.params && Twig.expression.parse.apply(this, [ token.params, context ]), fn = token.fn, value;
            if (Twig.functions[fn]) {
                value = Twig.functions[fn].apply(this, params);
            } else if (typeof context[fn] == "function") {
                value = context[fn].apply(context, params);
            } else {
                throw new Twig.Error(fn + " function does not exist and is not defined in the context");
            }
            stack.push(value);
        }
    }, {
        type: Twig.expression.type.variable,
        regex: /^[a-zA-Z_][a-zA-Z0-9_]*/,
        next: Twig.expression.set.operations_extended.concat([ Twig.expression.type.parameter.start ]),
        compile: Twig.expression.fn.compile.push,
        validate: function(match, tokens) {
            return Twig.expression.reservedWords.indexOf(match[0]) == -1;
        },
        parse: function(token, stack, context) {
            var value = Twig.expression.resolve(context[token.value], context);
            stack.push(value);
        }
    }, {
        type: Twig.expression.type.key.period,
        regex: /^\.([a-zA-Z_][a-zA-Z0-9_]*)/,
        next: Twig.expression.set.operations_extended.concat([ Twig.expression.type.parameter.start ]),
        compile: function(token, stack, output) {
            token.key = token.match[1];
            delete token.match;
            delete token.value;
            output.push(token);
        },
        parse: function(token, stack, context) {
            var params = token.params && Twig.expression.parse.apply(this, [ token.params, context ]), key = token.key, object = stack.pop(), value;
            if (object === null || object === undefined) {
                if (this.options.strict_variables) {
                    throw new Twig.Error("Can't access a key " + key + " on an null or undefined object.");
                } else {
                    return null;
                }
            }
            var capitalize = function(value) {
                return value.substr(0, 1).toUpperCase() + value.substr(1);
            };
            if (typeof object === "object" && key in object) {
                value = object[key];
            } else if (object["get" + capitalize(key)] !== undefined) {
                value = object["get" + capitalize(key)];
            } else if (object["is" + capitalize(key)] !== undefined) {
                value = object["is" + capitalize(key)];
            } else {
                value = null;
            }
            stack.push(Twig.expression.resolve(value, object, params));
        }
    }, {
        type: Twig.expression.type.key.brackets,
        regex: /^\[([^\]]*)\]/,
        next: Twig.expression.set.operations_extended.concat([ Twig.expression.type.parameter.start ]),
        compile: function(token, stack, output) {
            var match = token.match[1];
            delete token.value;
            delete token.match;
            token.stack = Twig.expression.compile({
                value: match
            }).stack;
            output.push(token);
        },
        parse: function(token, stack, context) {
            var params = token.params && Twig.expression.parse.apply(this, [ token.params, context ]), key = Twig.expression.parse.apply(this, [ token.stack, context ]), object = stack.pop(), value;
            if (object === null || object === undefined) {
                if (this.options.strict_variables) {
                    throw new Twig.Error("Can't access a key " + key + " on an null or undefined object.");
                } else {
                    return null;
                }
            }
            if (typeof object === "object" && key in object) {
                value = object[key];
            } else {
                value = null;
            }
            stack.push(Twig.expression.resolve(value, object, params));
        }
    }, {
        type: Twig.expression.type._null,
        regex: /^null/,
        next: Twig.expression.set.operations,
        compile: function(token, stack, output) {
            delete token.match;
            token.value = null;
            output.push(token);
        },
        parse: Twig.expression.fn.parse.push_value
    }, {
        type: Twig.expression.type.number,
        regex: /^\-?\d+(\.\d+)?/,
        next: Twig.expression.set.operations,
        compile: function(token, stack, output) {
            token.value = Number(token.value);
            output.push(token);
        },
        parse: Twig.expression.fn.parse.push_value
    }, {
        type: Twig.expression.type.bool,
        regex: /^(true|false)/,
        next: Twig.expression.set.operations,
        compile: function(token, stack, output) {
            token.value = token.match[0] == "true";
            delete token.match;
            output.push(token);
        },
        parse: Twig.expression.fn.parse.push_value
    } ];
    Twig.expression.resolve = function(value, context, params) {
        if (typeof value == "function") {
            return value.apply(context, params || []);
        } else {
            return value;
        }
    };
    Twig.expression.handler = {};
    Twig.expression.extendType = function(type) {
        Twig.expression.type[type] = "Twig.expression.type." + type;
    };
    Twig.expression.extend = function(definition) {
        if (!definition.type) {
            throw new Twig.Error("Unable to extend logic definition. No type provided for " + definition);
        }
        Twig.expression.handler[definition.type] = definition;
    };
    while (Twig.expression.definitions.length > 0) {
        Twig.expression.extend(Twig.expression.definitions.shift());
    }
    Twig.expression.tokenize = function(expression) {
        var tokens = [], exp_offset = 0, next = null, type, regex, regex_array, token_next, match_found, invalid_matches = [], match_function;
        match_function = function() {
            var match = Array.prototype.slice.apply(arguments), string = match.pop(), offset = match.pop();
            Twig.log.trace("Twig.expression.tokenize", "Matched a ", type, " regular expression of ", match);
            if (next && next.indexOf(type) < 0) {
                invalid_matches.push(type + " cannot follow a " + tokens[tokens.length - 1].type + " at template:" + exp_offset + " near '" + match[0].substring(0, 20) + "...'");
                return match[0];
            }
            if (Twig.expression.handler[type].validate && !Twig.expression.handler[type].validate(match, tokens)) {
                return match[0];
            }
            invalid_matches = [];
            tokens.push({
                type: type,
                value: match[0],
                match: match
            });
            match_found = true;
            next = token_next;
            exp_offset += match[0].length;
            if (Twig.expression.handler[type].transform) {
                return Twig.expression.handler[type].transform(match, tokens);
            }
            return "";
        };
        Twig.log.debug("Twig.expression.tokenize", "Tokenizing expression ", expression);
        while (expression.length > 0) {
            expression = expression.trim();
            for (type in Twig.expression.handler) {
                if (Twig.expression.handler.hasOwnProperty(type)) {
                    token_next = Twig.expression.handler[type].next;
                    regex = Twig.expression.handler[type].regex;
                    if (regex instanceof Array) {
                        regex_array = regex;
                    } else {
                        regex_array = [ regex ];
                    }
                    match_found = false;
                    while (regex_array.length > 0) {
                        regex = regex_array.pop();
                        expression = expression.replace(regex, match_function);
                    }
                    if (match_found) {
                        break;
                    }
                }
            }
            if (!match_found) {
                if (invalid_matches.length > 0) {
                    throw new Twig.Error(invalid_matches.join(" OR "));
                } else {
                    throw new Twig.Error("Unable to parse '" + expression + "' at template position" + exp_offset);
                }
            }
        }
        Twig.log.trace("Twig.expression.tokenize", "Tokenized to ", tokens);
        return tokens;
    };
    Twig.expression.compile = function(raw_token) {
        var expression = raw_token.value, tokens = Twig.expression.tokenize(expression), token = null, output = [], stack = [], token_template = null;
        Twig.log.trace("Twig.expression.compile: ", "Compiling ", expression);
        while (tokens.length > 0) {
            token = tokens.shift();
            token_template = Twig.expression.handler[token.type];
            Twig.log.trace("Twig.expression.compile: ", "Compiling ", token);
            token_template.compile && token_template.compile(token, stack, output);
            Twig.log.trace("Twig.expression.compile: ", "Stack is", stack);
            Twig.log.trace("Twig.expression.compile: ", "Output is", output);
        }
        while (stack.length > 0) {
            output.push(stack.pop());
        }
        Twig.log.trace("Twig.expression.compile: ", "Final output is", output);
        raw_token.stack = output;
        delete raw_token.value;
        return raw_token;
    };
    Twig.expression.parse = function(tokens, context) {
        var that = this;
        if (!(tokens instanceof Array)) {
            tokens = [ tokens ];
        }
        var stack = [], token_template = null;
        tokens.forEach(function(token) {
            token_template = Twig.expression.handler[token.type];
            token_template.parse && token_template.parse.apply(that, [ token, stack, context ]);
        });
        return stack.pop();
    };
    return Twig;
}(Twig || {});
var Twig = function(Twig) {
    "use strict";
    Twig.expression.operator = {
        leftToRight: "leftToRight",
        rightToLeft: "rightToLeft"
    };
    Twig.expression.operator.lookup = function(operator, token) {
        switch (operator) {
          case "..":
          case "not in":
          case "in":
            token.precidence = 20;
            token.associativity = Twig.expression.operator.leftToRight;
            break;
          case ",":
            token.precidence = 18;
            token.associativity = Twig.expression.operator.leftToRight;
            break;
          case "?":
          case ":":
            token.precidence = 16;
            token.associativity = Twig.expression.operator.rightToLeft;
            break;
          case "or":
            token.precidence = 14;
            token.associativity = Twig.expression.operator.leftToRight;
            break;
          case "and":
            token.precidence = 13;
            token.associativity = Twig.expression.operator.leftToRight;
            break;
          case "==":
          case "!=":
            token.precidence = 9;
            token.associativity = Twig.expression.operator.leftToRight;
            break;
          case "<":
          case "<=":
          case ">":
          case ">=":
            token.precidence = 8;
            token.associativity = Twig.expression.operator.leftToRight;
            break;
          case "~":
          case "+":
          case "-":
            token.precidence = 6;
            token.associativity = Twig.expression.operator.leftToRight;
            break;
          case "//":
          case "**":
          case "*":
          case "/":
          case "%":
            token.precidence = 5;
            token.associativity = Twig.expression.operator.leftToRight;
            break;
          case "not":
            token.precidence = 3;
            token.associativity = Twig.expression.operator.rightToLeft;
            break;
          default:
            throw new Twig.Error(operator + " is an unknown operator.");
        }
        token.operator = operator;
        return token;
    };
    Twig.expression.operator.parse = function(operator, stack) {
        Twig.log.trace("Twig.expression.operator.parse: ", "Handling ", operator);
        var a, b, c;
        switch (operator) {
          case ":":
            break;
          case "?":
            c = stack.pop();
            b = stack.pop();
            a = stack.pop();
            if (a) {
                stack.push(b);
            } else {
                stack.push(c);
            }
            break;
          case "+":
            b = parseFloat(stack.pop());
            a = parseFloat(stack.pop());
            stack.push(a + b);
            break;
          case "-":
            b = parseFloat(stack.pop());
            a = parseFloat(stack.pop());
            stack.push(a - b);
            break;
          case "*":
            b = parseFloat(stack.pop());
            a = parseFloat(stack.pop());
            stack.push(a * b);
            break;
          case "/":
            b = parseFloat(stack.pop());
            a = parseFloat(stack.pop());
            stack.push(a / b);
            break;
          case "//":
            b = parseFloat(stack.pop());
            a = parseFloat(stack.pop());
            stack.push(parseInt(a / b));
            break;
          case "%":
            b = parseFloat(stack.pop());
            a = parseFloat(stack.pop());
            stack.push(a % b);
            break;
          case "~":
            b = stack.pop();
            a = stack.pop();
            stack.push((a !== undefined ? a.toString() : "") + (b !== undefined ? b.toString() : ""));
            break;
          case "not":
          case "!":
            stack.push(!stack.pop());
            break;
          case "<":
            b = stack.pop();
            a = stack.pop();
            stack.push(a < b);
            break;
          case "<=":
            b = stack.pop();
            a = stack.pop();
            stack.push(a <= b);
            break;
          case ">":
            b = stack.pop();
            a = stack.pop();
            stack.push(a > b);
            break;
          case ">=":
            b = stack.pop();
            a = stack.pop();
            stack.push(a >= b);
            break;
          case "===":
            b = stack.pop();
            a = stack.pop();
            stack.push(a === b);
            break;
          case "==":
            b = stack.pop();
            a = stack.pop();
            stack.push(a == b);
            break;
          case "!==":
            b = stack.pop();
            a = stack.pop();
            stack.push(a !== b);
            break;
          case "!=":
            b = stack.pop();
            a = stack.pop();
            stack.push(a != b);
            break;
          case "or":
            b = stack.pop();
            a = stack.pop();
            stack.push(a || b);
            break;
          case "and":
            b = stack.pop();
            a = stack.pop();
            stack.push(a && b);
            break;
          case "**":
            b = stack.pop();
            a = stack.pop();
            stack.push(Math.pow(a, b));
            break;
          case "not in":
            b = stack.pop();
            a = stack.pop();
            stack.push(!containment(a, b));
            break;
          case "in":
            b = stack.pop();
            a = stack.pop();
            stack.push(containment(a, b));
            break;
          case "..":
            b = stack.pop();
            a = stack.pop();
            stack.push(Twig.functions.range(a, b));
            break;
          default:
            throw new Twig.Error(operator + " is an unknown operator.");
        }
    };
    var containment = function(a, b) {
        if (b.indexOf != undefined) {
            return b.indexOf(a) > -1;
        } else {
            var el;
            for (el in b) {
                if (b.hasOwnProperty(el) && b[el] === a) {
                    return true;
                }
            }
            return false;
        }
    };
    return Twig;
}(Twig || {});
var Twig = function(Twig) {
    function is(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }
    Twig.filters = {
        upper: function(value) {
            return value.toUpperCase();
        },
        lower: function(value) {
            return value.toLowerCase();
        },
        capitalize: function(value) {
            return value.substr(0, 1).toUpperCase() + value.substr(1);
        },
        title: function(value) {
            return value.replace(/(^|\s)([a-z])/g, function(m, p1, p2) {
                return p1 + p2.toUpperCase();
            });
        },
        length: function(value) {
            if (value instanceof Array || typeof value === "string") {
                return value.length;
            } else if (value instanceof Object) {
                if (value._keys === undefined) {
                    return Object.keys(value).length;
                } else {
                    return value._keys.length;
                }
            }
        },
        reverse: function(value) {
            if (is("Array", value)) {
                return value.reverse();
            } else if (is("String", value)) {
                return value.split("").reverse().join("");
            } else {
                var keys = value._keys || Object.keys(value).reverse();
                value._keys = keys;
                return value;
            }
        },
        sort: function(value) {
            if (is("Array", value)) {
                return value.sort();
            } else if (value instanceof Object) {
                delete value._keys;
                var keys = Object.keys(value), sorted_keys = keys.sort(function(a, b) {
                    return value[a] > value[b];
                });
                value._keys = sorted_keys;
                return value;
            }
        },
        keys: function(value) {
            var keyset = value._keys || Object.keys(value), output = [];
            keyset.forEach(function(key) {
                if (key === "_keys") return;
                if (value.hasOwnProperty(key)) {
                    output.push(key);
                }
            });
            return output;
        },
        url_encode: function(value) {
            return encodeURIComponent(value);
        },
        join: function(value, params) {
            var join_str = "", output = [], keyset = null;
            if (params && params[0]) {
                join_str = params[0];
            }
            if (value instanceof Array) {
                output = value;
            } else {
                keyset = value._keys || Object.keys(value);
                keyset.forEach(function(key) {
                    if (key === "_keys") return;
                    if (value.hasOwnProperty(key)) {
                        output.push(value[key]);
                    }
                });
            }
            return output.join(join_str);
        },
        "default": function(value, params) {
            if (params === undefined || params.length !== 1) {
                throw new Twig.Error("default filter expects one argument");
            }
            if (value === undefined || value === null || value === "") {
                return params[0];
            } else {
                return value;
            }
        },
        json_encode: function(value) {
            delete value._keys;
            return JSON.stringify(value);
        },
        merge: function(value, params) {
            var obj = [], arr_index = 0, keyset = [];
            if (!(value instanceof Array)) {
                obj = {};
            } else {
                params.forEach(function(param) {
                    if (!(param instanceof Array)) {
                        obj = {};
                    }
                });
            }
            if (!(obj instanceof Array)) {
                obj._keys = [];
            }
            if (value instanceof Array) {
                value.forEach(function(val) {
                    if (obj._keys) obj._keys.unshift(arr_index);
                    obj[arr_index] = val;
                    arr_index++;
                });
            } else {
                keyset = value._keys || Object.keys(value);
                keyset.forEach(function(key) {
                    obj[key] = value[key];
                    obj._keys.push(key);
                    var int_key = parseInt(key, 10);
                    if (!isNaN(int_key) && int_key >= arr_index) {
                        arr_index = int_key + 1;
                    }
                });
            }
            params.forEach(function(param) {
                if (param instanceof Array) {
                    param.forEach(function(val) {
                        if (obj._keys) obj._keys.push(arr_index);
                        obj[arr_index] = val;
                        arr_index++;
                    });
                } else {
                    keyset = param._keys || Object.keys(param);
                    keyset.forEach(function(key) {
                        if (!obj[key]) obj._keys.unshift(key);
                        obj[key] = param[key];
                        var int_key = parseInt(key, 10);
                        if (!isNaN(int_key) && int_key >= arr_index) {
                            arr_index = int_key + 1;
                        }
                    });
                }
            });
            if (params.length === 0) {
                throw new Twig.Error("Filter merge expects at least one parameter");
            }
            return obj;
        },
        date: function(value, params) {
            var date = new Date(value);
            if (date.getDate() === NaN) {
                date.setFromString(value);
            }
            return date.format(params[0]);
        },
        replace: function(value, params) {
            var pairs = params[0], tag;
            for (tag in pairs) {
                if (pairs.hasOwnProperty(tag) && tag !== "_keys") {
                    value = value.replace(tag, pairs[tag]);
                }
            }
            return value;
        },
        format: function(value, params) {
            return Twig.lib.vsprintf(value, params);
        },
        striptags: function(value) {
            return Twig.lib.strip_tags(value);
        },
        escape: function(value) {
            return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        },
        e: function(value) {
            return Twig.filters.escape(value);
        },
        nl2br: function(value) {
            var br = "<br />";
            return Twig.filters.escape(value).replace(/\r\n/g, br).replace(/\r/g, br).replace(/\n/g, br);
        },
        number_format: function(value, params) {
            var number = value;
            if (params instanceof Array) {
                var decimals = params[0] ? params[0] : undefined, dec_point = params[1] ? params[1] : undefined, thousands_sep = params[2] ? params[2] : undefined;
            }
            number = (number + "").replace(/[^0-9+\-Ee.]/g, "");
            var n = !isFinite(+number) ? 0 : +number, prec = !isFinite(+decimals) ? 0 : Math.abs(decimals), sep = typeof thousands_sep === "undefined" ? "," : thousands_sep, dec = typeof dec_point === "undefined" ? "." : dec_point, s = "", toFixedFix = function(n, prec) {
                var k = Math.pow(10, prec);
                return "" + Math.round(n * k) / k;
            };
            s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");
            if (s[0].length > 3) {
                s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
            }
            if ((s[1] || "").length < prec) {
                s[1] = s[1] || "";
                s[1] += (new Array(prec - s[1].length + 1)).join("0");
            }
            return s.join(dec);
        },
        trim: function(value, params) {
            var str = value;
            var whitespace = " \n\r	\f            ​\u2028\u2029　";
            for (var i = 0; i < str.length; i++) {
                if (whitespace.indexOf(str.charAt(i)) === -1) {
                    str = str.substring(i);
                    break;
                }
            }
            for (i = str.length - 1; i >= 0; i--) {
                if (whitespace.indexOf(str.charAt(i)) === -1) {
                    str = str.substring(0, i + 1);
                    break;
                }
            }
            return whitespace.indexOf(str.charAt(0)) === -1 ? str : "";
        }
    };
    Twig.filter = function(filter, value, params) {
        if (!Twig.filters[filter]) {
            throw "Unable to find filter " + filter;
        }
        return Twig.filters[filter].apply(this, [ value, params ]);
    };
    Twig.filter.extend = function(filter, definition) {
        Twig.filters[filter] = definition;
    };
    return Twig;
}(Twig || {});
var Twig = function(Twig) {
    function is(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }
    Twig.functions = {
        range: function(low, high, step) {
            var matrix = [];
            var inival, endval, plus;
            var walker = step || 1;
            var chars = false;
            if (!isNaN(low) && !isNaN(high)) {
                inival = parseInt(low);
                endval = parseInt(high);
            } else if (isNaN(low) && isNaN(high)) {
                chars = true;
                inival = low.charCodeAt(0);
                endval = high.charCodeAt(0);
            } else {
                inival = isNaN(low) ? 0 : low;
                endval = isNaN(high) ? 0 : high;
            }
            plus = inival > endval ? false : true;
            if (plus) {
                while (inival <= endval) {
                    matrix.push(chars ? String.fromCharCode(inival) : inival);
                    inival += walker;
                }
            } else {
                while (inival >= endval) {
                    matrix.push(chars ? String.fromCharCode(inival) : inival);
                    inival -= walker;
                }
            }
            return matrix;
        },
        cycle: function(arr, i) {
            var pos = i % arr.length;
            return arr[pos];
        },
        dump: function() {
            var EOL = "\n", indentChar = "  ", indentTimes = 0, out = "", args = Array.prototype.slice.call(arguments), indent = function(times) {
                var ind = "";
                while (times > 0) {
                    times--;
                    ind += indentChar;
                }
                return ind;
            }, displayVar = function(variable) {
                out += indent(indentTimes);
                if (typeof variable === "object") {
                    dumpVar(variable);
                } else if (typeof variable === "function") {
                    out += "function()" + EOL;
                } else if (typeof variable === "string") {
                    out += "string(" + variable.length + ') "' + variable + '"' + EOL;
                } else if (typeof variable === "number") {
                    out += "number(" + variable + ")" + EOL;
                } else if (typeof variable === "boolean") {
                    out += "bool(" + variable + ")" + EOL;
                }
            }, dumpVar = function(variable) {
                var i;
                if (variable === null) {
                    out += "NULL" + EOL;
                } else if (variable === undefined) {
                    out += "undefined" + EOL;
                } else if (typeof variable === "object") {
                    out += indent(indentTimes) + typeof variable;
                    indentTimes++;
                    out += "(" + function(obj) {
                        var size = 0, key;
                        for (key in obj) {
                            if (obj.hasOwnProperty(key)) {
                                size++;
                            }
                        }
                        return size;
                    }(variable) + ") {" + EOL;
                    for (i in variable) {
                        out += indent(indentTimes) + "[" + i + "]=> " + EOL;
                        displayVar(variable[i]);
                    }
                    indentTimes--;
                    out += indent(indentTimes) + "}" + EOL;
                } else {
                    displayVar(variable);
                }
            };
            if (args.length == 0) args.push(this.context);
            args.forEach(function(variable) {
                dumpVar(variable);
            });
            return out;
        },
        date: function(date, time) {
            var dateObj;
            if (date == undefined) {
                dateObj = new Date;
            } else if (Twig.lib.is("Date", date)) {
                dateObj = date;
            } else if (Twig.lib.is("String", date)) {
                dateObj = new Date(Twig.lib.strtotime(date) * 1e3, new Date);
            } else if (Twig.lib.is("Number", date)) {
                dateObj = new Date(date * 1e3);
            } else {
                throw new Twig.Error("Unable to parse date " + date);
            }
            return dateObj;
        },
        parent: function() {
            return Twig.placeholders.parent;
        }
    };
    Twig._function = function(_function, value, params) {
        if (!Twig.functions[_function]) {
            throw "Unable to find function " + _function;
        }
        return Twig.functions[_function](value, params);
    };
    Twig._function.extend = function(_function, definition) {
        Twig.functions[_function] = definition;
    };
    return Twig;
}(Twig || {});
var Twig = function(Twig) {
    "use strict";
    Twig.tests = {
        empty: function(value) {
            if (value === null || value === undefined) return true;
            if (typeof value === "number") return false;
            if (value.length && value.length > 0) return false;
            for (var key in value) {
                if (value.hasOwnProperty(key)) return false;
            }
            return true;
        },
        odd: function(value) {
            return value % 2 === 1;
        },
        even: function(value) {
            return value % 2 === 0;
        },
        divisibleby: function(value, params) {
            return value % params[0] === 0;
        },
        defined: function(value) {
            return value !== undefined;
        },
        none: function(value) {
            return value === null;
        },
        "null": function(value) {
            return this.none(value);
        },
        sameas: function(value, params) {
            return value === params[0];
        }
    };
    Twig.test = function(test, value, params) {
        if (!Twig.tests[test]) {
            throw "Test " + test + " is not defined.";
        }
        return Twig.tests[test](value, params);
    };
    Twig.test.extend = function(test, definition) {
        Twig.tests[test] = definition;
    };
    return Twig;
}(Twig || {});
var Twig = function(Twig) {
    "use strict";
    Twig.exports = {};
    Twig.exports.twig = function twig(params) {
        "use strict";
        var id = params.id, options = {
            strict_variables: params.strict_variables || false
        };
        if (id) {
            Twig.validateId(id);
        }
        if (params.debug !== undefined) {
            Twig.debug = params.debug;
        }
        if (params.trace !== undefined) {
            Twig.trace = params.trace;
        }
        if (params.data !== undefined) {
            return new Twig.Template({
                data: params.data,
                module: params.module,
                id: id,
                options: options
            });
        } else if (params.ref !== undefined) {
            if (params.id !== undefined) {
                throw new Error("Both ref and id cannot be set on a twig.js template.");
            }
            return Twig.Templates.load(params.ref);
        } else if (params.href !== undefined) {
            return Twig.Templates.loadRemote(params.href, {
                id: id,
                module: params.module,
                precompiled: params.precompiled,
                method: "ajax",
                async: params.async,
                options: options
            }, params.load, params.error);
        } else if (params.path !== undefined) {
            return Twig.Templates.loadRemote(params.path, {
                id: id,
                module: params.module,
                precompiled: params.precompiled,
                method: "fs",
                async: params.async,
                options: options
            }, params.load, params.error);
        }
    };
    Twig.exports.extendFilter = function(filter, definition) {
        Twig.filter.extend(filter, definition);
    };
    Twig.exports.extendFunction = function(fn, definition) {
        Twig._function.extend(fn, definition);
    };
    Twig.exports.extendTest = function(test, definition) {
        Twig.test.extend(test, definition);
    };
    Twig.exports.extendTag = function(definition) {
        Twig.logic.extend(definition);
    };
    Twig.exports.compile = function(markup, options) {
        var id = options.filename, sep_chr = "/", path = options.filename, template;
        template = new Twig.Template({
            data: markup,
            path: path,
            id: id,
            options: options.settings["twig options"]
        });
        return function(context) {
            return template.render(context);
        };
    };
    Twig.exports.renderFile = function(path, options, fn) {
        if ("function" == typeof options) {
            fn = options, options = {};
        }
        var view_options = options.settings["twig options"], option, params = {
            path: path,
            load: function(template) {
                fn(null, template.render(options));
            }
        };
        if (view_options) {
            for (option in view_options) {
                params[option] = view_options[option];
            }
        }
        Twig.exports.twig(params);
    };
    Twig.exports.__express = Twig.exports.renderFile;
    Twig.exports.cache = function(cache) {
        Twig.cache = cache;
    };
    return Twig;
}(Twig || {});
var Twig = function(Twig) {
    Twig.compiler = {
        module: {}
    };
    Twig.compiler.compile = function(template, options) {
        var tokens = JSON.stringify(template.tokens), id = template.id, output;
        if (options.module) {
            if (Twig.compiler.module[options.module] === undefined) {
                throw new Twig.Error("Unable to find module type " + options.module);
            }
            output = Twig.compiler.module[options.module](id, tokens, options.twig);
        } else {
            output = Twig.compiler.wrap(id, tokens);
        }
        return output;
    };
    Twig.compiler.module = {
        amd: function(id, tokens, pathToTwig) {
            return 'define(["' + pathToTwig + '"], function (Twig) {\n	var twig = Twig.twig;\n' + Twig.compiler.wrap(id, tokens) + "\n	return templates;\n});";
        },
        node: function(id, tokens) {
            return 'var twig = require("twig").twig;\n' + "exports.template = " + Twig.compiler.wrap(id, tokens);
        },
        cjs2: function(id, tokens, pathToTwig) {
            return 'module.declare([{ twig: "' + pathToTwig + '" }], function (require, exports, module) {\n' + '	var twig = require("twig").twig;\n' + "	exports.template = " + Twig.compiler.wrap(id, tokens) + "\n});";
        }
    };
    Twig.compiler.wrap = function(id, tokens) {
        return 'twig({id:"' + id.replace('"', '\\"') + '", data:' + tokens + ", precompiled: true});\n";
    };
    return Twig;
}(Twig || {});
for (key in Twig.exports) {
    if (Twig.exports.hasOwnProperty(key)) {
        exports[key] = Twig.exports[key];
    }
}

});