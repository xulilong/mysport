# 轻脂 - 简单减脂工具

一个专注、好用的网页版减脂工具，适配手机与电脑。数据保存在本机，无需注册。

**流程**：记录当前情况（身体数据 + 体重）→ 根据情况与目标生成每日饮食与运动建议 → 以任务形式展示，完成一项打勾一项，督促达成目标。

## 功能

- **首页**
  - **当前情况**：当前体重、目标体重、BMI、今日热量进度；可跳转编辑身体数据、记录体重、记录饮食
  - **每日任务**：按你设置的「身体数据 + 目标」自动生成当日饮食建议（早/午/晚/加餐各约多少 kcal）和运动建议（按活动量推荐步行、有氧、力量、拉伸等）；每项任务可打勾完成，打勾状态会保存
  - 支持选择日期查看历史某天的任务与完成情况
- **热量计算器**：输入身高、体重、年龄、性别、活动量，得到 BMR、TDEE 和减脂建议摄入（基于 Mifflin-St Jeor 公式）
- **体重记录**：按日期记录体重，查看近期趋势图，支持删除
- **饮食记录**：按日记录早/午/晚餐与加餐热量，对比每日目标
- **设置**：填写身体数据（身高、体重、目标体重、年龄、性别、活动量），用于生成每日建议与热量计算

## 运行

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`。生产构建：

```bash
npm run build
npm run preview
```

## 部署到 GitHub

### 1. 在 GitHub 上创建仓库

1. 登录 [GitHub](https://github.com)，点击右上角 **+** → **New repository**
2. 仓库名可填 `mysport`（或任意名称）
3. 选择 **Public**，不勾选「Add a README」，点 **Create repository**

### 2. 本地推送到 GitHub

在项目目录执行（将 `你的用户名` 换成你的 GitHub 用户名）：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/mysport.git
git push -u origin main
```

### 3. 开启 GitHub Pages

1. 打开该仓库 → **Settings** → 左侧 **Pages**
2. 在 **Source** 中选择 **GitHub Actions**
3. 保存后，每次推送到 `main` 分支会自动构建并部署

### 4. 访问线上地址

部署完成后，在 **Settings → Pages** 或 **Actions** 里可看到页面地址，一般为：

- `https://你的用户名.github.io/mysport/`

首次部署或修改代码后推送，约 1–2 分钟即可生效。

---

## 技术

- React 18 + TypeScript + Vite
- React Router
- 本地存储（localStorage），无后端

## 设计思路

相比市面常见减脂 APP，本工具尽量做到：

1. **更简单**：只保留「热量目标 → 体重记录 → 饮食记录」核心链路，无社交、无广告、无付费
2. **更轻**：网页即用，无需下载；数据在本机，隐私可控
3. **更专注**：一屏内看到今日进度与体重趋势，减少干扰

减脂建议热量按约 20% 热量缺口计算（约每周减 0.5kg），最低不低于 1200 kcal。
