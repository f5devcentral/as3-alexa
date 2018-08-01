/*
 * Copyright (c) 2018, F5 Networks, Inc. All rights reserved.
 * No part of this software may be reproduced or transmitted in any
 * form or by any means, electronic or mechanical, for any purpose,
 * without express written permission of F5 Networks, Inc.
 */
(function () {

    /* Home Directives */
    angular.module('homeDirectives', []).
    // Example Bubble Chart
    directive('customGraph', function ($window) {
        console.log('values from directive: ');
        return {
            restrict: 'EA',
            scope: {data: '='},
            templateUrl: 'partials/templates/graph.html',
            link: function (scope, element, attrs) {

                scope.$watch('data', function (data) {
                    if (data) {
                        // Look for responsive svg solution later!
                        // var width = window.innerWidth;
                        // var height = window.innerHeight;
                        const d3 = $window.d3;
                        const rawSvg = element.find('svg');
                        const svg = d3.select(rawSvg[0]);
                        const width = svg.attr('width');
                        const height = svg.attr('height');
                        const tip = d3.tip().
                attr('class', 'd3-tip').
                offset([-10, 0]).
                html(function (d) {
                    if (d.group === 50) {
                        return `<span>${d.id}</span>`;
                    } else if (d.group === 40) {
                        return `<strong>Tenant:</strong><span>${d.id}</span>`;
                    } else if (d.group === 30) {
                        return `<strong>Application:</strong><span>${d.id}</span>`;
                    } else if (d.group === 20) {
                        return `<strong>Service:</strong><span>${d.id}</span>`;
                    } else if (d.group === 15) {
                        return `<strong>Virtual Server:</strong><span>${d.id}</span>`;
                    } else if (d.group === 10) {
                        return `<strong>Pool:</strong><span>${d.id}</span>`;
                    } else if (d.group === 5) {
                        return `<strong>Pool Member:</strong><span>${d.ip}</span>`;
                    } else if (d.group === 3) {
                        return `<strong>SERVER:</strong> <span>${d.name}</span>`;
                    }

                });
                        svg.call(tip);

                        // .attr('viewBox','0 0 '+Math.min(width,height) +' '+Math.min(width,height) )
                        // .attr('preserveAspectRatio','xMinYMin')
                        // .append("g")
                        // .attr("transform", "translate(" + Math.min(width,height) / 2 + "," + Math.min(width,height) / 2 + ")");

                        // Remove all elements before redrawing graph
                        svg.selectAll('circle').
                transition().
                duration(750).
                style('opacity', 0).
                remove();

                        svg.selectAll('line').
                transition().
                duration(750).
                style('opacity', 0).
                remove();

                        svg.selectAll('text').
                transition().
                duration(750).
                style('opacity', 0).
                remove();                

                        svg.
                transition().
                duration(750).
                style('opacity', 1);

                        // Grid Layout ===============================================================


                        const graph = data;
                        const nodes = graph.nodes;
                        const links = graph.links;


                        // Root node
                        const root = graph.nodes[0];

                        root.x = width / 2;
                        root.y = height / 2;
                        root.fixed = true;


                        const simulation = d3.forceSimulation().
                force('link', d3.forceLink().
                  id(function (d) {
                      return d.id;
                  }).
                  distance(function (d) {
                      if (d.source.group === 50 && d.target.group === 40) {
                          return 60; 
                      } else if (d.source.group === 40 || d.source.group === 30||
                               d.source.group === 20 || d.source.group === 15 && 
                               d.target.group === 40 || d.target.group === 30 || 
                               d.target.group === 20 || d.target.group === 15                              
                      ) 
                      {
                          return 45;
                      } else if (d.source.group === 10 || d.source.group === 5 && d.target.group === 10 || d.target.group === 5) {
                          return 40;
                      }
                  })).

                force('charge', d3.forceManyBody().strength(function (d) {
                    if (d.group === 50) {
                        return -60;
                    } else if (d.group === 40) {
                        return -50;
                    } else if (d.group === 30) {
                        return -40;
                    }
                    return -30;

                })).
                force('center', d3.forceCenter(width / 2, height / 2)).
                force('collide', d3.forceCollide().radius(function (d) {
                    if (d.group === 50) { // Big IP
                        return 30;
                    } else if (d.group === 40) { // Tenant
                        return 20;
                    } else if (d.group === 30) { // Application
                        return 15;
                    } else if (d.group === 20) { // Service
                        return 10;
                    }
                    return 8;


                }));


                        const link = svg.append('g').
                attr('class', 'links').
                selectAll('line').
                data(links).
                enter().append('line').
                attr('stroke-width', function (d) {
                    return 2;
                });

                        const node = svg.append('g').
                attr('class', 'node');


                        const circle = node.selectAll('circle').
                data(nodes).
                enter().append('circle').
                attr('r', function (d) {
                    if (d.group === 50) { // Big IP
                        console.log('radius for bigip');
                        console.log(d);
                        return 25;
                    } else if (d.group === 40) {
                        return 16;
                    } else if (d.group === 30) {
                        return 15;
                    } else if (d.group === 20) { // Tenants
                        return 14;
                    } else if (d.group === 15) {
                        return 13;
                    } else if (d.group === 10) {
                        return 12;
                    } else if (d.group === 5) { // Nodes 
                        return 10;
                    }
                    return 6;

                }).
                attr('fill', function (d) {
                    // Change color of node balls according to status 
                    // Some proxy has "authorize" as status although status should only be authorized
                    // Big-IP has distinct color
                    if (d.group === 50) {
                        return '#c7062b'; // BIG IP Ball
                    } else if (d.group === 40) {
                        return '#0f71b9';
                    } else if (d.group === 30) {
                        return '#0aa6ea';
                    } else if (d.group === 20) {
                        return '#3dc1f9';
                    } else if (d.group === 15) {
                        return '#6fd4ff';
                    } else if (d.group === 10) {
                        return '#97e0ff';
                    } else if (d.group === 5) {
                        if (d.status === 'offline' || d.status === ' ' || d.status === '') {
                            return '#e21c1c';
                        } else if (d.status === 'online') {
                            return '#3d9e3d';
                        }
                    }
                }).
                attr('class', function (d) {
                    if (d.id === 'BIG IP') {
                        return 'fixed-node';
                    }
                }).
                on('mouseover', tip.show).
                on('mouseout', tip.hide).
                call(d3.drag().
                  on('start', dragstarted).
                  on('drag', dragged).
                  on('end', dragended));

                        const txt = node.selectAll('text').
                data(graph.nodes).
                enter().append('text').
                text(function (d) {
                    if (d.group === 50) {
                        return d.id;
                    } else if (d.group === 40) {
                        return 'T';
                    } else if (d.group === 30) {
                        return 'A';
                    } else if (d.group === 20) {
                        return 'S';
                    } else if (d.group === 15) {
                        return 'V';
                    } else if (d.group === 10) {
                        return 'P';
                    } else if (d.group === 5) {
                        return 'M';
                    }

                })
                .style('fill', 'white')
                .style('font-size', '10px');


                        simulation.
                nodes(graph.nodes).
                on('tick', ticked);


                        simulation.force('link').
                links(graph.links);

                        function ticked () {
                            link.
                  attr('x1', function (d) {
                      return d.source.x;
                  }).
                  attr('y1', function (d) {
                      return d.source.y;
                  }).
                  attr('x2', function (d) {
                      return d.target.x;
                  }).
                  attr('y2', function (d) {
                      return d.target.y;
                  });

                            circle.
                  attr('cx', function (d) {
                      return d.x = Math.max(10, Math.min(width - 10, d.x));
                  }).
                  attr('cy', function (d) {
                      return d.y = Math.max(10, Math.min(height - 10, d.y));
                  });

                            txt.
                  attr('x', function (d) {
                      // Adding x and y only for BIG IP for now
                      if (d.group === 50) {
                          return d.x - 16;
                      } else if (d.group === 40 || d.group === 30 || d.group === 20 || d.group === 15) {
                          return d.x - 3;
                      } else if (d.group === 10 || d.group === 5) {
                          return d.x - 3;
                      }

                  }).
                  attr('y', function (d) {
                      if (d.group === 50) {
                          return d.y + 3;
                      } else if (d.group === 40 || d.group === 30 || d.group === 20 || d.group === 15) {
                          return d.y + 3;
                      } else if (d.group === 10 || d.group === 5) {
                          return d.y + 3;
                      }

                  });

                        }

                        function dragstarted (d) {
                            if (!d3.event.active) {
                                simulation.alphaTarget(0.3).restart();
                            }
                            d.fx = d.x;
                            d.fy = d.y;
                        }

                        function dragged (d) {
                            d.fx = d3.event.x;
                            d.fy = d3.event.y;
                        }

                        function dragended (d) {
                            if (!d3.event.active) {
                                simulation.alphaTarget(0);
                            }
                            d.fx = null;
                            d.fy = null;
                        }
                    }
                });


            }
        };
    });
}());