"use strict";function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _defineProperties(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function _createClass(t,e,n){return e&&_defineProperties(t.prototype,e),n&&_defineProperties(t,n),t}var SequentialColorPicker=function(){function e(t){_classCallCheck(this,e),this.colors=t,this.index=0}return _createClass(e,[{key:"getColor",value:function(){var t=this.colors[this.index];return this.index=(this.index+1)%this.colors.length,t}}]),e}(),WordCloud=function(){function e(t){_classCallCheck(this,e),this.id=t,this.svg=d3.select("#".concat(t)),this.svgSize=void 0,this.processingId=0,this.activeWordGroup=void 0,this.setup()}return _createClass(e,[{key:"setup",value:function(){this.svg.attr("viewBox","0 0 ".concat(700," ").concat(500)),this.svgSize={x:700,y:500}}},{key:"drawWords",value:function(t,e,n){var r,o;n===this.processingId&&(n=d3.transition(),void 0!==this.activeWordGroup&&(n=n.delay(1e3),this.activeWordGroup.transition().duration(1e3).style("opacity",0).remove()),r=new SequentialColorPicker(["darkred","#ff0000","whitesmoke","gray","#ffe6e6"]),o=d3.max(t,function(t){return t.size}),e=this.svg.append("g").attr("transform","translate(".concat(e.size()[0]/2," ").concat(e.size()[1]/2,")")),this.activeWordGroup=e,this.activeWordGroup.selectAll("text").data(t).enter().append("text").attr("text-anchor","middle").attr("fill",function(t,e){return r.getColor()}).attr("transform",function(t){return"translate(".concat(t.x,", ").concat(t.y,") rotate(").concat(t.rotate,")")}).style("opacity",0).style("font-size",function(t){return"".concat(t.size,"px")}).text(function(t){return t.text}).transition(n).duration(function(t){return 1e3+5e3*(1-t.size/o)}).style("opacity",1))}},{key:"updateWords",value:function(t){var e=this,n=d3.layout.cloud().size([this.svgSize.x,this.svgSize.y]).words(t.map(function(t){return{text:t}})).padding(10).rotate(function(t,e){return e%2*90}).fontSize(function(t,e){return Math.max(15,60-3*e)}).on("end",function(t){return e.drawWords(t,n,e.processingId)});this.processingId++,n.start()}}]),e}();$(function(){for(var e=["January","February","March","April","May","June","July","August","September","October","November","December"],n=new WordCloud("topic-wordcloud"),r={},t=1;t<=12;t++)r[t]=[];var o=new TimeSelector("word-cloud-time-selection",[1,12],function(t){return n.updateWords(r[t])},6e4,"int",function(t){return e[t-1]});d3.json("data/keywords_per_month.json").then(function(n){Object.keys(n).map(function(t){var e=Object.entries(n[t]);e.sort(function(t,e){return e[1]-t[1]}),r[t]=e.map(function(t){return t[0]}).slice(0,30).map(function(t){return t[0].toUpperCase()+t.slice(1)})}),o.setValue(1)})});
//# sourceMappingURL=topic_wordcloud_plot.js.map
