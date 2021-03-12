import React from "react";
import { slide as Menu } from "react-burger-menu";

export default props => {
  return (
    // Pass on our props
    <Menu {...props}>
      <a className="menu-item" href="/">
        Home
      </a>

      <a className="menu-item" href="/validator">
        MobilityData/gtfs-validator
      </a>

      <a className="menu-item" href="/gtfs">
        google/transit
      </a>

      <a className="menu-item" href="/gbfs">
        NABSA/gbfs
      </a>
    </Menu>
  );
};
