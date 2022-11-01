import { Tabs } from 'antd';
import './App.css';
import qs from 'query-string';

const query = qs.parse(window.location.search);

function App() {
  return (
    <div className="app">
      <Tabs defaultActiveKey="1" className="tab">
        <Tabs.TabPane tab="Tab 1" key="1" className="tabPane">
          <iframe className="iframe" src={query.devtool_app} frameBorder="0"></iframe>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Tab 2" key="2">
          Content of Tab Pane 2
        </Tabs.TabPane>
        <Tabs.TabPane tab="Tab 3" key="3">
          Content of Tab Pane 3
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

export default App;
