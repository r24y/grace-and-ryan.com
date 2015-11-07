import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import kramed from 'kramed';

kramed.setOptions({
  sanitize: false
});

const PHOTO_ANGLE_VARIANCE = 30;
const PHOTO_INTERVAL = 5e3;
const FRAMERATE = 24;
const SLIDE_SPEED = 60e-2;
const PHYSICS_COEFF = 0.15;

let leftPanel = {
  width: $('.left-panel').width(),
  height: $('.left-panel').height()
};

const FRAME_DUR = 1e3/FRAMERATE;

class Polaroid extends Component {
  render() {
    return (<div className="polaroid">
      <img src={this.props.src}/>
    </div>);
  }
}

class MenuItem extends Component {
  render() {
    const bedashed = this.props.name.replace(/\s/g,'-').toLowerCase();
    return (<a className="item" 
               onClick={(!this.props.href) && () => loadPage(bedashed)}
               href={this.props.href || '#' + bedashed}>{this.props.name}</a>);
  }
}

const CHURCH_LOCATION = [41.6662237, -70.1857255];
const RECEPTION_LOCATION = [41.6516743,-70.1694562];

const callbacks = {
  ceremony() {
    const Hydda_Full = L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
      attribution: '<a href="http://openstreetmap.se/" target="_blank">Tiles</a> | <a href="http://www.openstreetmap.org/copyright">Map data</a>'
    });
    const map = L.map('map').setView(CHURCH_LOCATION, 16);
    Hydda_Full.addTo(map);
    const marker = L.marker(CHURCH_LOCATION).addTo(map);
    marker.bindPopup('<a href="https://goo.gl/maps/q6KSGYwgVkG2" target="_blank">' + $('blockquote').first().html() + '</a>').openPopup();
  },
  reception() {
    const Hydda_Full = L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
      attribution: '<a href="http://openstreetmap.se/" target="_blank">Tiles</a> | <a href="http://www.openstreetmap.org/copyright">Map data</a>'
    });
    const map = L.map('map').setView(RECEPTION_LOCATION, 16);
    Hydda_Full.addTo(map);
    const marker = L.marker(RECEPTION_LOCATION).addTo(map);
    marker.bindPopup('<a href="https://goo.gl/maps/qYi4LZAnndE2" target="_blank">' + $('blockquote').first().html() + '</a>').openPopup();
  }
};

function loadPage(title) {
  console.log(`Loading ${title}`);
  document.location.hash = title;
  $.get(`content/${title}.md`).then(content => {
    $('#page-content').html(kramed(content));
    if (callbacks[title]) {
      callbacks[title]();
    }
  });
}

if (document.location.hash) loadPage(document.location.hash.replace(/^#/,''));

let n = 0;

function makePhoto(src) {
  const targetAngle = Math.random() * PHOTO_ANGLE_VARIANCE - PHOTO_ANGLE_VARIANCE / 2;
  return {
    targetX: (0.4 + Math.random() * 0.5) * leftPanel.width,
    targetY: (Math.random() * 0.1) * leftPanel.height,
    targetAngle,
    x: 1200,
    y: (Math.random() * 0.5) * leftPanel.height,
    angle: targetAngle + Math.random() * PHOTO_ANGLE_VARIANCE * 10 - PHOTO_ANGLE_VARIANCE * 5,
    createdAt: +new Date(),
    n: n++,
    src
  };
}

function linterp(x_current, x_target) {
  return (1 - PHYSICS_COEFF) * x_current + PHYSICS_COEFF * x_target;
}

function tick(photo) {
  const {x,y,angle,targetX,targetY,targetAngle} = photo;
  return {
    ...photo,
    x: linterp(x, targetX),
    y: linterp(y, targetY),
    angle: linterp(angle, targetAngle),
    targetY: targetY + SLIDE_SPEED
  };
}

function isAlive(photo) {
  return (photo.y - leftPanel.height) < 500;
}

const FRAMES_BETWEEN_NEW_PHOTOS = PHOTO_INTERVAL / FRAME_DUR;

class LeftPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      sources: [],
      n: FRAMES_BETWEEN_NEW_PHOTOS + 1
    };
    this.fpsInterval = setInterval(this.tick.bind(this), FRAME_DUR);
  }
  componentDidMount() {
    $.get('/images.json').then((sources) => {
      this.setState({
        sources: sources.map(src => ({src, n: 0}))
      });
    });
  }
  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
  tick() {
    let {photos, n, sources} = this.state;
    let newPhotos = [];
    if (n > FRAMES_BETWEEN_NEW_PHOTOS) {
      n -= FRAMES_BETWEEN_NEW_PHOTOS;
      n = n % 1;
      const i = Math.floor(Math.random() * sources.length);
      const source = sources[i];
      if (!source) return;
      const {src} = source;
      newPhotos = [makePhoto(src)];
      source.n++;
    }
    this.setState({
      n: n + 1,
      photos: this.state.photos.filter(isAlive).concat(newPhotos).map(tick),
    });
  }
  renderMenuItems() {
    return ([
      //"About us",
      //"Proposal",
      "Ceremony",
      "Reception",
      //"Wedding party",
      "Registry",
      "The date"
    ]).map((name,i) => (<MenuItem key={i} name={name}/>));
  }
  renderPhotos() {
    return this.state.photos.map(photo => (<div className="polaroid" style={{
      top: 0,
      left: 0,
      transform: `translate(${photo.x}px, ${photo.y}px) rotate(${photo.angle}deg) translate(-50%,-50%)`
    }} key={photo.n}>
      <img src={photo.src}/>
    </div>));
  }
  render() {
    return (<div>
      <h1 className="names">
        <a href="#">
          <span>Grace</span>
          <span>&</span>
          <span>Ryan</span>
        </a>
      </h1>
      {this.renderPhotos()}
      <div className="huge inverted secondary vertical ui menu" style={{
        zIndex: 1002
      }}>
        {this.renderMenuItems()}
      </div>
    </div>);
  }
}

class CountdownHeader extends Component {
  constructor(props){
    super(props);
    this.state = {
      status: 'June 25, 2016'
    };
    this.fpsInterval = setInterval(this.tick.bind(this), 1e3);
    // Please note: 'June' = 5 because the months start at 0
    this.date = (new Date(2016, 5, 25, 11, 0, 0));

  }
  componentDidMount() {
    this.tick();
  }
  tick() {
    const now = (new Date);
    let diff = this.date - now;
    diff /= 1e3;
    const seconds = Math.floor(diff % 60);
    diff /= 60;
    const minutes = Math.floor(diff % 60);
    diff /= 60;
    const hours = Math.floor(diff % 24);
    diff /= 24;
    const days = Math.floor(diff);
    this.setState({
      days, hours, minutes, seconds
    });
  }
  render() {
    return (<div className="ui statistics">
      {
        ['days','hours','minutes','seconds'].map(unit => <div key={unit} className="ui mini statistic">
          <div className="value">{this.state[unit]}</div>
          <div className="label">{unit}</div>
        </div>)
      }
    </div>);
  }
}

ReactDOM.render(<LeftPanel/>, $('.left-panel')[0]);
ReactDOM.render(<CountdownHeader/>, $('.wedding-countdown')[0]);


$(() => {
  const $leftPanel = $('.left-panel');

  function updateDims() {
    leftPanel = {
      width: $leftPanel.width(),
      height: $leftPanel.height()
    };
  }
  $(window).on('resize', updateDims);
  updateDims();
});
