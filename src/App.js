import React, { Component } from 'react';
import MapGL, {Marker, NavigationControl} from 'react-map-gl';

import locations from './locations.json';
import Pin from './Pin';

import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const navStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  padding: '10px'
};

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      viewport: {
        latitude: 53,
        longitude: -2,
        zoom: 5.5,
        bearing: 0,
        pitch: 0,
        width: 500,
        height: 500,
      }
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize);
    this._resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }

  _resize = () => {
    this.setState({
      viewport: {
        ...this.state.viewport,
        width: this.props.width || window.innerWidth,
        height: this.props.height || window.innerHeight
      }
    });
  };

  _updateViewport = (viewport) => {
    this.setState({ viewport });
  }

  render() {
    const {viewport} = this.state;
    const markers = locations.features.map((location, i) => {
      return (
        <Marker
          key={`marker-${i}`}
          latitude={location.geometry.coordinates[1]}
          longitude={location.geometry.coordinates[0]}
        >
          <Pin size={20} />
        </Marker>
      );
    });

    return (
      <div className="App">
        <MapGL
          {...viewport}
          mapboxApiAccessToken={TOKEN}
          onViewportChange={this._updateViewport}
          mapStyle="mapbox://styles/mapbox/dark-v9"
        >

          {markers}

          <div className="nav" style={navStyle}>
            <NavigationControl onViewportChange={this._updateViewport} />
          </div>
        </MapGL>
      </div>
    );
  }
}

export default App;
