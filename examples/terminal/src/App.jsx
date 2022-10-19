import styles from './App.css';

function App() {
  return (
    <div className={styles.App}>
      <a
        onClick={async () => {
          const { devtool_app } = await window.openWindow('http://local.alipay.net:3000/demo.html');
          await window.openDevtools(devtool_app);
        }}
      >
        打开窗口
      </a>
    </div>
  );
}

export default App;
