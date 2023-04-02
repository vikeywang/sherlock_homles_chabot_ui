import React, { Component } from "react";
import NeoVis from "neovis.js/dist/neovis.js";

import { v1 as uuid } from "uuid";

export const getUUID = () => {
  return uuid().replace(/-/g, "");
};

export class NeoVisComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      id: getUUID(),
      trigger: false,
    };
    this.triggetNext = this.triggetNext.bind(this);
  }

  triggetNext() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep();
    });
  }

  componentDidMount() {
    console.log("componentDidMount.....");
    const { steps } = this.props;
    console.log("steps:...." + steps)
    const search = steps.search.value;
    const self = this;
    this.setState({
      loading: false,
      trigger: false,
    });
    var viz = self.draw();
    viz.render(search);
    this.triggetNext();
  }

  draw() {
    const config = {
      container_id: this.state.id,
      // server_url: "neo4j+s://006f405e.databases.neo4j.io",
      server_url: "bolt://localhost:7687",
      server_user: "neo4j",
      server_password: "wanghong@neo4j",
      encrypted: "ENCRYPTION_OFF",
      labels: {
        Character: {
          caption: "name",
        },
      },
      relationships: {},

    };
    var viz = new NeoVis(config);
    return viz;
  }

  render() {
    console.log("render.....");
    const { trigger, loading, id } = this.state;
    return (
      <div
        // style={{
        //   width: "1000px",
        //   height: "600px",
        //   backgroundColor: "#eeeeee",
        // }}
      >
        <div
          id={id}
          // style={{
          //   width: "1000px",
          //   height: "600px",
          // }}
        ></div>
        {!loading && (
          <div
            // style={{
            //   textAlign: "center",
            //   marginTop: 60,
            //   width: "1000px",
            //   height: "600px",
            // }}
          >
          </div>
        )}
      </div>
    );
  }
}
