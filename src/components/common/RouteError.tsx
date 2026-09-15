export function RouteError() {
  return (
    <main role="alert" style={{ maxWidth: 480, margin: '10vh auto', padding: 24 }}>
      <h1>页面暂时没有打开</h1>
      <p>请重新加载后再试。学习记录保存在这台设备上。</p>
      <button type="button" onClick={() => window.location.reload()}>
        重新加载
      </button>
      <p>
        <a href={`${import.meta.env.BASE_URL}map`}>返回魔法地图</a>
      </p>
    </main>
  );
}
