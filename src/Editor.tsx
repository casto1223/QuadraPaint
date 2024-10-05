import React, { Component, ChangeEvent, MouseEvent } from "react";
import { Square, Path, findSubTreeRoot, replaceSubTreeRoot, split, solid, toColor, toJson, isRecord  } from './square';
import { SquareElem } from "./square_draw";
import { rev, nil } from "./list";
import { App } from './App';

type EditorProps = {
  /** Initial state of the file. */
  initialState: Square;
  initialName?: string;
};


type EditorState = {
  /** The root square of all squares in the design */
  root: Square;

  /** Path to the square that is currently clicked on, if any */
  selected?: Path;

  fileName?: string;

  showApp: boolean;
};


/** UI for editing the image. */
export class Editor extends Component<EditorProps, EditorState> {

  constructor(props: EditorProps) {
    super(props);

    this.state = { root: props.initialState, fileName: props.initialName, showApp: false };
  }

  render = (): JSX.Element => {
    // TODO: add some editing tools here
    if (this.state.showApp === true){
      return <App/>;
    } else if (this.state.selected === undefined) {
       return <table>
                <tr><td><SquareElem width={600} height={600}
                      square={this.state.root} selected={this.state.selected}
                      onClick={this.doSquareClick}></SquareElem>
                    </td>
                  <td><b>Tools</b><br></br><button type = "button" onClick={this.doSaveClick}>save</button>
                  </td>
                  <td><br></br><button type = "button" onClick={this.doCloseClick}>close</button>
                  </td>
              </tr>
              </table>;
    } else {
      return <table>
              <tr>
                <td><SquareElem width={600} height={600}
                      square={this.state.root} selected={this.state.selected}
                      onClick={this.doSquareClick}></SquareElem>
                </td>
                <td><b>Tools</b><br></br><button type = "button" onClick={this.doSplitClick}>split</button><br></br><button type = "button" onClick={this.doSaveClick}>save</button>
                </td>
                <td><br></br><button type = "button" onClick={this.doMergeClick}>merge</button><br></br><button type = "button" onClick={this.doCloseClick}>close</button>
                </td>
                <td><select onChange={this.doColorChange}>
                              <option value="white">white</option>
                              <option value="red">red</option>
                              <option value="orange">orange</option>
                              <option value="yellow">yellow</option>
                              <option value="green">green</option>
                              <option value="blue">blue</option>
                              <option value="purple">purple</option>
                              </select>
                </td>
              </tr>
          </table>;
    }
};

  doSquareClick = (path: Path): void => {
    // TODO: remove this code, do something with the path to the selected square
    this.setState({selected: path});
  }

  doSplitClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
    // TODO: implement
    if (this.state.selected === undefined) return;
    const sq3 = findSubTreeRoot(this.state.root, this.state.selected);
    if (sq3 === undefined) return;
    if (sq3.kind !== "solid") return;
    const sq2 = split(solid(sq3.color), solid(sq3.color), solid(sq3.color), solid(sq3.color));
    const newSq = replaceSubTreeRoot(this.state.root, this.state.selected, sq2);
    this.setState({root: newSq});
  };

  doMergeClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
    // TODO: implement
    if (this.state.selected === undefined) return;
    const revPath = rev(this.state.selected);
    if (revPath === nil) return;
    const pathPop = rev(revPath.tl);
    const sq3 = findSubTreeRoot(this.state.root, this.state.selected);
    if (sq3 === undefined) return;
    if (sq3.kind !== "solid") return;
    const newSq = replaceSubTreeRoot(this.state.root, pathPop, solid(sq3.color));
    this.setState({root: newSq});
  }

  doColorChange = (_evt: ChangeEvent<HTMLSelectElement>): void => {
    // TODO: implement
    if (this.state.selected === undefined) return;
    const newSq = replaceSubTreeRoot(this.state.root, this.state.selected, solid(toColor(_evt.target.value)));
    this.setState({root: newSq});
  };

  doSaveClick = (): void => {
    // TODO: implement
    const args = {name: this.state.fileName, value: toJson(this.state.root)};
    fetch("/api/save", {method: "POST",
      body: JSON.stringify(args),
      headers: {"Content-Type": "application/json"}})
     
      .then(this.doSaveResp)
      .catch(() => this.doSaveError("failed to connect to server"));
  };

  doSaveResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doSaveJson)
         .catch(() => this.doSaveError("200 response is not valid JSON"));
    } else if (res.status === 400) {
      res.text().then(this.doSaveError)
         .catch(() => this.doSaveError("400 response is not text"));
    } else {
      this.doSaveError(`bad status code ${res.status}`);
    }
  };

  doSaveJson = (val: unknown): void => {  
    if (!isRecord(val)) {
      console.error("bad data from /list: not a record", val)
      return;
    }
    alert("file is successfully saved as " + this.state.fileName);
  };

  doSaveError = (msg: string): void => {
    console.error(`Error fetching /save: ${msg}`);
  };

  doCloseClick = (): void => {
    // TODO: implement
    this.setState({showApp: true});
  };

}
