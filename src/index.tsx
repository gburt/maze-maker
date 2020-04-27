import React, {Component} from 'react';
import {render} from 'react-dom';
import {Maze, NewMaze} from './maze';
import {Box} from './Box';
import './style.css';

interface AppState {
  height: number;
  width: number;
  name: string;
}

interface DrawProps {
  name: string;
  height: number;
  width: number;
}

const debug = false;

const DrawMaze = ({maze, attempt}: {maze: Maze; attempt: number}) => {
  return (
    <table>
      {maze.Boxes.map((row, i) => (
        <Row key={i} row={row} attempt={maze.Attempts[attempt]} />
      ))}
    </table>
  );
};

const Row = ({row, attempt}: {row: Box[]; attempt: Box[]}) => {
  return (
    <tr>
      {row.map((box, i) => (
        <Cell key={i} box={box} num={attempt ? attempt.indexOf(box) : 0} />
      ))}
    </tr>
  );
};

const Cell = ({box, num}: {box: Box; num: number}) => {
  return (
    <td
      className={
        Object.keys(box.Paths).join(' ') +
        (box.Start ? ' start' : '') +
        (box.End ? ' end' : '') +
        (box.diversion && debug ? ' diversion' : '') +
        (box.happyPath && debug ? ' happy' : '')
      }>
      {debug && num !== undefined && num !== -1 ? num : ''}
    </td>
  );
};

const Draw = (props: DrawProps) => {
  const [maze, setMaze] = React.useState(NewMaze(props.width, props.height));

  if (props.width !== maze.Width || props.height !== maze.Height) {
    setMaze(NewMaze(props.width, props.height));
  }

  return (
    <div>
      <h1>Happy Trail Blazing, {props.name}!</h1>
      <button onClick={() => setMaze(NewMaze(props.width, props.height))}>
        New Maze!
      </button>
      {debug && <div>we have {maze.Attempts.length} attempts</div>}

      <DrawMaze maze={maze} attempt={0} />
    </div>
  );
};

class App extends Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {width: 20, height: 20, name: 'enter name'};
  }

  render() {
    return (
      <div>
        <input
          type="number"
          aria-valuenow={this.state.width}
          aria-valuemin={2}
          aria-valuemax={100}
          value={this.state.width}
          onChange={(e: any) => this.setState({width: Number(e.target.value)})}
        />
        <input
          type="number"
          value={this.state.height}
          aria-valuenow={this.state.height}
          aria-valuemin={2}
          aria-valuemax={100}
          onChange={(e: any) => this.setState({height: Number(e.target.value)})}
        />
        <input
          type="string"
          value={this.state.name}
          onChange={(e: any) => this.setState({name: e.target.value})}
        />
        <Draw
          height={this.state.height}
          width={this.state.width}
          name={this.state.name}
        />
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
