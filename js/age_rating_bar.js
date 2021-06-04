"use strict";function _slicedToArray(t,e){return _arrayWithHoles(t)||_iterableToArrayLimit(t,e)||_unsupportedIterableToArray(t,e)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(t,e){if(t){if("string"==typeof t)return _arrayLikeToArray(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);return"Map"===(r="Object"===r&&t.constructor?t.constructor.name:r)||"Set"===r?Array.from(t):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?_arrayLikeToArray(t,e):void 0}}function _arrayLikeToArray(t,e){(null==e||e>t.length)&&(e=t.length);for(var r=0,a=new Array(e);r<e;r++)a[r]=t[r];return a}function _iterableToArrayLimit(t,e){var r=t&&("undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"]);if(null!=r){var a,i,n=[],s=!0,o=!1;try{for(r=r.call(t);!(s=(a=r.next()).done)&&(n.push(a.value),!e||n.length!==e);s=!0);}catch(t){o=!0,i=t}finally{try{s||null==r.return||r.return()}finally{if(o)throw i}}return n}}function _arrayWithHoles(t){if(Array.isArray(t))return t}function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _defineProperties(t,e){for(var r=0;r<e.length;r++){var a=e[r];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(t,a.key,a)}}function _createClass(t,e,r){return e&&_defineProperties(t.prototype,e),r&&_defineProperties(t,r),t}var AgeRatingDistributionPlot=function(){function e(t){_classCallCheck(this,e),this.svg=t,this.bars={},this.yTickValues=["NR","3+","7+","10+","13+","16+","18+"],this.currentData={},this.setup()}return _createClass(e,[{key:"createInfoTexts",value:function(t,e){this.svg.append("text").attr("x",e).attr("fill","#DB0000").style("font-size","1.6em").style("text-anchor","start").style("alignment-baseline","hanging").text("Movies"),this.svg.append("text").attr("x",t-e).attr("fill","#DB0000").style("font-size","1.6em").style("text-anchor","end").style("alignment-baseline","hanging").text("TV Shows")}},{key:"createXAxis",value:function(e,t,r){t=this.svg.append("g").attr("width",e).attr("transform","translate(0, ".concat(t-50,")"));t.append("line").attr("stroke","whitesmoke").attr("x1",0).attr("y1",0).attr("x2",e).attr("y2",0);r=r.flatMap(function(t){return[{position:t[0],value:t[1]},{position:e-t[0],value:t[1]}]}),r=t.selectAll(".plot-tick").data(r).enter();r.append("line").attr("stroke","whitesmoke").attr("x1",function(t){return t.position}).attr("y1",0).attr("x2",function(t){return t.position}).attr("y2",5),r.append("text").attr("fill","whitesmoke").attr("y",10).attr("x",function(t){return t.position}).style("text-anchor","middle").style("alignment-baseline","hanging").text(function(t){return t.value+"%"})}},{key:"barWidth",value:function(t){return t*this.maxBarWidth}},{key:"createYAxisAndBars",value:function(t,e,r){var a=this,e=this.svg.append("g").attr("width",r).attr("transform","translate(".concat(t/2,", ").concat(e-50,")")),e=e.selectAll(".middle-bar-value").data(this.yTickValues).enter();e.append("text").attr("fill","whitesmoke").attr("x",0).attr("y",function(t,e){return-(30+60*e)}).style("text-anchor","middle").style("alignment-baseline","ideographic").text(function(t){return t});var i=this.yAxisWidth/2;this.defaultBarColor="#DB0000",this.hoverBarColor="#800000";function n(t){return t._groups[0]}var s=e.append("rect").attr("fill",this.defaultBarColor).attr("y",function(t,e){return-(30+60*e+32)}).attr("x",i).attr("height",40).attr("width",this.barWidth(0)),o=e.append("rect").attr("fill",this.defaultBarColor).attr("y",function(t,e){return-(30+60*e+32)}).attr("x",function(t){return-(i+a.barWidth(0))}).attr("height",40).attr("width",this.barWidth(0));this.yTickValues.forEach(function(t,e){a.bars[t]={movies:d3.select(n(o)[e]),shows:d3.select(n(s)[e])}})}},{key:"createTooltip",value:function(){var t=this.svg.append("g").attr("id","age-rating-distribution-tooltip").style("alignment-baseline","baseline").style("visiblity","hidden");t.append("rect").attr("x",0).attr("y",0).attr("fill","whitesmoke").attr("rx",4),t.append("text").attr("fill","black").style("alignment-baseline","hanging").style("text-anchor","start").text("")}},{key:"setup",value:function(){var t=800;this.svg.attr("viewBox","0 0 ".concat(t," ").concat(530)),this.yAxisWidth=50,this.maxBarWidth=(t-this.yAxisWidth)/2-30,this.createXAxis(t,530,[[(t-this.yAxisWidth)/2-this.maxBarWidth,100],[(t-this.yAxisWidth)/2,0]]),this.createYAxisAndBars(t,530);var e=(t-this.yAxisWidth)/2-this.maxBarWidth;this.createInfoTexts(t,e),this.createTooltip()}},{key:"updateData",value:function(e){var r=this;this.currentData=e;function a(t,i){t.on("mouseover",function(t){d3.select(this).transition().duration(500).attr("fill",o);var e=c.select("text"),r=10,a=10;e.attr("x",r).attr("y",a).text((100*i).toFixed(1)+"%");e=e.node().getBBox();c.select("rect").attr("width",e.width+2*r).attr("height",e.height+2*a),c.style("visibility","visible")}).on("mousemove",function(t){var e=_slicedToArray(d3.mouse(l.node()),2),r=2,e=[e[0]+2,e[1]-c.select("rect").node().getBBox().height-r],r=e[1];c.attr("transform","translate(".concat(e[0],", ").concat(r,")"))}).on("mouseout",function(t){d3.select(this).transition().duration(500).attr("fill",s),c.select("text").text(""),c.style("visibility","hidden")})}var i=this.yAxisWidth/2,n=d3.transition(d3.easeCubicOut).duration(1e3),s=this.defaultBarColor,o=this.hoverBarColor,l=this.svg,c=d3.select("#age-rating-distribution-tooltip");this.yTickValues.forEach(function(t){isNaN(e[t].movies)&&(e[t].movies=0),isNaN(e[t].shows)&&(e[t].shows=0),a(r.bars[t].movies,e[t].movies),r.bars[t].movies.transition(n).attr("x",-(i+r.barWidth(e[t].movies))).attr("width",r.barWidth(e[t].movies)),a(r.bars[t].shows,e[t].shows),r.bars[t].shows.transition(n).attr("width",r.barWidth(e[t].shows))})}}]),e}();$(function(){var e=d3.select("svg#age-rating-distribution-plot"),r=new AgeRatingDistributionPlot(e),a={},i=new TimeSelector("content-time-selection",[2015,2021],function(t){return r.updateData(a[t])},1e4,"int");d3.csv("data/age_rating_per_year_distribution.csv").then(function(t){t.forEach(function(t){void 0===a[t.year]&&(a[t.year]={}),void 0===a[t.year][t["age rating"]]&&(a[t.year][t["age rating"]]={}),a[t.year][t["age rating"]][t.category]=parseFloat(t.percentage)}),e.style("opacity",0),e.transition().delay(1e3).duration(600).style("opacity",1),i.setValue(2015)}),$("#content-button").click(function(){var t=parseInt($("#content-year-option").val());r.updateData(a[t])})});
//# sourceMappingURL=age_rating_bar.js.map
