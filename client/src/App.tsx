import React, { Component, ChangeEvent } from "react";
import { solid, split, isRecord, Square, fromJson } from './square';
import { Editor } from './Editor';


type AppState = {
  // will probably need something here
  saveName?: string;
  afterCreate: boolean;
  fileList?: JSX.Element[];
  showFile: boolean;
  saveSquare: Square;
}

type AppProps = {
  fileName?: string;
};

export class App extends Component<AppProps, AppState> {

  constructor(props: AppProps ) {
    super(props);
    this.state = {showFile: false, saveName: props.fileName, afterCreate: false, saveSquare: split(solid("blue"), solid("orange"), solid("purple"), solid("red"))};
  }

  componentDidMount = (): void => {
    this.doRefreshListChange();  
  };
  
  render = (): JSX.Element => {
    if (this.state.showFile === true){
      return <Editor initialState={this.state.saveSquare} initialName={this.state.saveName}/> 
    } else if (this.state.afterCreate === false){
      return <div><b>Files</b><br></br>{this.renderList()}<br></br>
        <input type="text" value={this.state.saveName} onChange={this.doTextChange}>
        </input><button type = "button" onClick={this.doCreateClick}>Create</button></div>
    } else {
      const sq = split(solid("blue"), solid("orange"), solid("purple"), solid("red"));
      return <Editor initialState={sq} initialName={this.state.saveName}/>
    }
  };

  renderList = (): JSX.Element => {
    return <div>{this.state.fileList}</div>
  };

  doTextChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({saveName: evt.target.value});
  }

  doCreateClick = (): void => {
    // TODO: implement
    if (this.state.saveName === undefined || this.state.saveName === "" || this.state.saveName.includes(" ")) {
      alert("enter a valid name");
      return;
    }
    this.setState({afterCreate: true});
  };

  // TODO: add some functions to access routes and handle state changes probably
  doRefreshListChange = (): void => {
    fetch("/api/list")
        .then(this.doListResp)
        .catch(() => this.doListError("failed to connect to server"));
  };

  doListResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doListJson)
         .catch(() => this.doListError("200 response is not valid JSON"));
    } else if (res.status === 400) {
      res.text().then(this.doListError)
         .catch(() => this.doListError("400 response is not text"));
    } else {
      this.doListError(`bad status code ${res.status}`);
    }
  };

  doListJson = (val: unknown): void =>{
    if (!isRecord(val)) {
      console.error("bad data from /list: not a record", val)
      return;
    }

    if (!Array.isArray(val.savesList)) {
      console.error("not an array", val);
      return;
    }
    
    const listJsx: JSX.Element[] = [];
    for (const i of val.savesList) {
        listJsx.push(<li onClick={qqq => this.doFileClick(i)}><a href="#">{i}</a></li>);
      }

    setTimeout(this.doRefreshListChange, 2000);
    this.setState({fileList: listJsx});
  };

  doListError = (msg: string): void => {
    console.error(`Error fetching /list: ${msg}`);
  };

  doFileClick = (i: string): void =>{
    fetch("/api/load?name="+i)
        .then(this.doLoadResp)
        .catch(() => this.doLoadError("failed to connect to server"));
  };

  doLoadJson = (val: unknown): void =>{
    if (!isRecord(val)) {
      console.error("bad data from /load: not a record", val)
      return;
    }
    this.setState({saveSquare: fromJson(val.savedDrawing), showFile: true});
  };

  doLoadResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doLoadJson)
         .catch(() => this.doLoadError("200 response is not valid JSON"));
    } else if (res.status === 400) {
      res.text().then(this.doLoadError)
         .catch(() => this.doLoadError("400 response is not text"));
    } else {
      this.doLoadError(`bad status code ${res.status}`);
    }
  };

  doLoadError = (msg: string): void => {
    console.error(`Error fetching /load: ${msg}`);
  };

}
