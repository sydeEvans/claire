import styles from './App.css';

// window.claire.call(
//   'rpc',
//   { domain: 'Tray', method: 'openWindow', params: [1, {}] },
//   {
//     success: () => {
//       console.log('xxx');
//     },
//     fail: () => {
//       console.log('fail');
//     },
//   },
// );

window.claire.call('rpc', { domain: 'Custom', method: 'log', params: [1, {}] });

function App() {
  return (
    <div className={styles.App}>
      <a
        onClick={async () => {
          window.claire.call('rpc', {
            domain: 'App',
            method: 'close',
          });
        }}
      >
        打开窗口
      </a>
    </div>
  );
}

export default App;
