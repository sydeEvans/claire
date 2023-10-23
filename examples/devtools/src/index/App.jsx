import style from './App.module.css';
import { Button } from 'antd';

function openWindow(url) {
  return new Promise((resolve, reject) => {
    window.claire.call(
      'rpc',
      {
        domain: 'Custom',
        method: 'openWindow',
        params: [url],
      },
      {
        success: resolve,
        fail: reject,
      },
    );
  });
}

function openDevtools(url) {
  return new Promise((resolve, reject) => {
    window.claire.call(
      'rpc',
      {
        domain: 'Custom',
        method: 'openDevtools',
        params: [url],
      },
      {
        success: resolve,
        fail: reject,
      },
    );
  });
}

function App() {
  return (
    <div className={style.app}>
      <Button
        type={'primary'}
        onClick={async () => {
          const { devtool_app } = await openWindow('https://www.taobao.com');
          await openDevtools(`http://localhost:5173/devtool.html?devtool_app=${encodeURIComponent(devtool_app)}`);
        }}
      >
        开始调试
      </Button>
    </div>
  );
}

export default App;
