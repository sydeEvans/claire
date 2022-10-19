import styles from './App.css';

function App() {
  return (
    <div className={styles.App}>
      <a
        onClick={async () => {
          await window.openWindow('https://www.baidu.com');
        }}
      >
        打开窗口
      </a>
    </div>
  );
}

export default App;
