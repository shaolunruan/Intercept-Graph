import React, {Component} from 'react';
import * as axios from 'axios'

import interceptgraph_build from '../function/interceptgraph'

class Interceptgraph extends Component {
    constructor(props){
        super(props);
        this.state = {
            item : 'react component'
        }
    }

    componentDidMount(){
        axios.get('staticData/1.csv')
            .then(info=>{
                if(info.status == 200){
                    return Promise.resolve(info.data)
                }
                console.log('data access failed')
                return
            })
            .then(data=>{
                interceptgraph_build('interceptGraph_SVGContainer', data)
            })
    }

    render(){

        return(
            <div>
                {/*按如下的规则 先设置svg的id和尺寸*/}
                <svg id="interceptGraph_SVGContainer" width='600px' height='601px'/>
            </div>
        )
    }
}

export default Interceptgraph;
