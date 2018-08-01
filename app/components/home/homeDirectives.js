"use strict";angular.module("homeDirectives",[]).directive("customGraph",["$window",function(v){return console.log("values from directive: "),{restrict:"EA",scope:{data:"="},templateUrl:"partials/templates/graph.html",link:function(r,x,t){r.$watch("data",function(r){if(r){var t=v.d3,o=x.find("svg"),n=t.select(o[0]),e=n.attr("width"),u=n.attr("height"),i=t.tip().attr("class","d3-tip").offset([-10,0]).html(function(r){return 50===r.group?"<span>"+r.id+"</span>":40===r.group?"<strong>Tenant:</strong><span>"+r.id+"</span>":30===r.group?"<strong>Application:</strong><span>"+r.id+"</span>":20===r.group?"<strong>Service:</strong><span>"+r.id+"</span>":15===r.group?"<strong>Virtual Server:</strong><span>"+r.id+"</span>":10===r.group?"<strong>Pool:</strong><span>"+r.id+"</span>":5===r.group?"<strong>Pool Member:</strong><span>"+r.ip+"</span>":3===r.group?"<strong>SERVER:</strong> <span>"+r.name+"</span>":void 0});n.call(i),n.selectAll("circle").transition().duration(750).style("opacity",0).remove(),n.selectAll("line").transition().duration(750).style("opacity",0).remove(),n.selectAll("text").transition().duration(750).style("opacity",0).remove(),n.transition().duration(750).style("opacity",1);var a=r,p=a.nodes,s=a.links,g=a.nodes[0];g.x=e/2,g.y=u/2,g.fixed=!0;var c=t.forceSimulation().force("link",t.forceLink().id(function(r){return r.id}).distance(function(r){return 50===r.source.group&&40===r.target.group?60:40===r.source.group||30===r.source.group||20===r.source.group||15===r.source.group&&40===r.target.group||30===r.target.group||20===r.target.group||15===r.target.group?45:10===r.source.group||5===r.source.group&&10===r.target.group||5===r.target.group?40:void 0})).force("charge",t.forceManyBody().strength(function(r){return 50===r.group?-60:40===r.group?-50:30===r.group?-40:-30})).force("center",t.forceCenter(e/2,u/2)).force("collide",t.forceCollide().radius(function(r){return 50===r.group?30:40===r.group?20:30===r.group?15:20===r.group?10:8})),l=n.append("g").attr("class","links").selectAll("line").data(s).enter().append("line").attr("stroke-width",function(r){return 2}),f=n.append("g").attr("class","node"),d=f.selectAll("circle").data(p).enter().append("circle").attr("r",function(r){return 50===r.group?(console.log("radius for bigip"),console.log(r),25):40===r.group?16:30===r.group?15:20===r.group?14:15===r.group?13:10===r.group?12:5===r.group?10:6}).attr("fill",function(r){if(50===r.group)return"#c7062b";if(40===r.group)return"#0f71b9";if(30===r.group)return"#0aa6ea";if(20===r.group)return"#3dc1f9";if(15===r.group)return"#6fd4ff";if(10===r.group)return"#97e0ff";if(5===r.group){if("offline"===r.status||" "===r.status||""===r.status)return"#e21c1c";if("online"===r.status)return"#3d9e3d"}}).attr("class",function(r){if("BIG IP"===r.id)return"fixed-node"}).on("mouseover",i.show).on("mouseout",i.hide).call(t.drag().on("start",function(r){t.event.active||c.alphaTarget(.3).restart(),r.fx=r.x,r.fy=r.y}).on("drag",function(r){r.fx=t.event.x,r.fy=t.event.y}).on("end",function(r){t.event.active||c.alphaTarget(0),r.fx=null,r.fy=null})),y=f.selectAll("text").data(a.nodes).enter().append("text").text(function(r){return 50===r.group?r.id:40===r.group?"T":30===r.group?"A":20===r.group?"S":15===r.group?"V":10===r.group?"P":5===r.group?"M":void 0}).style("fill","white").style("font-size","10px");c.nodes(a.nodes).on("tick",function(){l.attr("x1",function(r){return r.source.x}).attr("y1",function(r){return r.source.y}).attr("x2",function(r){return r.target.x}).attr("y2",function(r){return r.target.y}),d.attr("cx",function(r){return r.x=Math.max(10,Math.min(e-10,r.x))}).attr("cy",function(r){return r.y=Math.max(10,Math.min(u-10,r.y))}),y.attr("x",function(r){return 50===r.group?r.x-16:40===r.group||30===r.group||20===r.group||15===r.group?r.x-3:10===r.group||5===r.group?r.x-3:void 0}).attr("y",function(r){return 50===r.group?r.y+3:40===r.group||30===r.group||20===r.group||15===r.group?r.y+3:10===r.group||5===r.group?r.y+3:void 0})}),c.force("link").links(a.links)}})}}}]);
//# sourceMappingURL=../../maps/home/homeDirectives.js.map
