/**
 * 描述：main.js - 修复版
 * 作者：陈子聪
 * 日期：2026-01-30
 * 作用：网站的主JavaScript入口文件，处理网页的交互逻辑。
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('页面加载完成，初始化功能...');

  // 1. 初始化下拉刷新功能
  initPullToRefresh();

  // 2. 初始化左侧栏游戏中心功能
  initGameCenter();

  // 3. 初始化动态内容功能
  initDynamicContent();

  // 4. 初始化导航栏
  initNavigation();

  // 5. 初始化顶部导航栏锚点跳转
  initTopNavAnchors();

  // 5. 初始化企业微信名片功能
  setTimeout(initWechatCard, 100);

  console.log('所有功能初始化完成');
});

/**
 * 初始化顶部导航栏锚点跳转功能
 */
function initTopNavAnchors() {
  const topNavLinks = document.querySelectorAll('.navbar .nav-item a[href^="#"]');

  topNavLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        // 平滑滚动到目标元素
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        console.log('跳转到:', targetId);
      } else {
        console.warn('目标元素不存在:', targetId);
      }
    });
  });

  console.log('顶部导航栏锚点功能初始化完成');
}

/**
 * 初始化企业微信名片功能 - 简化版
 */
function initWechatCard() {
  console.log('初始化企业微信名片功能...');

  // 直接使用全局变量，避免复杂的DOM操作
  window.showWechatCard = function() {
    const modal = document.getElementById('wechatCardModal');
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => {
        modal.classList.add('show');
      }, 10);
    }
  };

  window.hideWechatCard = function() {
    const modal = document.getElementById('wechatCardModal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }
  };

  // 直接给按钮添加点击事件
  const trigger = document.getElementById('wechatCardTrigger');
  if (trigger) {
    trigger.onclick = function(e) {
      e.preventDefault();
      window.showWechatCard();
    };
  }

  // 关闭按钮
  const closeBtn = document.getElementById('closeWechatCard');
  if (closeBtn) {
    closeBtn.onclick = window.hideWechatCard;
  }

  // 遮罩层点击关闭
  const modal = document.getElementById('wechatCardModal');
  if (modal) {
    modal.onclick = function(e) {
      if (e.target === modal || e.target.classList.contains('modal-overlay')) {
        window.hideWechatCard();
      }
    };
  }

  console.log('企业微信名片功能初始化完成');
}

// 在DOMContentLoaded事件中调用企业微信名片初始化
document.addEventListener('DOMContentLoaded', function() {
  initWechatCard();
});

/**
 * 初始化下拉刷新功能
 */
