<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        <div class="footer__brand-row">
          <span class="rail__seal" style="background:var(--oxblood);color:#f4e9d8">阅</span>
          墨阅 MoRead
        </div>
        <p>把找书、读书、记书连在一起。一个为深度阅读而做的数字书房。</p>
      </div>
      <div class="footer__cols">
        <div class="footer__col">
          <h4>探索</h4>
          <RouterLink to="/discover">全部书库</RouterLink>
          <RouterLink to="/community">本周共读</RouterLink>
          <RouterLink to="/shelf">我的书架</RouterLink>
        </div>
        <div class="footer__col">
          <h4>关于</h4>
          <RouterLink to="/discover">关于墨阅</RouterLink>
          <RouterLink to="/community">社区公约</RouterLink>
          <RouterLink to="/profile">个人中心</RouterLink>
        </div>
        <div class="footer__col">
          <h4>演示</h4>
          <RouterLink to="/admin">管理后台</RouterLink>
          <RouterLink to="/login">登录 / 注册</RouterLink>
          <RouterLink to="/not-found">404 页面</RouterLink>
        </div>
      </div>
    </div>
    <div class="footer__base">
      <span>© 2026 墨阅 MoRead · 本站为毕业设计演示，书籍与用户数据为虚构或公共领域内容。</span>
      <span>插画 unDraw · 摄影 Pexels · 图标 Iconify (Phosphor) · 占位图 Picsum Photos</span>
    </div>
  </footer>
</template>
