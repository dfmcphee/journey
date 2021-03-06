import React, {Component} from 'react';
import MapGL, {Marker} from 'react-map-gl';
import {Motion, spring} from 'react-motion';
import Swipeable from 'react-swipeable';

import geography from './locations.json';
import Pin from './Pin';

import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

function updateSelectedWaypoint(selectedWaypoint, location, height, width) {
  return {
    selectedWaypoint,
    viewport: {
      height,
      width,
      latitude: location.geometry.coordinates[1] - 0.1,
      longitude: location.geometry.coordinates[0]
    }
  };
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

  _handleSwipeLeft = (e, absX) => {
    this.setState(({ selectedWaypoint, locations, viewport }) => {
      if (selectedWaypoint === locations.length - 1) { return; }

      const newlySelected = selectedWaypoint + 1;
      const location = locations[newlySelected];

      return updateSelectedWaypoint(newlySelected, location, viewport.height, viewport.width);
    });
  }

  _handleSwipeRight = (e, absX) => {
    this.setState(({ selectedWaypoint, locations, viewport }) => {
      if (selectedWaypoint === 0) { return; }

      const newlySelected = selectedWaypoint - 1;
      const location = locations[newlySelected];

      return updateSelectedWaypoint(newlySelected, location, viewport.height, viewport.width);
    });
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

  changeSelected = () => {
    this.setState({
      viewport: {
        ...this.state.viewport,
        width: this.props.width || window.innerWidth,
        height: this.props.height || window.innerHeight
      }
    });
  };

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

    const informationOverlayStyles = {};

    if (locations[selectedWaypoint].properties.banner_image) {
      informationOverlayStyles.backgroundImage = `url(${locations[selectedWaypoint].properties.banner_image})`;
    }

    const informationOverlay = (
      <Swipeable
        onSwipedLeft={this._handleSwipeLeft}
        onSwipedRight={this._handleSwipeRight}
      >
        <div className="information-overlay" style={informationOverlayStyles}>
          <p className="information-overlay__date">{date}</p>
          <p className="information-overlay__name">{placeName}</p>
        </div>
      </Swipeable>
    );

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
        {informationOverlay}
      </div>
    );
  }
}

export default App;
