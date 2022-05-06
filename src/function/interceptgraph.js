import * as d3 from 'd3'

import {axisRadialInner, axisRadialOuter} from "./libs/d3-radial-axis";


'./libs/d3-radial-axis'

const interceptgraph_build = (svg_id, data_) =>{

    /*如果 dom_id 没有的话，报错*/
    if (d3.select(`#${svg_id}`).size()==0){
        console.log("'svg_id' not found")
        return
    }

    const svg = d3.select(`#${svg_id}`)

    /*width height 为 svg 画布的长宽，cx cy是画布的中心, r 是 IG 半径（默认0.8倍的 cx或cy）*/
    const [width] = svg.attr('width').match(/\d+/g) || ['600'], [height] = svg.attr('height').match(/\d+/g) || ['600']
    /*IG 的中心*/
    const cx = width/2, cy = height/2
    const r = d3.min([cx, cy]) * 0.8

    /*转换 csv text形式 到csv 对象形式*/
    let data = {}
    d3.csvParseRows(data_).map(d=>{
        data[d[0]] = {
            'item': d[0],
            'd1': +d[1],
            'd2': +d[2]
        }
    })


    /*先将 所有的数据按照 上升和下降 进行区分*/
    let data_rise, data_drop

    data_rise = Object.fromEntries(Object.entries(data).filter(d=>{
        return d[1]['d2'] - d[1]['d1'] >= 0
    }))

    data_drop = Object.fromEntries(Object.entries(data).filter(d=>{
        return d[1]['d2'] - d[1]['d1'] < 0
    }))


    /*开始计算 对上升和下降的 extent*/
    let extent_rise = d3.extent(Object.values(data_rise).map(d=>d['d1']).concat(Object.values(data_rise).map(d=>d['d2'])))
    let extent_drop = d3.extent(Object.values(data_drop).map(d=>d['d1']).concat(Object.values(data_drop).map(d=>d['d2'])))




    /***********开始画图**********/
    let g = svg.append('g')
        .classed('interceptgraph_g', true)
        .attr('transform', `translate(${cx}, ${cy})`)


    /*开始创建 scale 环形坐标轴 上升*/
    let AxisScale_rise = d3.scaleLinear()
        .domain(extent_rise)
        .range([0, Math.PI]);
    let outerAxisRadius_rise = r;
    let innerAxisRadius_rise = 0.8 * r;
    let outerAxis_rise = axisRadialOuter(AxisScale_rise, outerAxisRadius_rise);
    let innerAxis_rise = axisRadialOuter(AxisScale_rise, innerAxisRadius_rise);


    /*开始创建 scale 环形坐标轴 下降*/
    let AxisScale_drop = d3.scaleLinear()
        .domain(extent_drop)
        .range([2 * Math.PI, Math.PI]);
    let outerAxisRadius_drop = r;
    let innerAxisRadius_drop = 0.8 * r;
    let outerAxis_drop = axisRadialOuter(AxisScale_drop, outerAxisRadius_drop);
    let innerAxis_drop = axisRadialOuter(AxisScale_drop, innerAxisRadius_drop);




    /*生成DOM，但是是invisible， 用来抽取每个tick的坐标，来画放射虚线，*/
    g.append('g').classed('outerAxis_rise_', true).call(outerAxis_rise.ticks(10));
    g.append('g').classed('outerAxis_drop_', true).call(outerAxis_drop.ticks(10));

    g.append('g').classed('innerAxis_rise_', true).call(innerAxis_rise.ticks(10).tickFormat(""));
    g.append('g').classed('innerAxis_drop_', true).call(innerAxis_drop.ticks(10).tickFormat(""));


    /*根据scale，画放射的 用来对齐 的虚线*/
    let tickArray_rise = [], tickArray_drop = []
    /*抽取 rise 的 axis上所有tick*/
    d3.selectAll('.outerAxis_rise_>.tick').each(function(){
        let [_, x, y] = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(d3.select(this).attr('transform'))
        tickArray_rise.push([+x,+y])
    })

    /*抽取 drop 的 axis上所有tick*/
    d3.selectAll('.outerAxis_drop_>.tick').each(function(){
        let [_, x, y] = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(d3.select(this).attr('transform'))
        tickArray_drop.push([+x,+y])
    })


    /*开始画 放射的虚线*/
    g.selectAll('.dottedLine')
        .data(tickArray_rise.concat(tickArray_drop))
        .join('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', d=>d[0])
        .attr('y2', d=>d[1])
        .attr('stroke', '#ababab')
        .attr('stroke-width', 0.7)
        .attr('stroke-dasharray', 4)


    /*根据scale，画axis*/
    g.append('g').classed('outerAxis_rise', true).call(outerAxis_rise.ticks(10));
    g.append('g').classed('outerAxis_drop', true).call(outerAxis_drop.ticks(10));

    g.append('g').classed('innerAxis_rise', true).call(innerAxis_rise.ticks(10).tickFormat(""));
    g.append('g').classed('innerAxis_drop', true).call(innerAxis_drop.ticks(10).tickFormat(""));

    console.log(data_rise)



    /* 开始画 intercept */
    /* 上升 */
    g.selectAll('.intercept_rise')
        .data(Object.values(data_rise))
        .join('line')
        .classed('intercept_rise', true)
        .attr('x1', d=>innerAxisRadius_rise * Math.sin(AxisScale_rise(d['d1'])))
        .attr('y1', d=>innerAxisRadius_rise * Math.cos(AxisScale_rise(d['d1'])))
        .attr('x2', d=>outerAxisRadius_rise * Math.sin(AxisScale_rise(d['d2'])))
        .attr('y2', d=>outerAxisRadius_rise * Math.cos(AxisScale_rise(d['d2'])))
        .attr('stroke', '#1199de')
        .attr('stroke-width', 1)


    /* 下降 */
    g.selectAll('.intercept_drop')
        .data(Object.values(data_drop))
        .join('line')
        .classed('intercept_drop', true)
        .attr('x1', d=>innerAxisRadius_rise * Math.sin(AxisScale_drop(d['d1'])))
        .attr('y1', d=>innerAxisRadius_rise * Math.cos(AxisScale_drop(d['d1'])))
        .attr('x2', d=>outerAxisRadius_rise * Math.sin(AxisScale_drop(d['d2'])))
        .attr('y2', d=>outerAxisRadius_rise * Math.cos(AxisScale_drop(d['d2'])))
        .attr('stroke', '#ff353a')
        .attr('stroke-width', 1)

    
    /* fix tick label 重叠的问题 */
    d3.select(d3.selectAll('.outerAxis_rise>g>text').nodes()[0]).attr('dx', 8)
    d3.select(d3.selectAll('.outerAxis_drop>g>text').nodes()[0]).attr('dx', -8)
    d3.select(d3.selectAll('.outerAxis_rise>g>text').nodes()[d3.selectAll('.outerAxis_rise>g>text').size()-1]).attr('dx', 8)
    d3.select(d3.selectAll('.outerAxis_drop>g>text').nodes()[d3.selectAll('.outerAxis_drop>g>text').size()-1]).attr('dx', -8)













}

export default interceptgraph_build;