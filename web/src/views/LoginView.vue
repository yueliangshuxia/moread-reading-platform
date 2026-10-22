<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";
import Icon from "../components/Icon.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();

const mode = ref("login");
const name = ref("");
const email = ref("reader@moread.cn");
const password = ref("123456");
const error = ref("");
const submitting = ref(false);

function setMode(next) {
  mode.value = next;
  error.value = "";
}

function fillDemo(kind) {
  mode.value = "login";
  if (kind === "admin") {
    email.value = "admin@moread.cn";
    password.value = "admin123";
  } else {
    email.value = "reader@moread.cn";
    password.value = "123456";
  }
  error.value = "";
}

async function submit() {
  error.value = "";
  const value = email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    error.value = "请输入有效的邮箱地址";
    return;
  }
  if (password.value.length < 6) {
    error.value = "密码至少 6 位";
    return;
  }
  if (mode.value === "register" && name.value.trim().length < 2) {
    error.value = "请输入至少 2 个字的昵称";
    return;
  }
  submitting.value = true;
  try {
    if (mode.value === "login") {
      await auth.login(value, password.value);
    } else {
      await auth.register(name.value.trim(), value, password.value);
    }
    ui.notify(mode.value === "login" ? "登录成功，正在进入书房…" : "账号已创建，正在进入书房…", "check-circle");
    const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "";
    if (redirect) router.push(redirect);
    else if (auth.isAdmin) router.push("/admin");
    else router.push("/");
  } catch (e) {
    error.value = e.message;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <section class="login-art" aria-label="墨阅介绍">
      <div class="login-art__brand">
        <span class="rail__seal" style="width:34px;height:34px;font-size:19px">阅</span>
        <span>墨阅 MoRead</span>
      </div>
      <div>
        <p class="login-art__quote">书不会催人，<br>这一点，比很多事都温柔。</p>
        <p class="login-art__by">——《灯下》，墨阅样章</p>
      </div>
      <div class="login-art__figure">
        <img src="/assets/img/undraw/reading_6jjr.svg" alt="一个人坐在椅子上读书">
      </div>
      <p class="login-art__foot">一个把找书、读书、记书连在一起的数字书房。<br>插画来自 unDraw，摄影素材来自 Pexels。</p>
    </section>

    <section class="login-form-wrap">
      <div class="login-top">
        <RouterLink class="icon-btn" to="/" aria-label="返回首页"><Icon name="arrow-left" /></RouterLink>
        <button class="icon-btn" type="button" aria-label="切换主题" @click="ui.toggleTheme()">
          <Icon :name="ui.theme === 'dark' ? 'sun' : 'moon'" />
        </button>
      </div>

      <div class="login-card">
        <div>
          <p class="kicker">墨阅账号</p>
          <h1>{{ mode === "login" ? "欢迎回到墨阅" : "在墨阅留一个位置" }}</h1>
          <p class="login-card__sub">
            {{ mode === "login" ? "继续上次的阅读，或者从书架里挑一本新的。" : "注册后可以保存书架、笔记与阅读进度。" }}
          </p>
        </div>

        <div class="login-tabs" role="tablist" aria-label="登录或注册">
          <button class="tab" :class="{ 'is-active': mode === 'login' }" type="button" @click="setMode('login')">登录</button>
          <button class="tab" :class="{ 'is-active': mode === 'register' }" type="button" @click="setMode('register')">注册</button>
        </div>

        <form class="login-form" @submit.prevent="submit">
          <div v-if="mode === 'register'" class="field">
            <label for="authName">昵称</label>
            <input id="authName" v-model="name" class="input" type="text" autocomplete="nickname" placeholder="你希望别人怎么称呼你">
          </div>
          <div class="field">
            <label for="authEmail">邮箱</label>
            <input id="authEmail" v-model="email" class="input" type="email" autocomplete="email" placeholder="name@example.com">
          </div>
          <div class="field">
            <label for="authPassword">密码</label>
            <input id="authPassword" v-model="password" class="input" type="password" autocomplete="current-password" placeholder="至少 6 位">
          </div>
          <p v-if="error" class="field__error" role="alert">{{ error }}</p>
          <button class="btn btn--accent btn--wide" type="submit" :disabled="submitting">
            {{ submitting ? "请稍候…" : (mode === "login" ? "登录" : "创建账号") }}
          </button>
        </form>

        <div class="login-divider">演示账号</div>
        <div class="demo-accounts">
          <div class="row between wrap gap-6">
            <span><strong>读者：</strong>reader@moread.cn / 123456</span>
            <button class="btn btn--quiet btn--sm" type="button" @click="fillDemo('reader')">填入</button>
          </div>
          <div class="row between wrap gap-6">
            <span><strong>管理员：</strong>admin@moread.cn / admin123</span>
            <button class="btn btn--quiet btn--sm" type="button" @click="fillDemo('admin')">填入</button>
          </div>
        </div>

        <RouterLink class="btn btn--ghost btn--wide" to="/">以游客身份看看</RouterLink>
        <p class="login-card__foot">
          本站为毕业设计演示，账号与阅读数据保存在本地后端。登录状态保存在浏览器。<br>
          继续即表示你同意用户协议与隐私说明。
        </p>
      </div>
    </section>
  </div>
</template>
