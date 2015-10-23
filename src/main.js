import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';

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
    return (<a className="item" href={this.props.href}>{this.props.name}</a>);
  }
}

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
      const i = Math.floor(Math.random() * sources.length);
      const source = sources[i];
      const {src} = source;
      newPhotos = [makePhoto(src)];
      source.n++;
    }
    this.setState({
      n,
      photos: this.state.photos.filter(isAlive).concat(newPhotos),
    });
  }
  renderMenuItems() {
    return ([
      "About us",
      "Proposal",
      "Ceremony",
      "Reception",
      "Wedding party",
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
    this.date = (new Date(2016, 6, 25, 11, 0, 0));
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
