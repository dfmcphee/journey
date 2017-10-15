import React, {Component} from 'react';
import MapGL, {Marker} from 'react-map-gl';
import {Motion, spring} from 'react-motion';

import geography from './locations.json';
import Pin from './Pin';

import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w-]+/g, '')       // Remove all non-word chars
    .replace(/--+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

class App extends Component {
  constructor(props) {
    super(props);
    
    const locations = geography.features
      .map((location) => {
        const dateString = Date.parse(location.properties.date);
        if (!isNaN(dateString)) {
          location.properties.date = new Date(dateString);
        } else {
          location.properties.date = false;
        }
        return location;
      })
      .filter((location) => location.properties.date);

    locations.sort(function (a, b) {
      return a.properties.date - b.properties.date;
    });
    
    this.state = {
      viewport: {
        latitude: locations[0].geometry.coordinates[1] - 0.1,
        longitude: locations[0].geometry.coordinates[0],
        width: 500,
        height: 500
      },
      selectedWaypoint: 0,
      locations
    };
  }

  componentDidMount() {
    window.addEventListener('keyup', this._handleKeypress);
    window.addEventListener('resize', this._handleResize);
    this._handleResize();
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this._handleKeypress);
    window.removeEventListener('resize', this._handleResize);
  }

  _handleKeypress = (evt) => {
    if (!(evt.code === 'ArrowRight' || evt.code === 'ArrowLeft')) {
      return;
    }

    this.setState(({selectedWaypoint, locations, viewport}) => {
      if (
        (evt.code === 'ArrowLeft' && selectedWaypoint === 0) ||
        (evt.code === 'ArrowRight' && selectedWaypoint === locations.length -1)
      ) { return; }
      
      const newlySelected = (evt.code === 'ArrowLeft')
        ? selectedWaypoint - 1
        : selectedWaypoint + 1;

      const location = locations[newlySelected];

      return {
        selectedWaypoint: newlySelected,
        viewport: {
          height: viewport.height,
          width: viewport.width,
          latitude: location.geometry.coordinates[1] - 0.1,
          longitude: location.geometry.coordinates[0]
        }
      };
    });
  };

  _handleResize = () => {
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
    const {viewport, locations, selectedWaypoint} = this.state;
    const markers = locations.map((location, i) => {
      const pinSize = (selectedWaypoint === i) ? 32 : 20;
      return (
        <Marker
          key={`marker-${i}`}
          latitude={location.geometry.coordinates[1]}
          longitude={location.geometry.coordinates[0]}
        >
          <Motion style={{
            pinSize: spring(pinSize)
          }}>
            {({ pinSize }) => <Pin size={pinSize} />}
          </Motion>
        </Marker>
      );
    });

    const placeName = locations[selectedWaypoint] && locations[selectedWaypoint].properties.place_name
      ? locations[selectedWaypoint].properties.place_name
      : null;

    const date = locations[selectedWaypoint] && locations[selectedWaypoint].properties.date
      ? locations[selectedWaypoint].properties.date.toLocaleDateString('en-US')
      : null;

    return (
      <div className="App">
        <Motion style={{
          latitude: spring(viewport.latitude),
          longitude: spring(viewport.longitude),
        }}>
          {({ latitude, longitude }) => <MapGL
            latitude={latitude}
            longitude={longitude}
            height={viewport.height}
            width={viewport.width}
            zoom={9}
            bearing={0}
            pitch={0}
            mapboxApiAccessToken={TOKEN}
            onViewportChange={this._updateViewport}
            mapStyle="mapbox://styles/mapbox/dark-v9"
          >
            {markers}
          </MapGL>}
        </Motion>
        <div className={`information-overlay information-overlay--${slugify(placeName)}`}>
          <p className="information-overlay__date">{date}</p>
          <p className="information-overlay__name">{placeName}</p>
        </div>
      </div>
    );
  }
}

export default App;