function initPullToRefresh() {
  const pullRefreshContainer = document.getElementById('pullRefreshContainer');
  const pullImage = document.getElementById('pullImage');
  const pullHint = document.getElementById('pullHint');
  const pullLoading = document.getElementById('pullLoading');
  const pullComplete = document.getElementById('pullComplete');
  const pullHintBottom = document.getElementById('pullHintBottom');

  // 检查元素是否存在
  if (!pullRefreshContainer || !pullImage || !pullHint ||
    !pullLoading || !pullComplete || !pullHintBottom) {
    console.warn('下拉刷新元素不存在，跳过初始化');
    return;
  }

  let startY = 0;
  let currentY = 0;
  let pullDistance = 0;
  let isPulling = false;
  let hasShownHint = false;

  // 使用用户头像作为下拉图片
  const userAvatar = document.getElementById('userAvatar');
  if (userAvatar) {
    pullImage.src = userAvatar.src;

    // 监听头像变化，同步更新下拉图片
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
          pullImage.src = userAvatar.src;
        }
      });
    });

    observer.observe(userAvatar, { attributes: true });
  }

  // 隐藏底部提示（首次加载后3秒隐藏）
  setTimeout(() => {
    if (pullHintBottom && !hasShownHint) {
      pullHintBottom.classList.add('hide');
      hasShownHint = true;
    }
  }, 3000);

  // 触摸事件处理
  document.addEventListener('touchstart', function(e) {
    if (window.scrollY === 0) {
      startY = e.touches[0].clientY;
      isPulling = true;
      pullDistance = 0;
    }
  });

  document.addEventListener('touchmove', function(e) {
    if (!isPulling) return;

    currentY = e.touches[0].clientY;
    pullDistance = currentY - startY;

    if (pullDistance > 0) {
      e.preventDefault();
      updatePullUI(pullDistance);
    }
  });

  document.addEventListener('touchend', function() {
    if (isPulling) {
      isPulling = false;
      finishPull();
      pullDistance = 0;
    }
  });

  // 鼠标事件处理（桌面端）
  let mouseIsPulling = false;

  document.addEventListener('mousedown', function(e) {
    if (window.scrollY === 0) {
      startY = e.clientY;
      mouseIsPulling = true;
      pullDistance = 0;
    }
  });

  document.addEventListener('mousemove', function(e) {
    if (!mouseIsPulling) return;

    currentY = e.clientY;
    pullDistance = currentY - startY;

    if (pullDistance > 0) {
      e.preventDefault();
      updatePullUI(pullDistance);
    }
  });

  document.addEventListener('mouseup', function() {
    if (mouseIsPulling) {
      mouseIsPulling = false;
      finishPull();
      pullDistance = 0;
    }
  });

  // 更新下拉UI
  function updatePullUI(pullDistance) {
    const screenHeight = window.innerHeight;
    const pullPercent = Math.min(pullDistance / screenHeight, 1);

    // 30%开始显示，80%完全显示
    if (pullPercent >= 0.3) {
      const visiblePercent = (pullPercent - 0.3) / 0.5;

      if (pullPercent <= 0.8) {
        // 在30%-80%之间，线性显示
        const containerTop = -150 + (visiblePercent * 150);
        pullRefreshContainer.style.top = `${containerTop}px`;

        // 图片缩放
        const imageSize = 60 + (visiblePercent * 60);
        pullImage.style.width = `${imageSize}px`;
        pullImage.style.height = `${imageSize}px`;
        pullImage.style.opacity = 0.5 + (visiblePercent * 0.5);

        // 更新提示文字
        if (pullHint) {
          pullHint.textContent = visiblePercent < 0.7 ? "继续下拉..." : "松开刷新";
        }
      } else {
        // 超过80%，保持完全显示
        pullRefreshContainer.style.top = "0px";
        pullImage.style.width = "120px";
        pullImage.style.height = "120px";
        pullImage.style.opacity = "1";
        if (pullHint) {
          pullHint.textContent = "松开刷新";
        }
      }

      // 如果超过50%，隐藏底部提示
      if (pullPercent > 0.5 && !hasShownHint && pullHintBottom) {
        pullHintBottom.classList.add('hide');
        hasShownHint = true;
      }
    }
  }

  // 完成下拉
  function finishPull() {
    const screenHeight = window.innerHeight;
    const pullPercent = pullDistance / screenHeight;

    if (pullPercent >= 0.8) {
      // 触发刷新
      triggerRefresh();
    } else {
      // 未达到阈值，回弹
      resetPullRefresh();
    }
  }

  // 触发刷新
  function triggerRefresh() {
    // 显示加载状态
    if (pullHint) pullHint.style.display = 'none';
    if (pullLoading) pullLoading.style.display = 'flex';
    pullRefreshContainer.style.top = '0px';

    // 添加加载动画
    pullImage.style.animation = 'spin 2s linear infinite';

    // 模拟刷新过程
    setTimeout(() => {
      // 完成刷新
      if (pullLoading) pullLoading.style.display = 'none';
      if (pullComplete) pullComplete.style.display = 'flex';
      pullImage.style.animation = 'none';

      // 实际刷新操作：重新加载动态
      if (typeof loadPosts === 'function') {
        loadPosts(true);
      }

      // 2秒后隐藏刷新区域
      setTimeout(() => {
        if (pullComplete) pullComplete.style.display = 'none';
        if (pullHint) {
          pullHint.style.display = 'flex';
          pullHint.textContent = '下拉刷新';
        }
        resetPullRefresh();
      }, 2000);
    }, 1500);
  }

  // 重置下拉刷新状态
  function resetPullRefresh() {
    pullRefreshContainer.style.top = '-150px';
    pullImage.style.width = '60px';
    pullImage.style.height = '60px';
    pullImage.style.opacity = '1';
    pullImage.style.animation = 'none';
    if (pullHint) {
      pullHint.textContent = '下拉刷新';
    }
  }

  // 监听滚动，当滚动到顶部时重新显示底部提示
  let lastScrollTop = 0;
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // 滚动到顶部
    if (scrollTop === 0 && lastScrollTop > 0) {
      if (hasShownHint && pullHintBottom) {
        // 延迟显示提示
        setTimeout(() => {
          pullHintBottom.classList.remove('hide');
        }, 1000);
      }
    }

    lastScrollTop = scrollTop;
  });

  // 添加旋转动画关键帧
  if (!document.getElementById('spinAnimation')) {
    const style = document.createElement('style');
    style.id = 'spinAnimation';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

// 游戏中心初始化函数
function initGameCenter() {
  console.log('初始化游戏中心...');

  // 游戏数据
  const gameData = {
    flappyBird: {
      name: 'Flappy Bird',
      path: 'games-text/flappyBird－1－0（暂定版）/flappyBird.html',
      cover: 'images/game-covers/flabby-bird-cover.jpg',
      description: '经典小鸟飞行游戏',
      highScore: localStorage.getItem('flappyBird_highScore') || 0
    },
    piano: {
      name: '钢琴模拟器',
      path: 'games-text/piano(暂定版)/index.html',
      cover: 'images/game-covers/game-cover.jpg',
      description: '在线弹奏钢琴',
      highScore: localStorage.getItem('piano_highScore') || 0
    },
    whiteBoard: {
      name: '画板',
      path: 'games-text/whiteBoard-2-1（暂定版）/index.html',
      cover: 'images/game-covers/drawing-board-cover.jpg',
      description: '创意绘画工具',
      highScore: localStorage.getItem('whiteBoard_highScore') || 0
    },
    snake: {
      name: '贪吃蛇',
      path: 'games-text/snake/index.html',
      cover: 'images/game-covers/snake-cover.jpg',
      description: '经典贪吃蛇游戏',
      highScore: localStorage.getItem('snake_highScore') || 0
    },
    tetris: {
      name: '俄罗斯方块',
      path: 'games-text/tetris(暂定版)/index.html',
      cover: 'images/game-covers/tetris-cover.jpg',
      description: '经典益智游戏',
      highScore: localStorage.getItem('tetris_highScore') || 0
    }
  };

  // 获取左侧栏元素
  const sidebarLeaderboardBtn = document.getElementById('sidebarLeaderboard');
  const sidebarSelectGameBtn = document.getElementById('sidebarSelectGame');
  const sidebarStartGameBtn = document.getElementById('sidebarStartGame');
  const gameListContainer = document.getElementById('gameListContainer');
  const gameList = document.getElementById('gameList');
  const leaderboardModal = document.getElementById('leaderboardModal');
  const closeLeaderboard = document.getElementById('closeLeaderboard');
  const leaderboardList = document.getElementById('leaderboardList');

  // 检查元素是否存在
  if (!sidebarLeaderboardBtn || !sidebarSelectGameBtn || !sidebarStartGameBtn ||
      !gameListContainer || !gameList || !leaderboardModal || !closeLeaderboard || !leaderboardList) {
    console.warn('左侧栏游戏中心元素不存在，跳过初始化');
    return;
  }

  let selectedGame = null;
  let isGameListVisible = false;

  // 初始化游戏列表
  function initGameList() {
    gameList.innerHTML = '';

    Object.entries(gameData).forEach(([key, game]) => {
      const gameItem = document.createElement('div');
      gameItem.className = 'game-list-item';
      gameItem.dataset.game = key;

      // 设置背景图片 - 居中cover显示
      gameItem.style.backgroundImage = `url('${game.cover}')`;
      gameItem.style.backgroundSize = 'cover';
      gameItem.style.backgroundPosition = 'center';
      gameItem.style.backgroundRepeat = 'no-repeat';

      gameItem.innerHTML = `
        <div class="game-list-icon">
          <img src="${game.cover}" alt="${game.name}">
        </div>
        <div class="game-list-info">
          <h4>${game.name}</h4>
          <p>${game.description}</p>
        </div>
        <div class="game-list-score">${game.highScore}</div>
      `;

      gameItem.addEventListener('click', () => {
        // 移除其他项的选择状态
        document.querySelectorAll('.game-list-item').forEach(item => {
          item.classList.remove('selected');
        });

        // 添加当前项的选择状态
        gameItem.classList.add('selected');
        selectedGame = key;

        // 更新开始游戏按钮文本
        sidebarStartGameBtn.innerHTML = `<i class="fas fa-play"></i><span>开始 ${game.name}</span>`;
        sidebarStartGameBtn.disabled = false;
        sidebarStartGameBtn.style.opacity = '1';
        sidebarStartGameBtn.style.cursor = 'pointer';

        // 3秒后自动收起游戏列表
        setTimeout(() => {
          toggleGameList();
        }, 3000);
      });

      gameList.appendChild(gameItem);
    });
  }

  // 切换游戏列表显示状态
  function toggleGameList() {
    isGameListVisible = !isGameListVisible;

    if (isGameListVisible) {
      gameListContainer.classList.remove('hidden');
      gameListContainer.classList.add('show');
    } else {
      gameListContainer.classList.remove('show');
      gameListContainer.classList.add('hidden');
    }
  }

  // 显示排行榜函数
  function showLeaderboard() {
    // 刷新游戏数据（从localStorage重新获取最新得分）
    refreshGameScores();

    // 生成排行榜内容
    const sortedGames = Object.entries(gameData)
      .sort(([,a], [,b]) => b.highScore - a.highScore)
      .filter(([,game]) => game.highScore > 0);

    if (sortedGames.length === 0) {
      leaderboardList.innerHTML = '<div class="no-scores" style="text-align: center; color: rgba(255,255,255,0.7); padding: 20px;">功能开发中. . .</div>';
    } else {
      leaderboardList.innerHTML = sortedGames.map(([key, game], index) => `
        <div class="leaderboard-item">
          <div class="game-info">
            <div class="game-cover-small">
              <img src="${game.cover}" alt="${game.name}">
            </div>
            <div class="game-details">
              <h4>${game.name}</h4>
              <p>${game.description}</p>
            </div>
          </div>
          <div class="score">${game.highScore}</div>
        </div>
      `).join('');
    }

    leaderboardModal.style.display = 'flex';
  }

  // 刷新游戏得分函数
  function refreshGameScores() {
    Object.keys(gameData).forEach(key => {
      const storedScore = localStorage.getItem(`${key}_highScore`);
      if (storedScore !== null) {
        gameData[key].highScore = parseInt(storedScore) || 0;
      }
    });

    // 更新游戏列表中的得分显示
    updateGameListScores();
  }

  // 更新游戏列表中的得分显示
  function updateGameListScores() {
    document.querySelectorAll('.game-list-item').forEach(item => {
      const gameKey = item.dataset.game;
      const scoreElement = item.querySelector('.game-list-score');
      if (scoreElement && gameData[gameKey]) {
        scoreElement.textContent = gameData[gameKey].highScore;
      }
    });
  }

  // 更新游戏得分函数（供外部游戏调用）
  function updateGameScore(gameKey, newScore) {
    if (!gameData[gameKey]) {
      console.warn(`未知的游戏键: ${gameKey}`);
      return false;
    }

    const currentScore = gameData[gameKey].highScore;
    if (newScore > currentScore) {
      // 更新最高分
      gameData[gameKey].highScore = newScore;
      localStorage.setItem(`${gameKey}_highScore`, newScore.toString());

      // 更新UI显示
      updateGameListScores();

      console.log(`游戏 ${gameData[gameKey].name} 最高分更新为: ${newScore}`);
      return true;
    }

    return false;
  }

  // 获取游戏最高分函数（供外部游戏调用）
  function getGameHighScore(gameKey) {
    if (!gameData[gameKey]) {
      console.warn(`未知的游戏键: ${gameKey}`);
      return 0;
    }
    return gameData[gameKey].highScore;
  }

  // 监听localStorage变化（当其他页面或标签页更新分数时）
  window.addEventListener('storage', function(e) {
    if (e.key && e.key.endsWith('_highScore')) {
      const gameKey = e.key.replace('_highScore', '');
      if (gameData[gameKey]) {
        const newScore = parseInt(e.newValue) || 0;
        if (newScore > gameData[gameKey].highScore) {
          gameData[gameKey].highScore = newScore;
          updateGameListScores();
          console.log(`检测到 ${gameData[gameKey].name} 分数更新: ${newScore}`);
        }
      }
    }
  });

  // 开始游戏函数
  function startGame(gameKey) {
    const game = gameData[gameKey];
    if (game && game.path) {
      try {
        // 尝试打开游戏
        const gameWindow = window.open(game.path, '_blank');

        // 检查窗口是否成功打开
        if (!gameWindow || gameWindow.closed || typeof gameWindow.closed === 'undefined') {
          throw new Error('无法打开游戏窗口，可能是浏览器阻止了弹窗');
        }

        // 监听窗口关闭事件，更新状态
        const checkWindow = setInterval(() => {
          if (gameWindow.closed) {
            clearInterval(checkWindow);
            console.log(`游戏窗口已关闭: ${game.name}`);

            // 游戏结束后刷新排行榜数据
            refreshGameScores();
          }
        }, 1000);

      } catch (error) {
        console.error(`打开游戏失败: ${game.name}`, error);

        // 友好的错误提示
        if (error.message.includes('弹窗')) {
          alert(`无法打开游戏 "${game.name}"\n\n请检查浏览器设置：\n1. 允许网站弹出窗口\n2. 或尝试手动访问：${game.path}`);
        } else {
          alert(`游戏 "${game.name}" 暂时无法访问\n\n错误信息：${error.message}\n\n请检查游戏文件是否存在：${game.path}`);
        }
      }
    } else {
      alert('游戏数据错误，请刷新页面重试');
    }
  }

  // 事件监听器
  sidebarLeaderboardBtn.addEventListener('click', showLeaderboard);

  sidebarSelectGameBtn.addEventListener('click', toggleGameList);

  sidebarStartGameBtn.addEventListener('click', () => {
    if (selectedGame) {
      startGame(selectedGame);
    } else {
      alert('请先选择一个游戏！');
    }
  });

  // 关闭排行榜弹窗
  closeLeaderboard.addEventListener('click', () => {
    leaderboardModal.style.display = 'none';
  });

  // 点击弹窗外部关闭
  leaderboardModal.addEventListener('click', (e) => {
    if (e.target === leaderboardModal) {
      leaderboardModal.style.display = 'none';
    }
  });

  // 初始化游戏列表
  initGameList();

  // 默认选择第一个游戏
  const firstGameKey = Object.keys(gameData)[0];
  if (firstGameKey) {
    selectedGame = firstGameKey;
    const firstGameItem = document.querySelector(`[data-game="${firstGameKey}"]`);
    if (firstGameItem) {
      firstGameItem.classList.add('selected');
    }
    sidebarStartGameBtn.innerHTML = `<i class="fas fa-play"></i><span>开始 ${gameData[firstGameKey].name}</span>`;
    sidebarStartGameBtn.disabled = false;
    sidebarStartGameBtn.style.opacity = '1';
    sidebarStartGameBtn.style.cursor = 'pointer';
  } else {
    sidebarStartGameBtn.disabled = true;
    sidebarStartGameBtn.style.opacity = '0.6';
    sidebarStartGameBtn.style.cursor = 'not-allowed';
  }

  // 将得分管理函数暴露给全局，供游戏页面调用
  window.gameScoreManager = {
    updateScore: updateGameScore,
    getHighScore: getGameHighScore
  };

  console.log('左侧栏游戏中心初始化完成');
}
/**
 * 初始化动态内容功能
 */
function initDynamicContent() {
  // 动态数据
  const mockPosts = [
    {
      id: 1,
      user: 'Avocado',
      avatar: '/images/default-avatar.jpg',
      time: '2小时前',
      content: '今天完成了个人网站的设计，感觉还不错！No pain, no gain.',
      likes: 24,
      comments: 8
    },
    {
      id: 2,
      user: 'Avocado',
      avatar: '/images/default-avatar.jpg',
      time: '昨天',
      content: '学习前端设计2天半，对设计有浓厚的兴趣，喜欢尝试新的设计元素。',
      likes: 42,
      comments: 12
    },
    {
      id: 3,
      user: 'Avocado',
      avatar: '/images/default-avatar.jpg',
      time: '3天前',
      content: '尝试了一款新的Linux发行版，感觉很不错！继续探索。',
      likes: 18,
      comments: 5
    },
    {
      id: 4,
      user: 'Avocado',
      avatar: '/images/default-avatar.jpg',
      time: '5天前',
      content: '跑步5公里达成！运动后的感觉真好。',
      likes: 56,
      comments: 15
    },
    {
      id: 5,
      user: 'Avocado',
      avatar: '/images/default-avatar.jpg',
      time: '1周前',
      content: '旅行照片分享：河南的风景真的很美！',
      likes: 89,
      comments: 23
    },
    {
      id: 6,
      user: 'Avocado',
      avatar: '/images/default-avatar.jpg',
      time: '1周前',
      content: '新项目ZYYO主题开发中，为每个人设计的主题。',
      likes: 67,
      comments: 18
    }
  ];

  let currentPostCount = 0;
  const postsContainer = document.getElementById('postsContainer');
  const loadMoreBtn = document.getElementById('loadMorePosts');
  const newPostBtn = document.getElementById('newPost');

  if (!postsContainer || !loadMoreBtn || !newPostBtn) {
    console.warn('动态内容元素不存在，跳过初始化');
    return;
  }

  // 媒体上传功能
  const uploadPhotoBtn = document.getElementById('uploadPhoto');
  const uploadVideoBtn = document.getElementById('uploadVideo');
  const uploadMusicBtn = document.getElementById('uploadMusic');
  const musicOptions = document.getElementById('musicOptions');
  const uploadMP3Btn = document.getElementById('uploadMP3');
  const neteaseMusicBtn = document.getElementById('neteaseMusic');
  const photoInput = document.getElementById('photoInput');
  const videoInput = document.getElementById('videoInput');
  const musicInput = document.getElementById('musicInput');
  const neteaseMusicSelector = document.getElementById('neteaseMusicSelector');
  const closeSelectorBtn = document.getElementById('closeSelector');
  const neteaseMusicList = document.getElementById('neteaseMusicList');
  const mediaPreview = document.getElementById('mediaPreview');

  let uploadedMedia = [];

  // 加载动态
  window.loadPosts = function(refresh = false) {
    if (refresh) {
      currentPostCount = 0;
      postsContainer.innerHTML = '';
    }

    const postsToLoad = 3;
    const startIndex = currentPostCount;
    const endIndex = Math.min(startIndex + postsToLoad, mockPosts.length);

    for (let i = startIndex; i < endIndex; i++) {
      const post = mockPosts[i];
      const postElement = createPostElement(post);
      postsContainer.appendChild(postElement);
    }

    currentPostCount = endIndex;

    // 如果已经加载完所有动态，隐藏加载更多按钮
    if (currentPostCount >= mockPosts.length) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'block';
    }
  };

  // 创建动态元素
  function createPostElement(post) {
    const postEl = document.createElement('div');
    postEl.className = 'post-item';

    // 生成媒体内容HTML
    let mediaHTML = '';
    if (post.media && post.media.length > 0) {
      mediaHTML = '<div class="post-media">';
      post.media.forEach(media => {
        switch (media.type) {
          case 'photo':
            mediaHTML += `<div class="post-media-item photo"><img src="${media.url}" alt="${media.name}"></div>`;
            break;
          case 'video':
            mediaHTML += `<div class="post-media-item video"><video src="${media.url}" controls poster="${media.poster || media.url}" preload="metadata"></video></div>`;
            break;
          case 'music':
            if (media.source === 'netease') {
              // 网易云音乐显示歌曲信息
              mediaHTML += `
                <div class="post-media-item music">
                  <div class="music-info-preview">
                    <div class="music-title">${media.name}</div>
                    <div class="music-artist">${media.artist || '未知艺术家'}</div>
                  </div>
                  <audio src="${media.url}" controls></audio>
                </div>
              `;
            } else {
              // MP3文件
              mediaHTML += `<div class="post-media-item music"><audio src="${media.url}" controls></audio></div>`;
            }
            break;
        }
      });
      mediaHTML += '</div>';
    }

    postEl.innerHTML = `
      <div class="post-header">
        <img src="${post.avatar}" alt="头像" class="post-user-avatar">
        <div class="post-user-info">
          <h4>${post.user}</h4>
          <div class="post-time">${post.time}</div>
        </div>
      </div>
      <div class="post-content">
        ${post.content}
      </div>
      ${mediaHTML}
      <div class="post-actions">
        <div class="post-action like-btn" data-id="${post.id}">
          <i class="fas fa-thumbs-up"></i>
          <span>${post.likes}</span>
        </div>
        <div class="post-action comment-btn" data-id="${post.id}">
          <i class="fas fa-comment"></i>
          <span>${post.comments}</span>
        </div>
        <div class="post-action share-btn" data-id="${post.id}">
          <i class="fas fa-share"></i>
          <span>分享</span>
        </div>
      </div>
    `;

    return postEl;
  }

  // 加载更多动态
  loadMoreBtn.addEventListener('click', function() {
    loadPosts();
  });

  // 新动态按钮
  newPostBtn.addEventListener('click', function() {
    const postCreator = document.querySelector('.post-creator');
    if (postCreator) {
      postCreator.scrollIntoView({behavior: 'smooth'});
      const textarea = postCreator.querySelector('textarea');
      if (textarea) textarea.focus();
    }
  });

  // 照片上传
  if (uploadPhotoBtn && photoInput) {
    uploadPhotoBtn.addEventListener('click', () => photoInput.click());

    photoInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
          addMediaPreview('photo', event.target.result, file.name);
          uploadedMedia.push({ type: 'photo', url: event.target.result, name: file.name });
        };

        reader.readAsDataURL(file);
      }
    });
  }

  // 视频上传
  if (uploadVideoBtn && videoInput) {
    uploadVideoBtn.addEventListener('click', () => videoInput.click());

    videoInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];

        // 检查文件大小（限制为50MB）
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
          showMessage('视频文件太大，请选择小于50MB的文件', 'error');
          videoInput.value = '';
          return;
        }

        // 检查文件类型
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (!allowedTypes.includes(file.type)) {
          showMessage('请选择支持的视频格式（MP4、WebM、OGG、MOV）', 'error');
          videoInput.value = '';
          return;
        }

        // 创建对象URL而不是使用DataURL，提高性能
        const videoUrl = URL.createObjectURL(file);

        // 创建视频元素获取封面
        const video = document.createElement('video');
        video.src = videoUrl;
        video.currentTime = 0.1; // 设置时间点以获取封面

        video.addEventListener('loadeddata', () => {
          // 创建canvas来生成封面
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const posterUrl = canvas.toDataURL('image/jpeg', 0.8);

          addMediaPreview('video', videoUrl, file.name, posterUrl);
          uploadedMedia.push({
            type: 'video',
            url: videoUrl,
            name: file.name,
            poster: posterUrl
          });
        });

        video.addEventListener('error', () => {
          showMessage('视频加载失败，请选择其他文件', 'error');
          URL.revokeObjectURL(videoUrl);
        });
      }
    });
  }

  // 显示音乐选项
  if (uploadMusicBtn && musicOptions) {
    uploadMusicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      musicOptions.style.display = musicOptions.style.display === 'none' ? 'block' : 'none';
    });

    // 点击其他地方隐藏选项
    document.addEventListener('click', () => {
      musicOptions.style.display = 'none';
    });

    // 阻止音乐选项区域的点击事件冒泡
    musicOptions.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // MP3上传
  if (uploadMP3Btn && musicInput) {
    uploadMP3Btn.addEventListener('click', () => {
      musicOptions.style.display = 'none';
      musicInput.click();
    });

    musicInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];

        // 检查文件类型
        const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
        if (!allowedTypes.includes(file.type)) {
          showMessage('请选择支持的音频格式（MP3、WAV、OGG）', 'error');
          musicInput.value = '';
          return;
        }

        // 检查文件大小（限制为20MB）
        const maxSize = 20 * 1024 * 1024;
        if (file.size > maxSize) {
          showMessage('音频文件太大，请选择小于20MB的文件', 'error');
          musicInput.value = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          addMediaPreview('music', event.target.result, file.name);
          uploadedMedia.push({
            type: 'music',
            url: event.target.result,
            name: file.name,
            source: 'mp3'
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // 网易云音乐选择
  if (neteaseMusicBtn && neteaseMusicSelector) {
    neteaseMusicBtn.addEventListener('click', () => {
      musicOptions.style.display = 'none';
      showNeteaseMusicSelector();
    });
  }

  // 关闭选择器
  if (closeSelectorBtn) {
    closeSelectorBtn.addEventListener('click', () => {
      neteaseMusicSelector.style.display = 'none';
    });
  }

  // 显示网易云音乐选择器
  function showNeteaseMusicSelector() {
    // 从本地存储获取网易云音乐列表
    const savedMusicList = localStorage.getItem('neteaseMusicList');
    let musicList = [];

    if (savedMusicList) {
      musicList = JSON.parse(savedMusicList);
    } else {
      // 使用默认歌单
      musicList = [
        {
          id: '3343896205',
          title: '妈妈的话',
          artist: 'jade杰德',
          duration: '2:20'
        },
        {
          id: '3312133140',
          title: '太久',
          artist: '音乐马车',
          duration: '3:04'
        },
        {
          id: '2006950973',
          title: '无论你多怪异我还是会喜欢你',
          artist: '蒋蒋',
          duration: '2:01'
        }
      ];
    }

    // 清空音乐列表
    neteaseMusicList.innerHTML = '';

    if (musicList.length === 0) {
      neteaseMusicList.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.7); padding: 20px;">暂无音乐，请先在音乐播放器中添加歌曲</div>';
    } else {
      // 渲染音乐列表
      musicList.forEach((music, index) => {
        const musicItem = document.createElement('div');
        musicItem.className = 'netease-music-item';
        musicItem.dataset.id = music.id;
        musicItem.dataset.title = music.title;
        musicItem.dataset.artist = music.artist;

        musicItem.innerHTML = `
          <div class="music-icon">
            <i class="fas fa-music"></i>
          </div>
          <div class="music-info">
            <div class="music-title">${music.title}</div>
            <div class="music-artist">${music.artist}</div>
          </div>
        `;

        musicItem.addEventListener('click', () => {
          // 生成网易云音乐播放链接
          const musicUrl = `https://music.163.com/song/media/outer/url?id=${music.id}.mp3`;

          addMediaPreview('music', musicUrl, music.title);
          uploadedMedia.push({
            type: 'music',
            url: musicUrl,
            name: music.title,
            artist: music.artist,
            source: 'netease',
            id: music.id
          });

          neteaseMusicSelector.style.display = 'none';
          showMessage(`已添加：${music.title} - ${music.artist}`, 'success');
        });

        neteaseMusicList.appendChild(musicItem);
      });
    }

    neteaseMusicSelector.style.display = 'block';
  }

  // 添加媒体预览
  function addMediaPreview(type, url, name, posterUrl = null) {
    const mediaItem = document.createElement('div');
    mediaItem.className = 'media-preview-item';
    mediaItem.dataset.type = type;

    let mediaElement;
    switch (type) {
      case 'photo':
        mediaElement = document.createElement('img');
        mediaElement.src = url;
        mediaElement.alt = name;
        break;
      case 'video':
        mediaElement = document.createElement('video');
        mediaElement.src = url;
        mediaElement.controls = true;
        mediaElement.poster = posterUrl || url;
        mediaElement.preload = 'metadata';
        mediaElement.style.width = '100%';
        mediaElement.style.height = '100%';
        mediaElement.style.objectFit = 'cover';
        break;
      case 'music':
        mediaElement = document.createElement('audio');
        mediaElement.src = url;
        mediaElement.controls = true;
        mediaElement.title = name;
        break;
    }

    const removeBtn = document.createElement('button');
    removeBtn.className = 'media-preview-remove';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', () => {
      mediaItem.remove();
      uploadedMedia = uploadedMedia.filter(item => item.url !== url);

      // 释放对象URL，避免内存泄漏
      if (type === 'video' && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    mediaItem.appendChild(mediaElement);
    mediaItem.appendChild(removeBtn);
    mediaPreview.appendChild(mediaItem);
  }

  // 发布动态
  const postBtn = document.getElementById('publishPost');
  const postTextarea = document.querySelector('.post-creator textarea');

  if (postBtn && postTextarea) {
    postBtn.addEventListener('click', function() {
      const content = postTextarea.value.trim();

      if (!content && uploadedMedia.length === 0) {
        showMessage('请输入内容或上传媒体再发布！', 'error');
        return;
      }

      // 创建新动态
      const newPost = {
        id: mockPosts.length + 1,
        user: 'Avocado',
        avatar: document.getElementById('userAvatar')?.src || '/images/default-avatar.jpg',
        time: '刚刚',
        content: content,
        media: uploadedMedia,
        likes: 0,
        comments: 0
      };

      // 添加到动态列表顶部
      const postElement = createPostElement(newPost);
      postsContainer.insertBefore(postElement, postsContainer.firstChild);

      // 清空输入和预览
      postTextarea.value = '';
      if (mediaPreview) {
        mediaPreview.innerHTML = '';
      }
      uploadedMedia = [];

      // 重置文件输入
      if (photoInput) photoInput.value = '';
      if (videoInput) videoInput.value = '';
      if (musicInput) musicInput.value = '';

      // 显示成功消息
      showMessage('动态发布成功！', 'success');
    });
  }

  // 动态点赞功能
  postsContainer.addEventListener('click', function(e) {
    if (e.target.closest('.like-btn')) {
      const likeBtn = e.target.closest('.like-btn');
      const likeCount = likeBtn.querySelector('span');
      const likeIcon = likeBtn.querySelector('i');

      if (likeBtn.classList.contains('liked')) {
        likeCount.textContent = parseInt(likeCount.textContent) - 1;
        likeBtn.classList.remove('liked');
        likeIcon.style.color = '';
      } else {
        likeCount.textContent = parseInt(likeCount.textContent) + 1;
        likeBtn.classList.add('liked');
        likeIcon.style.color = '#667eea';
      }
    }
  });

  // 初始加载动态
  loadPosts();
}

/**
 * 初始化导航栏
 */
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      navItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
    });
  });
}


/**
 * 显示消息函数
 */
function showMessage(message, type) {
  const messageEl = document.createElement('div');
  messageEl.className = `message ${type}`;
  messageEl.textContent = message;
  messageEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${type === 'success' ? '#4CAF50' : '#f44336'};
    color: white;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(messageEl);

  setTimeout(() => {
    messageEl.style.animation = 'slideOut 0.3s ease-out forwards';
    setTimeout(() => {
      if (messageEl.parentNode) {
        document.body.removeChild(messageEl);
      }
    }, 300);
  }, 3000);
}


// 顶部导航栏锚点跳转功能
document.addEventListener('DOMContentLoaded', function() {
  const topNavLinks = document.querySelectorAll('.navbar .nav-item a[href^="#"]');

  topNavLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        // 平滑滚动到目标元素
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        console.log('跳转到:', targetId);
      }
    });
  });

  console.log('导航栏锚点功能已启用');
});
